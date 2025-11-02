import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHUBmJPMxuaNSFWFZo0v4yJS4gJ-80exs",
  authDomain: "jornada-devocional.firebaseapp.com",
  projectId: "jornada-devocional",
  storageBucket: "jornada-devocional.firebasestorage.app",
  messagingSenderId: "831673625785",
  appId: "1:831673625785:web:9b05437e343782d00b7f68"
};

const BIBLE_DATA = {
  ot: [
    { name: "Gênesis", chapters: 50 },
    { name: "Êxodo", chapters: 40 },
    { name: "Levítico", chapters: 27 },
    { name: "Números", chapters: 36 },
    { name: "Deuteronômio", chapters: 34 },
    { name: "Josué", chapters: 24 },
    { name: "Juízes", chapters: 21 },
    { name: "Rute", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 },
    { name: "1 Reis", chapters: 22 },
    { name: "2 Reis", chapters: 25 },
    { name: "1 Crônicas", chapters: 29 },
    { name: "2 Crônicas", chapters: 36 },
    { name: "Esdras", chapters: 10 },
    { name: "Neemias", chapters: 13 },
    { name: "Ester", chapters: 10 },
    { name: "Jó", chapters: 42 },
    { name: "Salmos", chapters: 150 },
    { name: "Provérbios", chapters: 31 },
    { name: "Eclesiastes", chapters: 12 },
    { name: "Cânticos", chapters: 8 },
    { name: "Isaías", chapters: 66 },
    { name: "Jeremias", chapters: 52 },
    { name: "Lamentações", chapters: 5 },
    { name: "Ezequiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },
    { name: "Oseias", chapters: 14 },
    { name: "Joel", chapters: 3 },
    { name: "Amós", chapters: 9 },
    { name: "Obadias", chapters: 1 },
    { name: "Jonas", chapters: 4 },
    { name: "Miqueias", chapters: 7 },
    { name: "Naum", chapters: 3 },
    { name: "Habacuque", chapters: 3 },
    { name: "Sofonias", chapters: 3 },
    { name: "Ageu", chapters: 2 },
    { name: "Zacarias", chapters: 14 },
    { name: "Malaquias", chapters: 4 }
  ],
  nt: [
    { name: "Mateus", chapters: 28 },
    { name: "Marcos", chapters: 16 },
    { name: "Lucas", chapters: 24 },
    { name: "João", chapters: 21 },
    { name: "Atos", chapters: 28 },
    { name: "Romanos", chapters: 16 },
    { name: "1 Coríntios", chapters: 16 },
    { name: "2 Coríntios", chapters: 13 },
    { name: "Gálatas", chapters: 6 },
    { name: "Efésios", chapters: 6 },
    { name: "Filipenses", chapters: 4 },
    { name: "Colossenses", chapters: 4 },
    { name: "1 Tessalonicenses", chapters: 5 },
    { name: "2 Tessalonicenses", chapters: 3 },
    { name: "1 Timóteo", chapters: 6 },
    { name: "2 Timóteo", chapters: 4 },
    { name: "Tito", chapters: 3 },
    { name: "Filemom", chapters: 1 },
    { name: "Hebreus", chapters: 13 },
    { name: "Tiago", chapters: 5 },
    { name: "1 Pedro", chapters: 5 },
    { name: "2 Pedro", chapters: 3 },
    { name: "1 João", chapters: 5 },
    { name: "2 João", chapters: 1 },
    { name: "3 João", chapters: 1 },
    { name: "Judas", chapters: 1 },
    { name: "Apocalipse", chapters: 22 }
  ]
};

const TOTAL_CHAPTERS = 1189;
const TRIAL_DURATION_DAYS = 3;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

const FEATURE_MATRIX = {
  pro: {
    'bible-progress': true,
    checkin: true,
    notes: true,
    goals: true,
    prayers: true,
    journal: true,
    comments: true,
    statistics: true,
    'general-edit': true
  },
  trial: {
    'bible-progress': true,
    checkin: false,
    notes: false,
    goals: false,
    prayers: false,
    journal: false,
    comments: false,
    statistics: false,
    'general-edit': false
  },
  locked: {
    'bible-progress': false,
    checkin: false,
    notes: false,
    goals: false,
    prayers: false,
    journal: false,
    comments: false,
    statistics: false,
    'general-edit': false
  }
};

const FEATURE_MESSAGES = {
  'bible-progress': {
    title: "Acompanhe sua leitura com o Pro",
    description: "Marque capítulos lidos, acompanhe o progresso em casal e continue a jornada bíblica após o período de teste."
  },
  notes: {
    title: "Anotações exclusivas do Pro",
    description: "Guarde aprendizados e aplicações práticas. Disponível com o plano Pro."
  },
  goals: {
    title: "Metas compartilhadas",
    description: "Defina objetivos e mantenha o casal alinhado. Desbloqueie com o plano Pro."
  },
  prayers: {
    title: "Mural de oração completo",
    description: "Cadastre, destaque e acompanhe pedidos de oração ilimitados com o Pro."
  },
  journal: {
    title: "Diário espiritual",
    description: "Registre reflexões diárias e compartilhe com seu parceiro(a). Disponível no plano Pro."
  },
  checkin: {
    title: "Check-in diário Pro",
    description: "Marque que o devocional foi feito e motive o casal com o plano Pro."
  },
  statistics: {
    title: "Estatísticas avançadas",
    description: "Controle dias na igreja e veja estatísticas detalhadas assinando o Pro."
  },
  comments: {
    title: "Comentários nas orações",
    description: "Comente, celebre respostas e envie encorajamentos usando o plano Pro."
  },
  'general-edit': {
    title: "Edição disponível no Pro",
    description: "Editar e reorganizar conteúdos está disponível para assinantes Pro."
  }
};

const PLAN_LINKS = {
  monthly: "https://pay.kiwify.com.br/2Dby8tb",
  annual: "https://pay.kiwify.com.br/RnnNNeQ"
};

let auth;
let db;
let currentUser = null;
let userProfile = null;
let coupleId = null;
let devotionalSpace = null;
let unsubscribeSpace = null;
let deferredInstallPrompt = null;
let spaceAccess = { status: 'locked', plan: null, trialEndsAt: null, subscriptionExpiresAt: null, raw: null };
let currentNoteFilterTag = null;
let currentPrayerFilterTag = null;
let currentJournalFilter = 'shared';
let draggedItemId = null;
let draggedItemType = null;
let activePrayerDropdown = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const loadingScreen = $('#loading-screen');
const loginScreen = $('#login-screen');
const couplingScreen = $('#coupling-screen');
const mainApp = $('#main-app');
const toast = $('#toast');
const toastMessage = $('#toast-message');
const mainContent = $('#main-content');
const desktopTabNav = $('#desktop-tab-nav');
const bottomNav = $('#bottom-nav');
const desktopBibleProgress = $('#bible-progress-summary');
const desktopBibleBooks = $('#bible-books-container');
const mobileBibleWrapper = $('#mobile-bible-content-wrapper');
const billingBanner = $('#billing-banner');
const billingStatusChip = $('#billing-status-chip');
const billingHeading = $('#billing-heading');
const billingSubheading = $('#billing-subheading');
const billingCtaButton = $('#billing-cta');
const billingMoreButton = $('#billing-more');
const editModal = $('#edit-modal');
const editForm = $('#edit-form');
const connectPartnerModal = $('#connect-partner-modal');
const upgradeModal = $('#upgrade-modal');
const openUpgradeHeaderButton = $('#open-upgrade-modal');
const closeUpgradeModalButton = $('#close-upgrade-modal');
const refreshAccessButton = $('#refresh-access-button');
const monthlyPlanLink = $('#kiwify-monthly-link');
const annualPlanLink = $('#kiwify-annual-link');
const userMenuToggle = $('#user-menu-toggle');
const userMenu = $('#user-menu');
const installBanner = $('#pwa-install-banner');
const installAppButton = $('#install-app-button');
const dismissInstallBannerButton = $('#dismiss-install-banner');
const iosInstallButton = $('#ios-install-button');
const pwaInstructionsModal = $('#pwa-instructions-modal');
const closePwaInstructionsButton = $('#close-pwa-instructions');
const pwaInstructionsOkButton = $('#pwa-instructions-ok');

const themeToggleButton = $('#theme-toggle-button');
const sunIcon = $('#theme-icon-sun');
const moonIcon = $('#theme-icon-moon');

const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const INSTALL_BANNER_DISMISS_KEY = 'pwa-install-banner-dismissed-v1';

const PLAN_LINK_TARGET = {
  trial: 'trial',
  pro: 'pro',
  locked: 'locked'
};

const isStandaloneDisplay = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (sunIcon && moonIcon) {
    sunIcon.classList.toggle('hidden', theme === 'dark');
    moonIcon.classList.toggle('hidden', theme !== 'dark');
  }
}

