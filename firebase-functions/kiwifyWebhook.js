const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

const PLAN_MAP = {
    pro_mensal: { plan: 'pro_monthly', monthsToAdd: 1 },
    pro_anual: { plan: 'pro_annual', monthsToAdd: 12 },
};

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function resolveCoupleId(payload) {
    return (
        payload?.metadata?.coupleId ||
        payload?.metadata?.spaceId ||
        payload?.custom_fields?.coupleId ||
        payload?.custom_fields?.spaceId ||
        null
    );
}

function resolvePlanKey(payload) {
    const planSlug =
        payload?.product_slug ||
        payload?.product?.slug ||
        payload?.plan ||
        payload?.product_id;
    if (!planSlug) return null;
    const normalized = String(planSlug).toLowerCase();
    if (normalized.includes('mensal')) return 'pro_mensal';
    if (normalized.includes('anual')) return 'pro_anual';
    return normalized;
}

exports.kiwifyWebhook = functions
    .runWith({ secrets: ['KIWIFY_WEBHOOK_SECRET'] })
    .https.onRequest(async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method not allowed');
            return;
        }

        const secret = process.env.KIWIFY_WEBHOOK_SECRET;
        if (!secret) {
            console.error('KIWIFY_WEBHOOK_SECRET não configurada');
            res.status(500).send('Misconfigured');
            return;
        }

        const signatureHeader = req.get('X-Kiwify-Signature');
        if (!signatureHeader) {
            console.warn('Webhook sem assinatura');
            res.status(401).send('Missing signature');
            return;
        }

        const computedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.rawBody)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(computedSignature))) {
            console.warn('Assinatura inválida');
            res.status(401).send('Invalid signature');
            return;
        }

        const { event, data } = req.body || {};
        if (!data) {
            res.status(200).send('No data');
            return;
        }

        // Apenas processa eventos de pagamento aprovado
        const isPaid =
            event === 'order.approved' ||
            event === 'subscription.approved' ||
            data?.status === 'paid';

        if (!isPaid) {
            res.status(200).send('Ignored');
            return;
        }

        let coupleId = resolveCoupleId(data);
        if (!coupleId) {
            const email =
                data?.customer_email ||
                data?.customer?.email ||
                data?.buyer?.email ||
                null;
            if (email) {
                const userSnap = await db
                    .collection('users')
                    .where('email', '==', email.toLowerCase())
                    .limit(1)
                    .get();
                if (!userSnap.empty) {
                    coupleId = userSnap.docs[0].get('coupleId') || null;
                }
            }
        }
        if (!coupleId) {
            console.error('Webhook recebido sem coupleId identificável', { data });
            res.status(200).send('Missing coupleId');
            return;
        }

        const planKey = resolvePlanKey(data);
        const planConfig = PLAN_MAP[planKey];

        if (!planConfig) {
            console.error('Plano não reconhecido', { planKey, data });
            res.status(200).send('Unknown plan');
            return;
        }

        const spaceRef = db.collection('devotionalSpaces').doc(coupleId);
        const spaceSnap = await spaceRef.get();
        if (!spaceSnap.exists) {
            console.error('Espaço não encontrado para coupleId', coupleId);
            res.status(200).send('Space not found');
            return;
        }

        const now = new Date();
        const currentBilling = spaceSnap.get('billing') || {};
        const currentExpiration = currentBilling.subscriptionExpiresAt
            ? new Date(currentBilling.subscriptionExpiresAt)
            : null;

        const baseDate =
            currentExpiration && currentExpiration > now ? currentExpiration : now;
        const newExpiration = addMonths(baseDate, planConfig.monthsToAdd);

        const update = {
            billing: {
                ...currentBilling,
                status: 'pro',
                plan: planConfig.plan,
                subscriptionStartedAt: currentBilling.subscriptionStartedAt || now.toISOString(),
                subscriptionExpiresAt: newExpiration.toISOString(),
                lastPaymentAt: now.toISOString(),
                lastWebhookEventId: data?.id || data?.transaction_id || null,
                lastWebhookReceivedAt: now.toISOString(),
                gateway: 'kiwify',
            },
        };

        await spaceRef.set(update, { merge: true });

        console.info('Assinatura atualizada para', coupleId, update.billing);
        res.status(200).send('OK');
    });