function toggleTheme() {
  const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

function createInitialBilling(baseDate = new Date()) {
  const trialEndsAt = new Date(baseDate.getTime() + TRIAL_DURATION_MS);
  return {
    status: 'trial',
    plan: 'trial',
    trialStartedAt: baseDate.toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
    subscriptionStartedAt: null,
    subscriptionExpiresAt: null,
    lastUpdatedAt: baseDate.toISOString(),
    gateway: 'kiwify'
  };
}

function getFeatureCopy(feature) {
  return FEATURE_MESSAGES[feature] || FEATURE_MESSAGES['general-edit'];
}

function getLockedSectionHTML(feature) {
  const copy = getFeatureCopy(feature);
  return `<div class="feature-locked-card rounded-xl p-6 text-center space-y-3">
    <div class="flex items-center justify-center space-x-2">
      <i data-lucide="lock-keyhole" class="w-5 h-5 text-primary-dark dark:text-primary-light"></i>
      <h3 class="text-lg font-semibold text-primary-dark dark:text-primary-light">${copy.title}</h3>
    </div>
    <p class="text-sm text-slate-700 dark:text-slate-300">${copy.description}</p>
    <button data-action="open-upgrade-modal" class="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors">
      <i data-lucide="sparkles" class="w-4 h-4"></i><span>Quero liberar</span>
    </button>
  </div>`;
}

function getLockedBibleHTML() {
  const card = getLockedSectionHTML('bible-progress');
  return { progressHTML: card, booksHTML: '', chaptersRead: 0 };
}

function computeSpaceAccess(space) {
  const billing = space.billing || null;
  const now = new Date();
  if (!billing) return { status: 'locked', plan: null, trialEndsAt: null, subscriptionExpiresAt: null, raw: null };
  const trialEndsAt = billing.trialEndsAt ? new Date(billing.trialEndsAt) : null;
  const subscriptionExpiresAt = billing.subscriptionExpiresAt ? new Date(billing.subscriptionExpiresAt) : null;
  let status = billing.status || 'trial';
  if (status === 'trial' && trialEndsAt && trialEndsAt <= now) status = 'locked';
  if (billing.status === 'pro') {
    if (!subscriptionExpiresAt || subscriptionExpiresAt > now) status = 'pro';
    else if (trialEndsAt && trialEndsAt > now) status = 'trial';
    else status = 'locked';
  }
  return { status, plan: billing.plan || null, trialEndsAt, subscriptionExpiresAt, raw: billing };
}

function hasFeatureAccess(feature) {
  const matrix = FEATURE_MATRIX[spaceAccess.status] || FEATURE_MATRIX.locked;
  return !!(matrix && matrix[feature]);
}

function ensureFeatureAccess(feature) {
  if (hasFeatureAccess(feature)) return true;
  showPaywall(feature);
  return false;
}

function showPaywall(feature) {
  const copy = getFeatureCopy(feature);
  showToast(copy.title, 'error');
  openUpgradeModal();
}

function formatTrialCountdown(endDate) {
  if (!endDate) return '';
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'expirou';
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const diffDays = Math.floor(diffMs / dayMs);
  if (diffDays > 0) return diffDays === 1 ? 'termina em 1 dia' : `termina em ${diffDays} dias`;
  const diffHours = Math.floor(diffMs / hourMs);
  if (diffHours > 0) return diffHours === 1 ? 'termina em 1 hora' : `termina em ${diffHours} horas`;
  return 'termina em poucos minutos';
}

function updateBillingBanner() {
  const isPro = spaceAccess.status === 'pro';
  if (openUpgradeHeaderButton) openUpgradeHeaderButton.classList.toggle('hidden', isPro);
  if (!billingBanner) return;
  if (isPro) {
    billingBanner.classList.add('hidden');
    return;
  }
  billingBanner.classList.remove('hidden');
  if (spaceAccess.status === 'trial') {
    billingStatusChip.textContent = 'Teste ativo';
    billingHeading.textContent = `Período de teste ${formatTrialCountdown(spaceAccess.trialEndsAt)}`;
    billingSubheading.textContent = 'Acompanhe a leitura por 3 dias gratuitamente. Assine o Pro para manter o progresso e liberar as demais ferramentas. Use o mesmo e-mail da sua conta Google ao finalizar a compra.';
  } else {
    billingStatusChip.textContent = 'Acesso limitado';
    billingHeading.textContent = 'Desbloqueie todas as funcionalidades com o Pro';
    billingSubheading.textContent = 'Seu teste gratuito terminou. Assine o plano mensal ou anual para voltar a registrar progresso e novas entradas usando o mesmo e-mail da conta Google.';
  }
}

function openUpgradeModal() {
  if (!upgradeModal) return;
  closeUserMenu();
  upgradeModal.classList.remove('hidden');
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.add('hidden');
}

function showInstallBanner() {
  if (!installBanner || isStandaloneDisplay()) return;
  installBanner.classList.remove('hidden');
}

function hideInstallBanner() {
  if (!installBanner) return;
  installBanner.classList.add('hidden');
}

function openPwaInstructions() {
  if (!pwaInstructionsModal) return;
  closeUserMenu();
  pwaInstructionsModal.classList.remove('hidden');
}

function closePwaInstructions() {
  if (!pwaInstructionsModal) return;
  pwaInstructionsModal.classList.add('hidden');
}

function setupPWA() {
  const heartIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.83 2.83a2.82 2.82 0 0 1 0 3.79l-1.9 2.07c-.78.78-.75 2.09.07 3 .82.82 2.26.85 3.08 0l2.96-2.96"/></svg>`;
  const iconSvgDataUrl = `data:image/svg+xml,${encodeURIComponent(heartIconSVG)}`;
  const manifest = {
    name: 'Jornada Devocional',
    short_name: 'Jornada',
    start_url: './',
    display: 'standalone',
    display_override: ['fullscreen', 'standalone'],
    background_color: '#fdf2f8',
    theme_color: '#f43f5e',
    scope: './',
    icons: [
      { src: iconSvgDataUrl, sizes: '192x192', type: 'image/svg+xml' },
      { src: iconSvgDataUrl, sizes: '512x512', type: 'image/svg+xml' }
    ]
  };
  const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/json' }));
  const manifestLink = document.querySelector('#manifest-link');
  const appleIcon = document.querySelector('#apple-touch-icon');
  if (manifestLink) manifestLink.setAttribute('href', manifestUrl);
  if (appleIcon) appleIcon.setAttribute('href', iconSvgDataUrl);

  if (!('serviceWorker' in navigator)) return;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  const isSecure = location.protocol === 'https:' || isLocalhost;
  if (!isSecure) return;

  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('Falha ao registrar service worker:', err);
  });
}

function initializePWAInstallHandling() {
  if (isStandaloneDisplay()) {
    hideInstallBanner();
    return;
  }

  if (isIOS) {
    iosInstallButton?.classList.remove('hidden');
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    iosInstallButton?.classList.add('hidden');
    const dismissed = localStorage.getItem(INSTALL_BANNER_DISMISS_KEY);
    if (!isIOS && !dismissed) showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
    localStorage.removeItem(INSTALL_BANNER_DISMISS_KEY);
  });

  if (installAppButton) {
    installAppButton.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          hideInstallBanner();
          localStorage.removeItem(INSTALL_BANNER_DISMISS_KEY);
        }
        deferredInstallPrompt = null;
      } else {
        openPwaInstructions();
      }
    });
  }

  dismissInstallBannerButton?.addEventListener('click', () => {
    hideInstallBanner();
    localStorage.setItem(INSTALL_BANNER_DISMISS_KEY, 'true');
  });

  iosInstallButton?.addEventListener('click', (e) => {
    e.preventDefault();
    openPwaInstructions();
  });

  closePwaInstructionsButton?.addEventListener('click', closePwaInstructions);
  pwaInstructionsOkButton?.addEventListener('click', closePwaInstructions);
  pwaInstructionsModal?.addEventListener('click', (e) => {
    if (e.target === pwaInstructionsModal) closePwaInstructions();
  });
}

function showScreen(screen) {
  [loadingScreen, loginScreen, couplingScreen, mainApp].forEach((el) => {
    if (!el) return;
    el.classList.add('hidden');
  });
  screen.classList.remove('hidden');
  if (screen !== mainApp) document.body.classList.remove('locked-app');
}

function showToast(message, type = 'success') {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = message;
  toast.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
  toast.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showTab(tabName) {
  $$('.tab-panel').forEach((panel) => panel.classList.add('hidden'));
  const panelToShow = $(`#tab-${tabName}`);
  if (panelToShow) panelToShow.classList.remove('hidden');
  $$('#desktop-tab-nav .tab-button, #bottom-nav .bottom-nav-button').forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active-tab', isActive);
    btn.classList.toggle('active-nav-button', isActive);
  });
  const mobileBibleBtn = $('#mobile-bible-button');
  if (mobileBibleBtn) {
    mobileBibleBtn.classList.toggle('active-nav-button', tabName === 'biblia');
    mobileBibleBtn.classList.toggle('bg-primary-dark', tabName === 'biblia');
    mobileBibleBtn.classList.toggle('bg-primary', tabName !== 'biblia');
  }
  renderIcons();
}

function openUserMenu() {
  if (!userMenu) return;
  userMenu.classList.remove('hidden');
  userMenuToggle?.setAttribute('aria-expanded', 'true');
}

function closeUserMenu() {
  if (!userMenu) return;
  userMenu.classList.add('hidden');
  userMenuToggle?.setAttribute('aria-expanded', 'false');
}

function toggleUserMenu(e) {
  e.preventDefault();
  if (!userMenu) return;
  if (userMenu.classList.contains('hidden')) openUserMenu();
  else closeUserMenu();
}

function ensurePlanLinks() {
  if (monthlyPlanLink) monthlyPlanLink.href = PLAN_LINKS.monthly || '#';
  if (annualPlanLink) annualPlanLink.href = PLAN_LINKS.annual || '#';
}

function renderHeader() {
  const headerAvatar = $('#header-avatar');
  const headerCoupleId = $('#header-couple-id');
  if (headerAvatar) headerAvatar.src = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Usuário'}&background=fecdd3&color=be123c`;
  if (headerCoupleId) headerCoupleId.textContent = `ID: ${coupleId || '...'}`;
  closeUserMenu();
}

function getBibleViewHTML() {
  const progress = devotionalSpace?.bibleProgress || {};
  let chaptersRead = 0;
  const renderBook = (book) => {
    let bookChaptersRead = 0;
    const chapterButtons = Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => {
      const readTimestamp = progress[book.name]?.[chapter];
      if (readTimestamp) bookChaptersRead += 1;
      const isRead = Boolean(readTimestamp);
      return `<button data-action="toggle-chapter" data-book="${book.name}" data-chapter="${chapter}" class="chapter-button w-9 h-9 rounded-full flex items-center justify-center font-medium transition-colors ${isRead ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}">${chapter}</button>`;
    }).join('');
    chaptersRead += bookChaptersRead;
    return `<div class="accordion-item bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      <button class="accordion-toggle w-full flex items-center justify-between p-3 text-left group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <span class="font-semibold text-slate-700 dark:text-slate-300 flex-grow break-words mr-2">${book.name}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap mr-1">(${bookChaptersRead}/${book.chapters})</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500 dark:text-slate-400 accordion-icon transition-transform flex-shrink-0"></i>
      </button>
      <div class="accordion-content">
        <div class="p-3 border-t border-slate-100 dark:border-slate-700">
          <div class="flex flex-wrap gap-2">${chapterButtons}</div>
        </div>
      </div>
    </div>`;
  };
  const otBooksHTML = BIBLE_DATA.ot.map(renderBook).join('');
  const ntBooksHTML = BIBLE_DATA.nt.map(renderBook).join('');
  const percent = ((chaptersRead / TOTAL_CHAPTERS) * 100).toFixed(0);
  const progressHTML = `<div class="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1"><span>Progresso Total</span><span class="font-semibold">${percent}%</span></div><div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div class="bg-primary h-2.5 rounded-full" style="width: ${percent}%"></div></div>`;
  const booksHTML = `<h3 class="font-semibold text-lg mb-2 dark:text-slate-200">Antigo Testamento</h3><div class="space-y-2 mb-4">${otBooksHTML}</div><h3 class="font-semibold text-lg mb-2 dark:text-slate-200">Novo Testamento</h3><div class="space-y-2">${ntBooksHTML}</div>`;
  return { progressHTML, booksHTML, chaptersRead };
}

function renderCheckinCard() {
  const container = $('#checkin-card');
  if (!container) return;
  if (!hasFeatureAccess('checkin')) {
    container.innerHTML = getLockedSectionHTML('checkin');
    renderIcons();
    return;
  }
  const checkins = devotionalSpace?.checkins || {};
  const myCheckin = checkins[currentUser?.uid];
  const partnerUid = (devotionalSpace?.members || []).find((uid) => uid !== currentUser?.uid);
  const partnerCheckin = partnerUid ? checkins[partnerUid] : null;
  const alreadyCheckedInToday = isToday(myCheckin);
  container.innerHTML = `<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Check-in Diário</h3>
    <div class="space-y-2 mb-4 text-sm">
      <p>Seu último check-in: <span class="font-medium ${isToday(myCheckin) ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}">${formatDateStatus(myCheckin)}</span></p>
      ${partnerUid ? `<p>Último check-in do par: <span class="font-medium ${isToday(partnerCheckin) ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}">${formatDateStatus(partnerCheckin)}</span></p>` : ''}
    </div>
    <button data-action="checkin" class="w-full text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${alreadyCheckedInToday ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}" ${alreadyCheckedInToday ? 'disabled' : ''}>
      <i data-lucide="check-circle" class="w-5 h-5"></i><span>${alreadyCheckedInToday ? 'Feito Hoje!' : 'Fiz meu devocional!'}</span>
    </button>`;
  renderIcons();
}

function renderStatsCards() {
  const streakCard = $('#streak-card');
  const weeklyReadCard = $('#weekly-read-card');
  const popularTagsCard = $('#popular-tags-card');
  if (!streakCard || !weeklyReadCard || !popularTagsCard) return;
  const streak = calculateReadingStreak(devotionalSpace?.bibleProgress);
  const weeklyChapters = calculateChaptersThisWeek(devotionalSpace?.bibleProgress);
  const popularTags = getPopularTags(devotionalSpace?.notes, devotionalSpace?.prayers);
  streakCard.innerHTML = `<div class="flex items-center space-x-3"><div class="p-3 rounded-full bg-orange-100 text-orange-600"><i data-lucide="flame" class="w-6 h-6"></i></div><div><h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Maior Sequência</h3><span class="text-3xl font-bold text-slate-800 dark:text-slate-200">${streak} ${streak === 1 ? 'dia' : 'dias'}</span></div></div>`;
  weeklyReadCard.innerHTML = `<div class="flex items-center space-x-3"><div class="p-3 rounded-full bg-purple-100 text-purple-600"><i data-lucide="calendar-check-2" class="w-6 h-6"></i></div><div><h3 class="text-sm font-medium text-slate-5...
  popularTagsCard.innerHTML = `<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Tags Populares</h3>${popularTags.length > 0 ? `<div class="flex flex-wrap gap-2">${popularTags.map((tag) => `<span class="tag-badge text-sm px-3 py-1 rounded-full">${tag}</span>`).join('')}</div>` : '<p class="text-sm text-slate-500 dark:text-slate-400">Nenhuma tag usada.</p>'}`;
  renderIcons();
}

function renderTagFilters(containerId, items, currentFilter, filterAction) {
  const container = $(containerId);
  if (!container) return;
  const allTags = new Set();
  (items || []).forEach((item) => (item.tags || []).forEach((tag) => allTags.add(tag)));
  const uniqueTags = [...allTags].sort();
  container.innerHTML = `<button data-action="${filterAction}" data-tag="" class="filter-button px-2.5 py-1 text-xs rounded-full border border-slate-300 dark:border-slate-600 ${!currentFilter ? 'active-filter' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}">Todas</button>${uniqueTags.map((tag) => `<button data-action="${filterAction}" data-tag="${tag}" class="filter-button tag-badge px-2.5 py-1 text-xs rounded-full border border-transparent ${currentFilter === tag ? 'active-filter opacity-100' : 'opacity-75 hover:opacity-100'}">${tag}</button>`).join('')}`;
  renderIcons();
}

function renderNotesTab() {
  const list = $('#notes-list');
  const form = $('#add-note-form');
  const searchInput = $('#search-notes');
  if (!list) return;
  const notes = devotionalSpace?.notes || [];
  const canUseNotes = hasFeatureAccess('notes');
  if (form) form.classList.toggle('hidden', !canUseNotes);
  if (searchInput) searchInput.classList.toggle('hidden', !canUseNotes);
  if (!canUseNotes) {
    const filtersContainer = $('#note-filters');
    if (filtersContainer) filtersContainer.innerHTML = '';
    list.innerHTML = getLockedSectionHTML('notes');
    renderIcons();
    return;
  }
  renderTagFilters('#note-filters', notes, currentNoteFilterTag, 'filter-notes');
  const searchTerm = (searchInput?.value || '').toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const matchesTag = !currentNoteFilterTag || (note.tags || []).includes(currentNoteFilterTag);
    const matchesSearch = !searchTerm || (note.ref && note.ref.toLowerCase().includes(searchTerm)) || (note.text && note.text.toLowerCase().includes(searchTerm));
    return matchesTag && matchesSearch;
  });
  if (filteredNotes.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma anotação ${currentNoteFilterTag ? `com tag "${currentNoteFilterTag}"` : ''}.</p>`;
    return;
  }
  const dateFormat = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
  list.innerHTML = filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((note) => `<div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-secondary dark:bg-slate-800/50">
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-bold text-primary-dark dark:text-primary-light mr-2">${note.ref || ''}</h4>
        <div class="flex space-x-2 flex-shrink-0">
          <button data-action="edit-note" data-id="${note.id}" class="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
          <button data-action="copy-note" data-id="${note.id}" class="text-slate-500 dark:text-slate-400 hover:text-green-500"><i data-lucide="copy" class="w-4 h-4"></i></button>
          <button data-action="delete-note" data-id="${note.id}" class="text-slate-500 dark:text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      </div>
      <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words mb-2">${note.text}</p>
      ${(note.tags && note.tags.length > 0) ? `<div class="flex flex-wrap gap-1.5 mb-2">${note.tags.map((tag) => `<span class="tag-badge text-xs px-2 py-0.5 rounded-full">${tag}</span>`).join('')}</div>` : ''}
      <p class="text-xs text-slate-400">Por: ${note.author?.name || '...'} | ${new Date(note.createdAt).toLocaleString('pt-BR', dateFormat)}</p>
    </div>`).join('');
  renderIcons();
}

function renderGoalsTab() {
  const list = $('#goals-list');
  const form = $('#add-goal-form');
  if (!list) return;
  const goals = devotionalSpace?.goals || [];
  const canUseGoals = hasFeatureAccess('goals');
  if (form) form.classList.toggle('hidden', !canUseGoals);
  if (!canUseGoals) {
    list.innerHTML = getLockedSectionHTML('goals');
    renderIcons();
    return;
  }
  if (goals.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma meta.</p>`;
    return;
  }
  list.innerHTML = goals.map((goal, index) => `<div draggable="true" data-id="${goal.id}" data-type="goal" data-index="${index}" class="draggable-item flex items-start justify-between space-x-3 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
      <div class="flex items-start flex-grow space-x-3">
        <input type="checkbox" data-action="toggle-goal" data-id="${goal.id}" class="h-5 w-5 rounded text-primary focus:ring-primary flex-shrink-0 mt-0.5" ${goal.completed ? 'checked' : ''}>
        <div class="flex-1">
          <label class="text-slate-700 dark:text-slate-300 ${goal.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}">${goal.text}</label>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Por: ${goal.author?.name || '...'}</p>
        </div>
      </div>
      <div class="flex space-x-2 flex-shrink-0">
        <button data-action="edit-goal" data-id="${goal.id}" class="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 -m-1"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
        <button data-action="delete-goal" data-id="${goal.id}" class="text-slate-400 hover:text-red-500 p-1 -m-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </div>
    </div>`).join('');
  renderIcons();
}

function renderPrayerTab() {
  const list = $('#prayers-list');
  const form = $('#add-prayer-form');
  if (!list) return;
  const prayers = devotionalSpace?.prayers || [];
  const canUsePrayers = hasFeatureAccess('prayers');
  if (form) form.classList.toggle('hidden', !canUsePrayers);
  if (!canUsePrayers) {
    const filtersContainer = $('#prayer-filters');
    if (filtersContainer) filtersContainer.innerHTML = '';
    list.innerHTML = getLockedSectionHTML('prayers');
    renderIcons();
    return;
  }
  renderTagFilters('#prayer-filters', prayers, currentPrayerFilterTag, 'filter-prayers');
  const filteredPrayers = prayers.filter((p) => !currentPrayerFilterTag || (p.tags || []).includes(currentPrayerFilterTag));
  if (filteredPrayers.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhum pedido ${currentPrayerFilterTag ? `com tag "${currentPrayerFilterTag}"` : ''}.</p>`;
    return;
  }
  const dateFormat = { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' };
  list.innerHTML = filteredPrayers.sort((a, b) => (b.isHighlighted || 0) - (a.isHighlighted || 0) || a.answered - b.answered).map((prayer) => `<div class="prayer-item relative border ${prayer.isHighlighted ? 'border-yellow-400 dark:border-yellow-600' : (prayer.answered ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700')} ${prayer.answered ? 'bg-green-50 dark:bg-green-900/30' : 'bg-secondary dark:bg-slate-800/50'} rounded-lg p-4 space-y-3">
      <div class="flex items-start justify-between space-x-4">
        <div class="flex-1 pr-16">
          ${prayer.ref ? `<p class="text-xs font-medium text-primary dark:text-primary-light mb-1">${prayer.ref}</p>` : ''}
          <p class="text-slate-700 dark:text-slate-300 ${prayer.answered ? 'italic text-green-700 dark:text-green-400' : ''}">${prayer.text}</p>
          ${(prayer.tags && prayer.tags.length > 0) ? `<div class="flex flex-wrap gap-1.5 mt-2">${prayer.tags.map((tag) => `<span class="tag-badge text-xs px-2 py-0.5 rounded-full">${tag}</span>`).join('')}</div>` : ''}
          <p class="text-xs text-slate-400 mt-2">Por: ${prayer.author?.name || '...'} | ${new Date(prayer.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="absolute top-3 right-3 flex items-center space-x-1">
          <button data-action="highlight-prayer" data-id="${prayer.id}" class="p-2 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500" title="Destacar"><i data-lucide="star" class="w-5 h-5 ${prayer.isHighlighted ? 'fill-yellow-400 text-yellow-400' : ''}"></i></button>
          <button data-action="toggle-prayer" data-id="${prayer.id}" class="p-2 rounded-full ${prayer.answered ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 hover:bg-green-200' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'}" title="${prayer.answered ? 'Desmarcar' : 'Atendido'}"><i data-lucide="${prayer.answered ? 'check-check' : 'check'}" class="w-5 h-5"></i></button>
          <div class="relative">
            <button data-action="toggle-prayer-options" data-id="${prayer.id}" class="p-2 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500"><i data-lucide="more-vertical" class="w-5 h-5"></i></button>
            <div id="options-dropdown-${prayer.id}" class="hidden absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-10 border dark:border-slate-600">
              <button data-action="toggle-comments" data-id="${prayer.id}" class="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2"><i data-lucide="message-circle" class="w-4 h-4"></i><span>Comentar</span></button>
              <button data-action="edit-prayer" data-id="${prayer.id}"
              class="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2"><i data-lucide="edit-2" class="w-4 h-4"></i><span>Editar</span></button>
              <button data-action="delete-prayer" data-id="${prayer.id}" class="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"><i data-lucide="trash-2" class="w-4 h-4"></i><span>Excluir</span></button>
            </div>
          </div>
        </div>
        <div id="comments-${prayer.id}" class="hidden pt-3 border-t border-slate-200 dark:border-slate-600 space-y-3">
          <div class="comments-list max-h-48 overflow-y-auto space-y-2 pr-1">
            ${(prayer.comments || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((comment) => `<div class="text-sm bg-slate-100 dark:bg-slate-700 p-2 rounded-md"><p class="text-slate-700 dark:text-slate-300 break-words">${comment.text}</p><p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${comment.author.name} - ${new Date(comment.createdAt).toLocaleString('pt-BR', dateFormat)}</p></div>`).join('')}${(prayer.comments || []).length === 0 ? '<p class="text-sm text-slate-500 dark:text-slate-400">Nenhum comentário.</p>' : ''}
          </div>
          <form data-action="add-comment" data-prayer-id="${prayer.id}" class="flex space-x-2">
            <input type="text" name="commentText" placeholder="Adicionar comentário..." class="flex-grow border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none" required>
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-medium p-2 rounded-lg flex-shrink-0"><i data-lucide="send" class="w-4 h-4"></i></button>
          </form>
        </div>
      </div>`).join('');
  renderIcons();
}

function renderJournalTab() {
  const list = $('#journal-list');
  const form = $('#add-journal-form');
  if (!list) return;
  const entries = devotionalSpace?.journalEntries || [];
  const canUseJournal = hasFeatureAccess('journal');
  if (form) form.classList.toggle('hidden', !canUseJournal);
  $$('.journal-filter-button').forEach((btn) => btn.classList.toggle('active-journal-filter', btn.dataset.journalFilter === currentJournalFilter));
  if (!canUseJournal) {
    list.innerHTML = getLockedSectionHTML('journal');
    renderIcons();
    return;
  }
  const filteredEntries = entries
    .filter((entry) => (currentJournalFilter === 'shared' ? entry.shared : entry.author.uid === currentUser?.uid))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (filteredEntries.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma entrada ${currentJournalFilter === 'shared' ? 'compartilhada' : 'pessoal'} ainda.</p>`;
    return;
  }
  const dateFormat = { day: '2-digit', month: 'short', year: 'numeric' };
  list.innerHTML = filteredEntries.map((entry) => `<div class="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-lg text-slate-800 dark:text-slate-200">${entry.title}</h4>
        <div class="flex items-center space-x-2">
          ${!entry.shared ? '<i data-lucide="lock" class="w-4 h-4 text-slate-500 dark:text-slate-400" title="Pessoal"></i>' : ''}
          ${entry.author.uid === currentUser?.uid ? `<button data-action="edit-journal" data-id="${entry.id}" class="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button data-action="delete-journal" data-id="${entry.id}" class="text-slate-500 dark:text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
        </div>
      </div>
      <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">${entry.text}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">Por: ${entry.author.name} | ${new Date(entry.createdAt).toLocaleDateString('pt-BR', dateFormat)}</p>
    </div>`).join('');
  renderIcons();
}

function renderApp() {
  if (!devotionalSpace) return;
  spaceAccess = computeSpaceAccess(devotionalSpace);
  document.body.classList.toggle('locked-app', spaceAccess.status === 'locked');
  updateBillingBanner();
  ensurePlanLinks();
  renderHeader();
  const bibleView = hasFeatureAccess('bible-progress') ? getBibleViewHTML() : getLockedBibleHTML();
  if (desktopBibleProgress) desktopBibleProgress.innerHTML = bibleView.progressHTML;
  if (desktopBibleBooks) desktopBibleBooks.innerHTML = bibleView.booksHTML;
  if (mobileBibleWrapper) {
    mobileBibleWrapper.innerHTML = hasFeatureAccess('bible-progress') ? `${bibleView.progressHTML}<div class="space-y-2 mt-4">${bibleView.booksHTML}</div>` : bibleView.progressHTML;
  }
  renderProgressTab(bibleView.chaptersRead || 0);
  renderJournalTab();
  renderNotesTab();
  renderGoalsTab();
  renderPrayerTab();
  renderIcons();
}

function renderProgressTab(chaptersRead) {
  const churchDaysCount = $('#church-days-count');
  const chaptersReadCount = $('#chapters-read-count');
  if (churchDaysCount) churchDaysCount.textContent = devotionalSpace?.churchDays || 0;
  if (chaptersReadCount) chaptersReadCount.textContent = chaptersRead;
  renderCheckinCard();
  const canUpdateStats = hasFeatureAccess('statistics');
  const incButton = mainContent?.querySelector('[data-action="church-days-increment"]');
  const decButton = mainContent?.querySelector('[data-action="church-days-decrement"]');
  [incButton, decButton].forEach((button) => {
    if (!button) return;
    if (!canUpdateStats) {
      button.setAttribute('disabled', 'disabled');
      button.classList.add('opacity-60', 'cursor-not-allowed');
    } else {
      button.removeAttribute('disabled');
      button.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  });
  renderStatsCards();
}

function calculateReadingStreak(bibleProgress = {}) {
  const readingDates = new Set();
  Object.values(bibleProgress).forEach((book) => {
    Object.values(book || {}).forEach((timestamp) => {
      if (!timestamp) return;
      const date = new Date(timestamp);
      const key = date.toISOString().split('T')[0];
      readingDates.add(key);
    });
  });
  if (!readingDates.size) return 0;
  const sortedDates = [...readingDates].sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let previousDate = null;
  sortedDates.forEach((dateStr) => {
    const currentDate = new Date(`${dateStr}T00:00:00`);
    if (previousDate) {
      const diffDays = Math.round((currentDate - previousDate) / 86400000);
      if (diffDays === 1) currentStreak += 1;
      else currentStreak = 1;
    } else {
      currentStreak = 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    previousDate = currentDate;
  });
  const lastReadingDate = new Date(`${sortedDates[sortedDates.length - 1]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return (lastReadingDate.getTime() === today.getTime() || lastReadingDate.getTime() === yesterday.getTime()) ? Math.max(maxStreak, currentStreak) : maxStreak;
}

function calculateChaptersThisWeek(bibleProgress = {}) {
  let count = 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  Object.values(bibleProgress).forEach((book) => {
    Object.values(book || {}).forEach((timestamp) => {
      if (timestamp && new Date(timestamp) >= oneWeekAgo) count += 1;
    });
  });
  return count;
}

function getPopularTags(notes = [], prayers = []) {
  const tagCounts = {};
  notes.forEach((note) => (note.tags || []).forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));
  prayers.forEach((prayer) => (prayer.tags || []).forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));
  return Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([tag]) => tag);
}

function formatDateStatus(timestamp) {
  if (!timestamp) return 'Sem registro';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Sem registro';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isToday(timestamp) {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
function handleDesktopTabClick(event) {
  const button = event.target.closest('.tab-button');
  if (!button) return;
  showTab(button.dataset.tab);
}

function handleBottomNavClick(event) {
  const button = event.target.closest('.bottom-nav-button');
  if (!button) return;
  showTab(button.dataset.tab);
}

function handleSidebarClicks(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'toggle-chapter') handleToggleChapter(button);
  else if (button.classList.contains('accordion-toggle')) {
    button.closest('.accordion-item')?.classList.toggle('accordion-open');
    setTimeout(renderIcons, 100);
  }
}

function handleMainContentClicks(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action?.startsWith('edit-')) {
    event.stopPropagation();
    closeAllPrayerDropdowns();
    openEditModal(action.split('-')[1], id);
    return;
  }
  if (action?.startsWith('filter-')) {
    handleFilterClick(event);
    return;
  }
  if (action === 'toggle-comments') {
    const commentsDiv = $(`#comments-${id}`);
    commentsDiv?.classList.toggle('hidden');
    closeAllPrayerDropdowns();
    return;
  }
  if (action === 'toggle-prayer-options') {
    togglePrayerOptionsDropdown(id);
    return;
  }
  if (button.classList.contains('journal-filter-button')) {
    handleJournalFilterClick(event);
    return;
  }
  switch (action) {
    case 'checkin':
      handleCheckin();
      break;
    case 'church-days-increment':
      if (!ensureFeatureAccess('statistics')) break;
      updateDoc(doc(db, 'devotionalSpaces', coupleId), { churchDays: (devotionalSpace?.churchDays || 0) + 1 });
      break;
    case 'church-days-decrement':
      if (!ensureFeatureAccess('statistics')) break;
      updateDoc(doc(db, 'devotionalSpaces', coupleId), { churchDays: Math.max(0, (devotionalSpace?.churchDays || 0) - 1) });
      break;
    case 'delete-note':
      handleDeleteNote(id);
      break;
    case 'delete-goal':
      handleDeleteGoal(id);
      break;
    case 'copy-note':
      handleCopyNote(id);
      break;
    case 'toggle-prayer':
      handleTogglePrayer(id);
      break;
    case 'delete-prayer':
      handleDeletePrayer(id);
      break;
    case 'highlight-prayer':
      handleHighlightPrayer(id);
      break;
    case 'toggle-chapter':
      handleToggleChapter(button);
      break;
    case 'delete-journal':
      handleDeleteJournal(id);
      break;
    case 'open-upgrade-modal':
      openUpgradeModal();
      break;
    default:
      break;
  }
  if (!button.closest('.prayer-options-dropdown')) closeAllPrayerDropdowns();
}

function handleMainContentInputs(event) {
  const input = event.target;
  if (input.id === 'search-notes') renderNotesTab();
  if (input.dataset.action === 'toggle-goal') handleToggleGoal(input.dataset.id, input.checked);
}

function handleMainContentSubmits(event) {
  event.preventDefault();
  const form = event.target;
  const action = form.dataset.action;
  switch (form.id) {
    case 'add-note-form':
      handleAddNote(form);
      break;
    case 'add-goal-form':
      handleAddGoal(form);
      break;
    case 'add-prayer-form':
      handleAddPrayer(form);
      break;
    case 'add-journal-form':
      handleAddJournal(form);
      break;
    default:
      break;
  }
  if (action === 'add-comment') handleAddComment(form, form.dataset.prayerId);
}

function handleFilterClick(event) {
  const button = event.target.closest('.filter-button');
  if (!button) return;
  const tag = button.dataset.tag || null;
  const action = button.dataset.action;
  if (action === 'filter-notes') {
    currentNoteFilterTag = tag;
    renderNotesTab();
  } else if (action === 'filter-prayers') {
    currentPrayerFilterTag = tag;
    renderPrayerTab();
  }
}

function handleJournalFilterClick(event) {
  const button = event.target.closest('.journal-filter-button');
  if (!button) return;
  currentJournalFilter = button.dataset.journalFilter;
  renderJournalTab();
}

function handleToggleChapter(button) {
  if (!ensureFeatureAccess('bible-progress')) return;
  const { book, chapter } = button.dataset;
  const currentProgress = devotionalSpace?.bibleProgress || {};
  const isRead = currentProgress[book]?.[chapter];
  const path = `bibleProgress.${book}.${chapter}`;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { [path]: isRead ? null : new Date().toISOString() }).catch(() => showToast('Erro salvar progresso.', 'error'));
}

function parseTags(tagsString = '') {
  return tagsString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
}

function getAuthorInfo() {
  return {
    uid: currentUser?.uid,
    name: currentUser?.displayName || 'Usuário'
  };
}

function handleAddNote(form) {
  if (!ensureFeatureAccess('notes')) return;
  const newNote = {
    id: doc(collection(db, 'dummy')).id,
    ref: form.querySelector('#note-ref')?.value || null,
    text: form.querySelector('#note-text')?.value || '',
    tags: parseTags(form.querySelector('#note-tags')?.value || ''),
    createdAt: new Date().toISOString(),
    author: getAuthorInfo()
  };
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { notes: arrayUnion(newNote) })
    .then(() => {
      form.reset();
      showToast('Anotação salva!');
    })
    .catch(() => showToast('Erro salvar.', 'error'));
}

function handleDeleteNote(id) {
  if (!ensureFeatureAccess('notes')) return;
  const noteToDelete = (devotionalSpace?.notes || []).find((n) => n.id === id);
  if (!noteToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { notes: arrayRemove(noteToDelete) })
    .then(() => showToast('Anotação excluída.'))
    .catch(() => showToast('Erro excluir.', 'error'));
}

function handleCopyNote(id) {
  const note = (devotionalSpace?.notes || []).find((n) => n.id === id);
  if (!note) return;
  navigator.clipboard.writeText(`${note.ref ? `${note.ref}\n\n` : ''}${note.text}`).then(() => showToast('Anotação copiada!'));
}

function handleAddGoal(form) {
  if (!ensureFeatureAccess('goals')) return;
  const newGoal = {
    id: doc(collection(db, 'dummy')).id,
    text: form.querySelector('#goal-text')?.value || '',
    completed: false,
    createdAt: new Date().toISOString(),
    author: getAuthorInfo()
  };
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: arrayUnion(newGoal) })
    .then(() => form.reset())
    .catch(() => showToast('Erro salvar.', 'error'));
}

function handleToggleGoal(id, isChecked) {
  if (!ensureFeatureAccess('goals')) return;
  const newGoals = (devotionalSpace?.goals || []).map((goal) => (goal.id === id ? { ...goal, completed: isChecked } : goal));
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: newGoals }).catch(() => showToast('Erro salvar.', 'error'));
}

function handleDeleteGoal(id) {
  if (!ensureFeatureAccess('goals')) return;
  const goalToDelete = (devotionalSpace?.goals || []).find((g) => g.id === id);
  if (!goalToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: arrayRemove(goalToDelete) })
    .catch(() => showToast('Erro excluir.', 'error'));
}

function handleAddPrayer(form) {
  if (!ensureFeatureAccess('prayers')) return;
  const newPrayer = {
    id: doc(collection(db, 'dummy')).id,
    text: form.querySelector('#prayer-text')?.value || '',
    ref: form.querySelector('#prayer-ref')?.value || null,
    tags: parseTags(form.querySelector('#prayer-tags')?.value || ''),
    answered: false,
    isHighlighted: false,
    comments: [],
    createdAt: new Date().toISOString(),
    author: getAuthorInfo()
  };
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: arrayUnion(newPrayer) })
    .then(() => form.reset())
    .catch(() => showToast('Erro salvar.', 'error'));
}

function handleTogglePrayer(id) {
  if (!ensureFeatureAccess('prayers')) return;
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => (prayer.id === id ? { ...prayer, answered: !prayer.answered } : prayer));
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers }).catch(() => showToast('Erro salvar.', 'error'));
}

function handleDeletePrayer(id) {
  if (!ensureFeatureAccess('prayers')) return;
  const prayerToDelete = (devotionalSpace?.prayers || []).find((p) => p.id === id);
  if (!prayerToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: arrayRemove(prayerToDelete) }).catch(() => showToast('Erro excluir.', 'error'));
}

function handleHighlightPrayer(id) {
  if (!ensureFeatureAccess('prayers')) return;
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => (prayer.id === id ? { ...prayer, isHighlighted: !(prayer.isHighlighted || false) } : prayer));
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers }).catch(() => showToast('Erro ao destacar.', 'error'));
}

function handleAddComment(form, prayerId) {
  if (!ensureFeatureAccess('comments')) return;
  const text = form.querySelector('input[name="commentText"]').value;
  if (!text) return;
  const newComment = {
    id: doc(collection(db, 'dummy')).id,
    text,
    author: getAuthorInfo(),
    createdAt: new Date().toISOString()
  };
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => (prayer.id === prayerId ? { ...prayer, comments: [...(prayer.comments || []), newComment] } : prayer));
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers })
    .then(() => form.reset())
    .catch(() => showToast('Erro ao comentar.', 'error'));
}

function getEditField(id) {
  return editForm?.querySelector(`#${id}`);
}

function openEditModal(itemType, itemId) {
  if (!editModal || !editForm) return;
  const itemMap = {
    note: devotionalSpace?.notes,
    goal: devotionalSpace?.goals,
    prayer: devotionalSpace?.prayers,
    journal: devotionalSpace?.journalEntries
  };
  const collection = itemMap[itemType] || [];
  const item = collection.find((entry) => entry.id === itemId);
  if (!item) return;
  editForm.reset();
  editForm.querySelector('#edit-item-id').value = itemId;
  editForm.querySelector('#edit-item-type').value = itemType;
  $$('#edit-form > div[id^="edit-field-"]').forEach((el) => el.classList.add('hidden'));
  $('#edit-modal-title').textContent = {
    note: 'Editar Anotação',
    goal: 'Editar Meta',
    prayer: 'Editar Pedido',
    journal: 'Editar Diário'
  }[itemType] || 'Editar Item';
  if (itemType === 'note' || itemType === 'prayer') {
    getEditField('edit-field-ref')?.classList.remove('hidden');
    getEditField('edit-ref').value = item.ref || '';
  }
  if (itemType === 'journal') {
    getEditField('edit-field-title')?.classList.remove('hidden');
    getEditField('edit-title').value = item.title;
    getEditField('edit-field-visibility')?.classList.remove('hidden');
    getEditField('edit-visibility').checked = item.shared;
  }
  if (itemType !== 'goal') {
    getEditField('edit-field-text')?.classList.remove('hidden');
    getEditField('edit-text').value = item.text;
  } else {
    getEditField('edit-field-text')?.classList.remove('hidden');
    getEditField('edit-text').value = item.text;
  }
  if (itemType === 'note' || itemType === 'prayer') {
    getEditField('edit-field-tags')?.classList.remove('hidden');
    getEditField('edit-tags').value = (item.tags || []).join(', ');
  }
  editModal.classList.remove('hidden');
  renderIcons();
}

function closeEditModal() {
  editModal?.classList.add('hidden');
  editForm?.reset();
}

function handleSaveEdit(event) {
  event.preventDefault();
  if (!editForm) return;
  const itemId = editForm.querySelector('#edit-item-id').value;
  const itemType = editForm.querySelector('#edit-item-type').value;
  const editFeatureMap = { note: 'notes', goal: 'goals', prayer: 'prayers', journal: 'journal' };
  const featureKey = editFeatureMap[itemType] || 'general-edit';
  if (!ensureFeatureAccess(featureKey)) return;
  let fieldName;
  let updatedArray;
  switch (itemType) {
    case 'note':
      fieldName = 'notes';
      updatedArray = (devotionalSpace?.notes || []).map((note) => (note.id === itemId ? { ...note, ref: getEditField('edit-ref').value || null, text: getEditField('edit-text').value, tags: parseTags(getEditField('edit-tags').value) } : note));
      break;
    case 'goal':
      fieldName = 'goals';
      updatedArray = (devotionalSpace?.goals || []).map((goal) => (goal.id === itemId ? { ...goal, text: getEditField('edit-text').value } : goal));
      break;
    case 'prayer':
      fieldName = 'prayers';
      updatedArray = (devotionalSpace?.prayers || []).map((prayer) => (prayer.id === itemId ? { ...prayer, ref: getEditField('edit-ref').value || null, text: getEditField('edit-text').value, tags: parseTags(getEditField('edit-tags').value) } : prayer));
      break;
    case 'journal':
      fieldName = 'journalEntries';
      updatedArray = (devotionalSpace?.journalEntries || []).map((entry) => (entry.id === itemId ? { ...entry, title: getEditField('edit-title').value, text: getEditField('edit-text').value, shared: getEditField('edit-visibility').checked } : entry));
      break;
    default:
      return;
  }
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { [fieldName]: updatedArray })
    .then(() => {
      closeEditModal();
      showToast('Item atualizado!');
    })
    .catch(() => showToast('Erro ao salvar.', 'error'));
}

function closeAllPrayerDropdowns(exceptId = null) {
  $$('[id^="options-dropdown-"]').forEach((dropdown) => {
    if (dropdown.id !== `options-dropdown-${exceptId}`) dropdown.classList.add('hidden');
  });
  activePrayerDropdown = exceptId;
}

function togglePrayerOptionsDropdown(prayerId) {
  closeAllPrayerDropdowns(prayerId);
  const dropdown = $(`#options-dropdown-${prayerId}`);
  dropdown?.classList.toggle('hidden');
  if (dropdown?.classList.contains('hidden')) activePrayerDropdown = null;
}

function handleDragStart(event) {
  if (!hasFeatureAccess('goals')) {
    event.preventDefault();
    return;
  }
  const item = event.target.closest('.draggable-item');
  if (!item || item.dataset.type !== 'goal') return;
  draggedItemId = item.dataset.id;
  draggedItemType = item.dataset.type;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', draggedItemId);
  setTimeout(() => item.classList.add('dragging'), 0);
}

function handleDragOver(event) {
  event.preventDefault();
  const targetItem = event.target.closest('.draggable-item');
  if (!targetItem || targetItem.dataset.type !== draggedItemType) return;
  event.dataTransfer.dropEffect = 'move';
  $$('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  const rect = targetItem.getBoundingClientRect();
  if (event.clientY - rect.top < rect.height / 2) targetItem.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.target.closest('.draggable-item')?.classList.remove('drag-over');
}

function handleDragEnd() {
  $$('.dragging, .drag-over').forEach((el) => el.classList.remove('dragging', 'drag-over'));
  draggedItemId = null;
  draggedItemType = null;
}

function handleDrop(event) {
  event.preventDefault();
  if (!hasFeatureAccess('goals')) return;
  const list = $('#goals-list');
  if (!list) return;
  $$('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  const targetItem = event.target.closest('.draggable-item');
  if (!targetItem || !draggedItemId || targetItem.dataset.id === draggedItemId || targetItem.dataset.type !== 'goal') return;
  const itemsArray = [...(devotionalSpace?.goals || [])];
  const draggedIndex = itemsArray.findIndex((item) => item.id === draggedItemId);
  const visibleItems = Array.from(list.querySelectorAll('.draggable-item'));
  const targetVisibleIndex = visibleItems.findIndex((el) => el.dataset.id === targetItem.dataset.id);
  if (draggedIndex === -1 || targetVisibleIndex === -1) return;
  const [draggedItem] = itemsArray.splice(draggedIndex, 1);
  const rect = targetItem.getBoundingClientRect();
  const insertBefore = event.clientY - rect.top < rect.height / 2;
  const referenceItemId = insertBefore ? targetItem.dataset.id : (visibleItems[targetVisibleIndex + 1]?.dataset.id || null);
  let finalIndex;
  if (referenceItemId) finalIndex = itemsArray.findIndex((item) => item.id === referenceItemId);
  else finalIndex = itemsArray.length;
  itemsArray.splice(finalIndex, 0, draggedItem);
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: itemsArray }).catch(() => showToast('Erro salvar ordem.', 'error'));
}

function handleCheckin() {
  if (!ensureFeatureAccess('checkin')) return;
  const now = new Date().toISOString();
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { [`checkins.${currentUser.uid}`]: now })
    .then(() => showToast('Check-in registrado!'))
    .catch(() => showToast('Erro ao registrar.', 'error'));
}

function handleAddJournal(form) {
  if (!ensureFeatureAccess('journal')) return;
  const newEntry = {
    id: doc(collection(db, 'dummy')).id,
    title: form.querySelector('#journal-title')?.value || '',
    text: form.querySelector('#journal-text')?.value || '',
    shared: form.querySelector('#journal-shared')?.checked ?? true,
    createdAt: new Date().toISOString(),
    author: getAuthorInfo()
  };
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { journalEntries: arrayUnion(newEntry) })
    .then(() => {
      form.reset();
      showToast('Entrada salva!');
    })
    .catch(() => showToast('Erro ao salvar.', 'error'));
}

function handleDeleteJournal(id) {
  if (!ensureFeatureAccess('journal')) return;
  if (!confirm('Excluir esta entrada?')) return;
  const entryToDelete = (devotionalSpace?.journalEntries || []).find((entry) => entry.id === id);
  if (!entryToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { journalEntries: arrayRemove(entryToDelete) })
    .then(() => showToast('Entrada excluída.'))
    .catch(() => showToast('Erro ao excluir.', 'error'));
}

function listenToDevotionalSpace(id) {
  const spaceRef = doc(db, 'devotionalSpaces', id);
  if (unsubscribeSpace) unsubscribeSpace();
  unsubscribeSpace = onSnapshot(spaceRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const billing = data.billing || await ensureSpaceBilling(spaceRef, data);
      devotionalSpace = { ...data, billing };
      renderApp();
    } else {
      console.error('Espaço não encontrado ou foi excluído:', id);
      showToast('Erro: Espaço não encontrado. Verifique o ID ou crie um novo.', 'error');
      updateDoc(doc(db, 'users', currentUser.uid), { coupleId: null });
    }
  }, (error) => {
    console.error('Erro ouvir espaço:', error);
    showToast('Erro conexão.', 'error');
  });
}

async function handleCreateSpace(isAutoCreate = false) {
  if (!isAutoCreate) showScreen(loadingScreen);
  try {
    const newSpaceRef = doc(collection(db, 'devotionalSpaces'));
    const newCoupleId = newSpaceRef.id;
    const now = new Date();
    const initialSpaceData = {
      id: newCoupleId,
      members: [currentUser.uid],
      createdAt: now.toISOString(),
      bibleProgress: {},
      checkins: {},
      churchDays: 0,
      notes: [],
      goals: [],
      prayers: [],
      journalEntries: [],
      billing: createInitialBilling(now)
    };
    await setDoc(newSpaceRef, initialSpaceData);
    if (!isAutoCreate) {
      await updateDoc(doc(db, 'users', currentUser.uid), { coupleId: newCoupleId });
      userProfile.coupleId = newCoupleId;
      coupleId = newCoupleId;
      await listenToDevotionalSpace(newCoupleId);
      showScreen(mainApp);
      showTab('progresso');
      showToast('Novo espaço criado!');
    }
    return newCoupleId;
  } catch (error) {
    console.error('Erro criar espaço:', error);
    showToast('Erro criar espaço.', 'error');
    if (!isAutoCreate) showScreen(mainApp);
    return null;
  }
}

async function handleModalJoinSpace(event) {
  event.preventDefault();
  const inputId = $('#modal-join-space-input').value.trim();
  if (!inputId || inputId === coupleId) {
    showToast('ID inválido ou é o seu próprio ID.', 'error');
    return;
  }
  if (!confirm('Tem certeza que deseja conectar-se a este espaço? Você perderá o acesso aos dados do seu espaço atual.')) return;
  showScreen(loadingScreen);
  try {
    const spaceRef = doc(db, 'devotionalSpaces', inputId);
    const spaceSnap = await getDoc(spaceRef);
    if (!spaceSnap.exists()) throw new Error('Espaço não encontrado.');
    if (unsubscribeSpace) unsubscribeSpace();
    await updateDoc(doc(db, 'users', currentUser.uid), { coupleId: inputId });
    await updateDoc(spaceRef, { members: arrayUnion(currentUser.uid) });
    userProfile.coupleId = inputId;
    coupleId = inputId;
    await listenToDevotionalSpace(inputId);
    closeConnectPartnerModal();
    showScreen(mainApp);
    showTab('progresso');
    showToast('Conectado ao espaço do parceiro!');
  } catch (error) {
    console.error('Erro conectar espaço:', error);
    showToast('Erro ao conectar-se ao espaço.', 'error');
    showScreen(mainApp);
  }
}

function handleLogin() {
  signInWithPopup(auth, new GoogleAuthProvider()).catch(() => showToast('Erro login.', 'error'));
}

function handleLogout() {
  signOut(auth).catch(() => showToast('Erro sair.', 'error'));
}

function togglePrayerOptionsDropdown(prayerId) {
  closeAllPrayerDropdowns(prayerId);
  const dropdown = $(`#options-dropdown-${prayerId}`);
  dropdown?.classList.toggle('hidden');
  if (dropdown?.classList.contains('hidden')) activePrayerDropdown = null;
}

function closeConnectPartnerModal() {
  connectPartnerModal?.classList.add('hidden');
}

function openConnectPartnerModal() {
  if (!connectPartnerModal) return;
  const modalCoupleId = $('#modal-couple-id');
  if (modalCoupleId) modalCoupleId.textContent = coupleId || 'Carregando...';
  connectPartnerModal.classList.remove('hidden');
}

function fillManifestTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}

function showStarterScreens() {
  showScreen(loadingScreen);
}
async function handleAuthStateChange(user) {
  const action = async () => {
    if (user) {
      currentUser = user;
      const userRef = doc(db, 'users', user.uid);
      let userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          coupleId: null
        };
        const soloCoupleId = await handleCreateSpace(true);
        newUserProfile.coupleId = soloCoupleId;
        await setDoc(userRef, newUserProfile);
        userProfile = newUserProfile;
        coupleId = soloCoupleId;
      } else {
        userProfile = userSnap.data();
        coupleId = userProfile.coupleId;
        if (!coupleId) {
          coupleId = await handleCreateSpace(true);
          await updateDoc(userRef, { coupleId });
          userProfile.coupleId = coupleId;
        }
      }
      if (coupleId) {
        await listenToDevotionalSpace(coupleId);
        showScreen(mainApp);
        showTab('progresso');
        if (!isStandaloneDisplay() && !isIOS && !localStorage.getItem(INSTALL_BANNER_DISMISS_KEY)) {
          showInstallBanner();
        }
        if (isIOS && iosInstallButton) iosInstallButton.classList.remove('hidden');
      } else {
        console.error('Falha ao obter/criar coupleId.');
        showToast('Erro ao carregar dados do usuário.', 'error');
        showScreen(loginScreen);
      }
    } else {
      currentUser = null;
      userProfile = null;
      coupleId = null;
      devotionalSpace = null;
      if (unsubscribeSpace) {
        unsubscribeSpace();
        unsubscribeSpace = null;
      }
      showScreen(loginScreen);
    }
  };
  setTimeout(action, 2600);
}

function initApp() {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, handleAuthStateChange);
    $('#login-button')?.addEventListener('click', handleLogin);
    $('#logout-button')?.addEventListener('click', handleLogout);
    $('#copy-id-button')?.addEventListener('click', handleCopyId);
    desktopTabNav?.addEventListener('click', handleDesktopTabClick);
    bottomNav?.addEventListener('click', handleBottomNavClick);
    $('#mobile-bible-button')?.addEventListener('click', () => showTab('biblia'));
    mainContent?.addEventListener('click', handleMainContentClicks);
    mainContent?.addEventListener('input', handleMainContentInputs);
    mainContent?.addEventListener('submit', handleMainContentSubmits);
    $('#sidebar')?.addEventListener('click', handleSidebarClicks);
    themeToggleButton?.addEventListener('click', toggleTheme);
    editForm?.addEventListener('submit', handleSaveEdit);
    $('#edit-cancel-button')?.addEventListener('click', closeEditModal);
    editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
    mainContent?.addEventListener('dragstart', handleDragStart);
    mainContent?.addEventListener('dragover', handleDragOver);
    mainContent?.addEventListener('dragleave', handleDragLeave);
    mainContent?.addEventListener('drop', handleDrop);
    mainContent?.addEventListener('dragend', handleDragEnd);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-action="toggle-prayer-options"]')) closeAllPrayerDropdowns();
      if (!e.target.closest('#user-menu-container')) closeUserMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeUserMenu();
        closePwaInstructions();
      }
    });
    $('#connect-partner-button')?.addEventListener('click', openConnectPartnerModal);
    $('#close-connect-modal')?.addEventListener('click', closeConnectPartnerModal);
    $('#modal-copy-id-button')?.addEventListener('click', handleModalCopyId);
    $('#modal-join-space-form')?.addEventListener('submit', handleModalJoinSpace);
    connectPartnerModal?.addEventListener('click', (e) => { if (e.target === connectPartnerModal) closeConnectPartnerModal(); });
    openUpgradeHeaderButton?.addEventListener('click', openUpgradeModal);
    billingCtaButton?.addEventListener('click', openUpgradeModal);
    billingMoreButton?.addEventListener('click', () => { openUpgradeModal(); setTimeout(() => refreshAccessButton?.focus(), 150); });
    closeUpgradeModalButton?.addEventListener('click', closeUpgradeModal);
    upgradeModal?.addEventListener('click', (e) => { if (e.target === upgradeModal) closeUpgradeModal(); });
    refreshAccessButton?.addEventListener('click', refreshBillingStatus);
    userMenuToggle?.setAttribute('aria-expanded', 'false');
    userMenuToggle?.setAttribute('aria-haspopup', 'true');
    userMenuToggle?.addEventListener('click', toggleUserMenu);
    initializePWAInstallHandling();
    ensurePlanLinks();
    setupPWA();
    fillManifestTheme();
    showStarterScreens();
  } catch (error) {
    if (error.code === 'invalid-api-key' || (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('SEU_'))) {
      loadingScreen.innerHTML = `<div class="p-4 text-center"><h2 class="text-xl font-bold text-red-600">Erro Configuração</h2><p class="text-slate-700 mt-2">Config Firebase faltando.</p></div>`;
      showScreen(loadingScreen);
    }
  }
}

function handleCopyId() {
  if (!coupleId) return;
  navigator.clipboard.writeText(coupleId)
    .then(() => showToast('ID copiado!'))
    .catch(() => showToast('Erro copiar ID.', 'error'));
}

function handleModalCopyId() {
  const idToCopy = $('#modal-couple-id')?.textContent;
  if (!idToCopy || idToCopy === '...') return;
  navigator.clipboard.writeText(idToCopy)
    .then(() => showToast('ID copiado!'))
    .catch(() => showToast('Erro copiar ID.', 'error'));
}

document.addEventListener('DOMContentLoaded', initApp);
