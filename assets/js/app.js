import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let auth;
let db;
let currentUser = null;
let userProfile = null;
let coupleId = null;
let devotionalSpace = null;
let unsubscribeSpace = null;
let currentNoteFilterTag = null;
let currentPrayerFilterTag = null;
let currentJournalFilter = 'shared';
let draggedItemId = null;
let draggedItemType = null;
let activePrayerDropdown = null;
const openBibleBooks = new Set();
let recoveringSpace = false;
let recoveryAttempted = false;

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
const editModal = $('#edit-modal');
const editForm = $('#edit-form');
const connectPartnerModal = $('#connect-partner-modal');
const userMenuContainer = $('#user-menu-container');
const userMenuToggle = $('#user-menu-toggle');
const userMenu = $('#user-menu');
const installAndroidButton = $('#menu-install-android');
const installIosButton = $('#menu-install-ios');
const installModal = $('#install-modal');
const closeInstallModalButton = $('#close-install-modal');
const installModalOkButton = $('#install-modal-ok');
const resetSpaceButton = $('#reset-space-button');
const resetModal = $('#reset-modal');
const resetConfirmButton = $('#reset-confirm-button');
const resetCancelButton = $('#reset-cancel-button');
const closeResetModalButton = $('#close-reset-modal');
const loginForm = $('#login-form');
const loginEmail = $('#login-email');
const loginPassword = $('#login-password');
const loginError = $('#login-error');

const themeToggleButton = $('#theme-toggle-button');
const sunIcon = $('#theme-icon-sun');
const moonIcon = $('#theme-icon-moon');

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  sunIcon?.classList.toggle('hidden', theme === 'dark');
  moonIcon?.classList.toggle('hidden', theme !== 'dark');
}

function toggleTheme() {
  const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

function setupPWA() {
  const handshakeIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#ffffff"/><path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762" fill="none" stroke="#f43f5e" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const iconSvgDataUrl = `data:image/svg+xml,${encodeURIComponent(handshakeIconSVG)}`;
  const manifest = {
    name: 'Jornada Devocional',
    short_name: 'Jornada',
    start_url: './',
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone', 'minimal-ui'],
    scope: './',
    background_color: '#fdf2f8',
    theme_color: '#f43f5e',
    icons: [
      { src: iconSvgDataUrl, sizes: '192x192', type: 'image/svg+xml' },
      { src: iconSvgDataUrl, sizes: '512x512', type: 'image/svg+xml' }
    ]
  };
  const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/json' }));
  $('#manifest-link')?.setAttribute('href', manifestUrl);
  $('#apple-touch-icon')?.setAttribute('href', iconSvgDataUrl);

  if (!('serviceWorker' in navigator)) return;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  const isSecure = location.protocol === 'https:' || isLocalhost;
  if (!isSecure) return;

  navigator.serviceWorker.register('./sw.js').catch((err) => {
    console.warn('Falha ao registrar service worker:', err);
  });
}

function showScreen(screen) {
  [loadingScreen, loginScreen, couplingScreen, mainApp].forEach((el) => el?.classList.add('hidden'));
  screen?.classList.remove('hidden');
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
  $(`#tab-${tabName}`)?.classList.remove('hidden');
  $$('#desktop-tab-nav .tab-button, #bottom-nav .bottom-nav-button').forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active-tab', isActive);
    btn.classList.toggle('active-nav-button', isActive);
  });
  const mobileBibleButton = $('#mobile-bible-button');
  if (mobileBibleButton) {
    mobileBibleButton.classList.toggle('active-nav-button', tabName === 'biblia');
    mobileBibleButton.classList.toggle('bg-primary-dark', tabName === 'biblia');
    mobileBibleButton.classList.toggle('bg-primary', tabName !== 'biblia');
  }
  renderIcons();
}

function renderHeader() {
  const headerAvatar = $('#header-avatar');
  const headerCoupleId = $('#header-couple-id');
  if (headerAvatar) headerAvatar.src = currentUser?.photoURL || 'https://ui-avatars.com/api/?name=JD&background=fecdd3&color=be123c&bold=true';
  if (headerCoupleId) headerCoupleId.textContent = coupleId ? `ID: ${coupleId}` : 'ID: ...';
}

function openUserMenu() {
  if (userMenu) userMenu.classList.remove('hidden');
}

function closeUserMenu() {
  if (userMenu) userMenu.classList.add('hidden');
}

function toggleUserMenu(event) {
  event.preventDefault();
  if (!userMenu) return;
  if (userMenu.classList.contains('hidden')) openUserMenu();
  else closeUserMenu();
}

function openInstallModal(sectionId) {
  closeUserMenu();
  if (!installModal) return;
  installModal.classList.remove('hidden');
  if (sectionId) {
    const section = installModal.querySelector(`[data-install-section="${sectionId}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function closeInstallModal() {
  if (installModal) installModal.classList.add('hidden');
}

function openResetModal() {
  closeUserMenu();
  if (resetModal) resetModal.classList.remove('hidden');
}

function closeResetModal() {
  if (resetModal) resetModal.classList.add('hidden');
}

async function handleResetSpace() {
  if (!coupleId) return;
  const spaceRef = doc(db, 'devotionalSpaces', coupleId);
  try {
    await updateDoc(spaceRef, {
      bibleProgress: {},
      checkins: {},
      churchDays: 0,
      notes: [],
      goals: [],
      prayers: [],
      journalEntries: [],
      lastResetAt: new Date().toISOString()
    });
    showToast('Dados apagados com sucesso!');
    closeResetModal();
  } catch (error) {
    console.error('Erro ao resetar espaço:', error);
    showToast('Não foi possível apagar os dados.', 'error');
  }
}

function getBibleViewHTML() {
  const progress = devotionalSpace?.bibleProgress || {};
  let chaptersRead = 0;
  const renderBook = (book) => {
    let bookChaptersRead = 0;
    const isOpen = openBibleBooks.has(book.name);
    const chapterButtons = Array.from({ length: book.chapters }, (_, idx) => {
      const chapter = idx + 1;
      const readTimestamp = progress[book.name]?.[chapter];
      if (readTimestamp) bookChaptersRead += 1;
      const isRead = Boolean(readTimestamp);
      return `<button data-action="toggle-chapter" data-book="${book.name}" data-chapter="${chapter}" class="chapter-button w-9 h-9 rounded-full flex items-center justify-center font-medium transition-colors ${isRead ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}">${chapter}</button>`;
    }).join('');
    chaptersRead += bookChaptersRead;
    const itemClasses = `accordion-item bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden${isOpen ? ' accordion-open' : ''}`;
    const contentInlineStyle = isOpen ? 'max-height: 9999px;' : 'max-height: 0;';
    return `<div class="${itemClasses}" data-book="${book.name}">
      <button class="accordion-toggle w-full flex items-center justify-between p-3 text-left group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <span class="font-semibold text-slate-700 dark:text-slate-300 flex-grow break-words mr-2">${book.name}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap mr-1">(${bookChaptersRead}/${book.chapters})</span>
        <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500 dark:text-slate-400 accordion-icon transition-transform flex-shrink-0"></i>
      </button>
      <div class="accordion-content" style="${contentInlineStyle}">
        <div class="p-3 border-t border-slate-100 dark:border-slate-700">
          <div class="flex flex-wrap gap-2">${chapterButtons}</div>
        </div>
      </div>
    </div>`;
  };
  const otBooksHTML = BIBLE_DATA.ot.map(renderBook).join('');
  const ntBooksHTML = BIBLE_DATA.nt.map(renderBook).join('');
  const percentRaw = (chaptersRead / TOTAL_CHAPTERS) * 100;
  const percentText = Number.isFinite(percentRaw) ? percentRaw.toFixed(2) : '0.00';
  const progressWidth = Number.isFinite(percentRaw) ? Math.min(percentRaw, 100) : 0;
  const progressHTML = `<div class="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1"><span>Progresso Total</span><span class="font-semibold">${percentText}%</span></div><div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div class="bg-primary h-2.5 rounded-full" style="width: ${progressWidth}%"></div></div>`;
  const booksHTML = `<h3 class="font-semibold text-lg mb-2 dark:text-slate-200">Antigo Testamento</h3><div class="space-y-2 mb-4">${otBooksHTML}</div><h3 class="font-semibold text-lg mb-2 dark:text-slate-200">Novo Testamento</h3><div class="space-y-2">${ntBooksHTML}</div>`;
  return { progressHTML, booksHTML, chaptersRead };
}

function renderCheckinCard() {
  const container = $('#checkin-card');
  if (!container) return;
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
  weeklyReadCard.innerHTML = `<div class="flex items-center space-x-3"><div class="p-3 rounded-full bg-purple-100 text-purple-600"><i data-lucide="calendar-check-2" class="w-6 h-6"></i></div><div><h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">Leitura (7 dias)</h3><span class="text-3xl font-bold text-slate-800 dark:text-slate-200">${weeklyChapters} ${weeklyChapters === 1 ? 'capítulo' : 'capítulos'}</span></div></div>`;
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
  if (form) form.classList.remove('hidden');
  if (searchInput) searchInput.classList.remove('hidden');
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
  list.innerHTML = filteredNotes
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((note) => `<div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-secondary dark:bg-slate-800/50">
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
      </div>`)
    .join('');
  renderIcons();
}

function renderGoalsTab() {
  const list = $('#goals-list');
  const form = $('#add-goal-form');
  if (!list) return;
  const goals = devotionalSpace?.goals || [];
  if (form) form.classList.remove('hidden');
  if (goals.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma meta.</p>`;
    return;
  }
  list.innerHTML = goals
    .map((goal, index) => `<div draggable="true" data-id="${goal.id}" data-type="goal" data-index="${index}" class="draggable-item flex items-start justify-between space-x-3 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
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
      </div>`)
    .join('');
  renderIcons();
}

function renderPrayerTab() {
  const list = $('#prayers-list');
  const form = $('#add-prayer-form');
  if (!list) return;
  const prayers = devotionalSpace?.prayers || [];
  if (form) form.classList.remove('hidden');
  renderTagFilters('#prayer-filters', prayers, currentPrayerFilterTag, 'filter-prayers');
  const filteredPrayers = prayers.filter((prayer) => !currentPrayerFilterTag || (prayer.tags || []).includes(currentPrayerFilterTag));
  if (filteredPrayers.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhum pedido ${currentPrayerFilterTag ? `com tag "${currentPrayerFilterTag}"` : ''}.</p>`;
    return;
  }
  const dateFormat = { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' };
  list.innerHTML = filteredPrayers
    .sort((a, b) => (b.isHighlighted || 0) - (a.isHighlighted || 0) || a.answered - b.answered)
    .map((prayer) => `<div class="prayer-item relative border ${prayer.isHighlighted ? 'border-yellow-400 dark:border-yellow-600' : (prayer.answered ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700')} ${prayer.answered ? 'bg-green-50 dark:bg-green-900/30' : 'bg-secondary dark:bg-slate-800/50'} rounded-lg p-4 space-y-3">
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
                <button data-action="edit-prayer" data-id="${prayer.id}" class="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center space-x-2"><i data-lucide="edit-2" class="w-4 h-4"></i><span>Editar</span></button>
                <button data-action="delete-prayer" data-id="${prayer.id}" class="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"><i data-lucide="trash-2" class="w-4 h-4"></i><span>Excluir</span></button>
              </div>
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
      </div>`)
    .join('');
  renderIcons();
}

function renderJournalTab() {
  const list = $('#journal-list');
  const form = $('#add-journal-form');
  if (!list) return;
  const entries = devotionalSpace?.journalEntries || [];
  if (form) form.classList.remove('hidden');
  $$('.journal-filter-button').forEach((btn) => btn.classList.toggle('active-journal-filter', btn.dataset.journalFilter === currentJournalFilter));
  const filteredEntries = entries
    .filter((entry) => (currentJournalFilter === 'shared' ? entry.shared : entry.author.uid === currentUser?.uid))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (filteredEntries.length === 0) {
    list.innerHTML = `<p class="text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma entrada ${currentJournalFilter === 'shared' ? 'compartilhada' : 'pessoal'} ainda.</p>`;
    return;
  }
  const dateFormat = { day: '2-digit', month: 'short', year: 'numeric' };
  list.innerHTML = filteredEntries
    .map((entry) => `<div class="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-semibold text-lg text-slate-800 dark:text-slate-200">${entry.title}</h4>
          <div class="flex items-center space-x-2">
            ${!entry.shared ? '<i data-lucide="lock" class="w-4 h-4 text-slate-500 dark:text-slate-400" title="Pessoal"></i>' : ''}
            ${entry.author.uid === currentUser?.uid ? `<button data-action="edit-journal" data-id="${entry.id}" class="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button data-action="delete-journal" data-id="${entry.id}" class="text-slate-500 dark:text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
          </div>
        </div>
        <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">${entry.text}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">Por: ${entry.author.name} | ${new Date(entry.createdAt).toLocaleDateString('pt-BR', dateFormat)}</p>
      </div>`)
    .join('');
  renderIcons();
}

function renderApp() {
  if (!devotionalSpace) return;
  renderHeader();
  const bibleView = getBibleViewHTML();
  if (desktopBibleProgress) desktopBibleProgress.innerHTML = bibleView.progressHTML;
  if (desktopBibleBooks) desktopBibleBooks.innerHTML = bibleView.booksHTML;
  if (mobileBibleWrapper) mobileBibleWrapper.innerHTML = `${bibleView.progressHTML}<div class="space-y-2 mt-4">${bibleView.booksHTML}</div>`;
  renderProgressTab(bibleView.chaptersRead || 0);
  renderJournalTab();
  renderNotesTab();
  renderGoalsTab();
  renderPrayerTab();
  renderIcons();
  restoreAccordionState();
}

function renderProgressTab(chaptersRead) {
  const churchDaysCount = $('#church-days-count');
  if (churchDaysCount) churchDaysCount.textContent = devotionalSpace?.churchDays || 0;
  const chaptersReadCount = $('#chapters-read-count');
  if (chaptersReadCount) chaptersReadCount.textContent = chaptersRead;
  renderCheckinCard();
  const incButton = mainContent?.querySelector('[data-action="church-days-increment"]');
  const decButton = mainContent?.querySelector('[data-action="church-days-decrement"]');
  [incButton, decButton].forEach((button) => button?.removeAttribute('disabled'));
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
  return (lastReadingDate.getTime() === today.getTime() || lastReadingDate.getTime() === yesterday.getTime()) ? currentStreak : maxStreak;
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
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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

function adjustAccordionContainer(container) {
  if (!container) return;
  container.querySelectorAll('.accordion-item').forEach((item) => {
    const content = item.querySelector('.accordion-content');
    if (!content) return;
    if (item.classList.contains('accordion-open')) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      content.style.maxHeight = '0px';
    }
  });
}

function restoreAccordionState() {
  requestAnimationFrame(() => {
    adjustAccordionContainer(desktopBibleBooks);
    adjustAccordionContainer(mobileBibleWrapper);
  });
}

function toggleAccordionItem(item) {
  if (!item) return;
  const content = item.querySelector('.accordion-content');
  const bookName = item.dataset.book;
  const isOpening = !item.classList.contains('accordion-open');
  if (isOpening) {
    item.classList.add('accordion-open');
    if (content) content.style.maxHeight = `${content.scrollHeight}px`;
    if (bookName) openBibleBooks.add(bookName);
  } else {
    if (content) {
      const currentHeight = content.scrollHeight;
      content.style.maxHeight = `${currentHeight}px`;
      requestAnimationFrame(() => {
        content.style.maxHeight = '0px';
      });
    }
    item.classList.remove('accordion-open');
    if (bookName) openBibleBooks.delete(bookName);
  }
  const root = item.closest('#bible-books-container') || item.closest('#mobile-bible-content-wrapper');
  if (root) setTimeout(() => adjustAccordionContainer(root), 320);
}

function handleBibleContainerClick(event) {
  const button = event.target.closest('button');
  if (!button) return;
  event.stopPropagation();
  if (button.dataset.action === 'toggle-chapter') {
    handleToggleChapter(button);
    return;
  }
  if (button.classList.contains('accordion-toggle')) {
    toggleAccordionItem(button.closest('.accordion-item'));
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
  if (button.classList.contains('accordion-toggle')) {
    toggleAccordionItem(button.closest('.accordion-item'));
    return;
  }
  switch (action) {
    case 'checkin':
      handleCheckin();
      break;
    case 'church-days-increment':
      updateDoc(doc(db, 'devotionalSpaces', coupleId), { churchDays: (devotionalSpace?.churchDays || 0) + 1 });
      break;
    case 'church-days-decrement':
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
  }
  if (action === 'filter-prayers') {
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

function parseTags(tagsString = '') {
  return tagsString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
}

function getAuthorInfo() {
  return {
    uid: currentUser?.uid,
    name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuário'
  };
}

function handleAddJournal(form) {
  const newEntry = {
    id: doc(collection(db, 'dummy')).id,
    title: form.querySelector('#journal-title')?.value?.trim() || 'Sem título',
    text: form.querySelector('#journal-text')?.value?.trim() || '',
    shared: form.querySelector('#journal-shared')?.checked ?? true,
    createdAt: new Date().toISOString(),
    author: getAuthorInfo()
  };
  if (!newEntry.text) {
    showToast('Escreva algo antes de salvar.', 'error');
    return;
  }
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { journalEntries: arrayUnion(newEntry) })
    .then(() => {
      form.reset();
      const sharedCheckbox = form.querySelector('#journal-shared');
      if (sharedCheckbox) sharedCheckbox.checked = true;
      showToast('Entrada adicionada!');
    })
    .catch(() => showToast('Erro ao salvar entrada.', 'error'));
}

function handleDeleteJournal(id) {
  const entryToDelete = (devotionalSpace?.journalEntries || []).find((entry) => entry.id === id);
  if (!entryToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { journalEntries: arrayRemove(entryToDelete) })
    .then(() => showToast('Entrada removida.'))
    .catch(() => showToast('Erro ao excluir entrada.', 'error'));
}

function handleToggleChapter(button) {
  const { book, chapter } = button.dataset;
  const currentProgress = devotionalSpace?.bibleProgress || {};
  const isRead = currentProgress[book]?.[chapter];
  const path = `bibleProgress.${book}.${chapter}`;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { [path]: isRead ? null : new Date().toISOString() })
    .catch(() => showToast('Erro salvar progresso.', 'error'));
}

function handleAddNote(form) {
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
  const noteToDelete = (devotionalSpace?.notes || []).find((note) => note.id === id);
  if (!noteToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { notes: arrayRemove(noteToDelete) })
    .then(() => showToast('Anotação excluída.'))
    .catch(() => showToast('Erro excluir.', 'error'));
}

function handleCopyNote(id) {
  const note = (devotionalSpace?.notes || []).find((n) => n.id === id);
  if (!note) return;
  navigator.clipboard.writeText(`${note.ref ? `${note.ref}\n\n` : ''}${note.text}`)
    .then(() => showToast('Anotação copiada!'))
    .catch(() => showToast('Não foi possível copiar.', 'error'));
}

function handleAddGoal(form) {
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
  const newGoals = (devotionalSpace?.goals || []).map((goal) => goal.id === id ? { ...goal, completed: isChecked } : goal);
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: newGoals }).catch(() => showToast('Erro salvar.', 'error'));
}

function handleDeleteGoal(id) {
  const goalToDelete = (devotionalSpace?.goals || []).find((g) => g.id === id);
  if (!goalToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { goals: arrayRemove(goalToDelete) })
    .then(() => showToast('Meta excluída.'))
    .catch(() => showToast('Erro excluir.', 'error'));
}

function handleAddPrayer(form) {
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
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => prayer.id === id ? { ...prayer, answered: !prayer.answered } : prayer);
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers }).catch(() => showToast('Erro salvar.', 'error'));
}

function handleDeletePrayer(id) {
  const prayerToDelete = (devotionalSpace?.prayers || []).find((p) => p.id === id);
  if (!prayerToDelete) return;
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: arrayRemove(prayerToDelete) })
    .then(() => showToast('Pedido excluído.'))
    .catch(() => showToast('Erro excluir.', 'error'));
}

function handleHighlightPrayer(id) {
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => prayer.id === id ? { ...prayer, isHighlighted: !(prayer.isHighlighted || false) } : prayer);
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers }).catch(() => showToast('Erro ao destacar.', 'error'));
}

function handleAddComment(form, prayerId) {
  const text = form.querySelector('input[name="commentText"]').value;
  if (!text) return;
  const newComment = {
    id: doc(collection(db, 'dummy')).id,
    text,
    author: getAuthorInfo(),
    createdAt: new Date().toISOString()
  };
  const newPrayers = (devotionalSpace?.prayers || []).map((prayer) => prayer.id === prayerId ? { ...prayer, comments: [...(prayer.comments || []), newComment] } : prayer);
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { prayers: newPrayers })
    .then(() => form.reset())
    .catch(() => showToast('Erro ao comentar.', 'error'));
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

function openEditModal(itemType, itemId) {
  if (!editModal || !editForm) return;
  const collections = {
    note: devotionalSpace?.notes || [],
    goal: devotionalSpace?.goals || [],
    prayer: devotionalSpace?.prayers || [],
    journal: devotionalSpace?.journalEntries || []
  };
  const item = collections[itemType]?.find((entry) => entry.id === itemId);
  if (!item) return;
  editForm.reset();
  editForm.querySelector('#edit-item-id').value = itemId;
  editForm.querySelector('#edit-item-type').value = itemType;
  $$('#edit-form > div[id^="edit-field-"]').forEach((el) => el.classList.add('hidden'));
  const titles = { note: 'Editar Anotação', goal: 'Editar Meta', prayer: 'Editar Pedido', journal: 'Editar Diário' };
  $('#edit-modal-title').textContent = titles[itemType] || 'Editar Item';
  if (itemType === 'note' || itemType === 'prayer') {
    $('#edit-field-ref')?.classList.remove('hidden');
    $('#edit-ref').value = item.ref || '';
  }
  if (itemType === 'journal') {
    $('#edit-field-title')?.classList.remove('hidden');
    $('#edit-title').value = item.title || '';
    $('#edit-field-visibility')?.classList.remove('hidden');
    $('#edit-visibility').checked = Boolean(item.shared);
  }
  $('#edit-field-text')?.classList.remove('hidden');
  $('#edit-text').value = item.text || '';
  if (itemType === 'note' || itemType === 'prayer') {
    $('#edit-field-tags')?.classList.remove('hidden');
    $('#edit-tags').value = (item.tags || []).join(', ');
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
  const itemId = editForm.querySelector('#edit-item-id').value;
  const itemType = editForm.querySelector('#edit-item-type').value;
  let fieldName;
  let updatedArray;
  switch (itemType) {
    case 'note':
      fieldName = 'notes';
      updatedArray = (devotionalSpace?.notes || []).map((note) => note.id === itemId ? {
        ...note,
        ref: $('#edit-ref').value || null,
        text: $('#edit-text').value,
        tags: parseTags($('#edit-tags').value)
      } : note);
      break;
    case 'goal':
      fieldName = 'goals';
      updatedArray = (devotionalSpace?.goals || []).map((goal) => goal.id === itemId ? { ...goal, text: $('#edit-text').value } : goal);
      break;
    case 'prayer':
      fieldName = 'prayers';
      updatedArray = (devotionalSpace?.prayers || []).map((prayer) => prayer.id === itemId ? {
        ...prayer,
        ref: $('#edit-ref').value || null,
        text: $('#edit-text').value,
        tags: parseTags($('#edit-tags').value)
      } : prayer);
      break;
    case 'journal':
      fieldName = 'journalEntries';
      updatedArray = (devotionalSpace?.journalEntries || []).map((entry) => entry.id === itemId ? {
        ...entry,
        title: $('#edit-title').value,
        text: $('#edit-text').value,
        shared: $('#edit-visibility').checked
      } : entry);
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

function handleDragStart(event) {
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

async function recoverDevotionalSpace() {
  if (recoveringSpace || !currentUser) return;
  recoveringSpace = true;
  recoveryAttempted = true;
  showToast('Não foi possível acessar o espaço atual. Criando um novo para vocês...');
  try {
    const newSpaceId = await handleCreateSpace(true);
    if (!newSpaceId) throw new Error('Falha ao criar novo espaço');
    await updateDoc(doc(db, 'users', currentUser.uid), { coupleId: newSpaceId });
    if (userProfile) userProfile.coupleId = newSpaceId;
    coupleId = newSpaceId;
    openBibleBooks.clear();
    await listenToDevotionalSpace(newSpaceId);
    showToast('Novo espaço devocional criado com sucesso.');
  } catch (error) {
    console.error('Erro ao recriar espaço:', error);
    showToast('Não foi possível criar um novo espaço automaticamente.', 'error');
  } finally {
    recoveringSpace = false;
  }
}

function handleCheckin() {
  const now = new Date().toISOString();
  updateDoc(doc(db, 'devotionalSpaces', coupleId), { [`checkins.${currentUser.uid}`]: now })
    .then(() => showToast('Check-in registrado!'))
    .catch(() => showToast('Erro ao registrar.', 'error'));
}

async function listenToDevotionalSpace(id) {
  if (!id) {
    console.error('ID do espaço inválido para escuta.');
    return;
  }
  openBibleBooks.clear();
  const spaceRef = doc(db, 'devotionalSpaces', id);
  if (unsubscribeSpace) unsubscribeSpace();
  unsubscribeSpace = onSnapshot(spaceRef, (docSnap) => {
    if (docSnap.exists()) {
      devotionalSpace = docSnap.data();
      recoveryAttempted = false;
      renderApp();
    } else {
      console.error('Espaço não encontrado:', id);
      showToast('Espaço não encontrado. Crie um novo.', 'error');
    }
  }, (error) => {
    console.error('Erro ao ouvir espaço:', error);
    if (error.code === 'permission-denied') {
      if (!recoveryAttempted) recoverDevotionalSpace();
      else showToast('Sem permissão para acessar o espaço atual.', 'error');
      return;
    }
    showToast('Erro ao sincronizar dados.', 'error');
  });
}

async function handleCreateSpace(isAutoCreate = false) {
  if (!isAutoCreate) showScreen(loadingScreen);
  try {
    const newSpaceRef = doc(collection(db, 'devotionalSpaces'));
    const newCoupleId = newSpaceRef.id;
    const initialSpaceData = {
      id: newCoupleId,
      members: [currentUser.uid],
      createdAt: new Date().toISOString(),
      bibleProgress: {},
      checkins: {},
      churchDays: 0,
      notes: [],
      goals: [],
      prayers: [],
      journalEntries: []
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
    showToast('Erro ao criar espaço.', 'error');
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
  if (!confirm('Deseja conectar-se a este espaço? Isso substituirá seu espaço atual.')) return;
  showScreen(loadingScreen);
  try {
    const spaceRef = doc(db, 'devotionalSpaces', inputId);
    const spaceSnap = await getDoc(spaceRef);
    if (!spaceSnap.exists()) throw new Error('Espaço não encontrado');
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

function handleLoginSubmit(event) {
  event.preventDefault();
  if (!loginEmail || !loginPassword) return;
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) {
    showLoginError('Informe e-mail e senha.');
    return;
  }
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginForm.reset();
      showLoginError('');
    })
    .catch((error) => {
      console.error('Erro login:', error);
      const message = error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar. Tente novamente.';
      showLoginError(message);
    });
}

function showLoginError(message) {
  if (!loginError) return;
  if (!message) {
    loginError.classList.add('hidden');
    loginError.textContent = '';
  } else {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
}

function handleLogout() {
  signOut(auth).catch(() => showToast('Erro ao sair.', 'error'));
}

function handleCopyId() {
  if (!coupleId) return;
  navigator.clipboard.writeText(coupleId)
    .then(() => showToast('ID copiado!'))
    .catch(() => showToast('Erro copiar ID.', 'error'));
}

function handleModalCopyId() {
  const modalCoupleId = $('#modal-couple-id');
  const idToCopy = modalCoupleId ? modalCoupleId.textContent : null;
  if (!idToCopy || idToCopy === '...') return;
  navigator.clipboard.writeText(idToCopy)
    .then(() => showToast('ID copiado!'))
    .catch(() => showToast('Erro copiar ID.', 'error'));
}

function closeConnectPartnerModal() {
  if (connectPartnerModal) connectPartnerModal.classList.add('hidden');
}

function openConnectPartnerModal() {
  if (!connectPartnerModal) return;
  const modalCoupleId = $('#modal-couple-id');
  if (modalCoupleId) modalCoupleId.textContent = coupleId || 'Carregando...';
  connectPartnerModal.classList.remove('hidden');
}

function fillSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}

function showStarterScreen() {
  showScreen(loadingScreen);
}

async function handleAuthStateChange(user) {
  const proceed = async () => {
    if (user) {
      currentUser = user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const soloCoupleId = await handleCreateSpace(true);
        const newUserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.email?.split('@')[0] || 'Usuário',
          photoURL: null,
          coupleId: soloCoupleId
        };
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
      } else {
        showToast('Erro ao carregar espaço do usuário.', 'error');
        showScreen(loginScreen);
      }
    } else {
      currentUser = null;
      userProfile = null;
      coupleId = null;
      devotionalSpace = null;
      openBibleBooks.clear();
      recoveryAttempted = false;
      if (unsubscribeSpace) {
        unsubscribeSpace();
        unsubscribeSpace = null;
      }
      showScreen(loginScreen);
    }
  };
  setTimeout(proceed, 800);
}

function initApp() {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, handleAuthStateChange);
    loginForm?.addEventListener('submit', handleLoginSubmit);
    $('#logout-button')?.addEventListener('click', handleLogout);
    $('#copy-id-button')?.addEventListener('click', handleCopyId);
    desktopTabNav?.addEventListener('click', handleDesktopTabClick);
    bottomNav?.addEventListener('click', handleBottomNavClick);
    $('#mobile-bible-button')?.addEventListener('click', () => showTab('biblia'));
    desktopBibleBooks?.addEventListener('click', handleBibleContainerClick);
    mainContent?.addEventListener('click', handleMainContentClicks);
    mainContent?.addEventListener('input', handleMainContentInputs);
    mainContent?.addEventListener('submit', handleMainContentSubmits);
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
        closeAllPrayerDropdowns();
        closeEditModal();
        closeConnectPartnerModal();
        closeUserMenu();
        closeInstallModal();
      }
    });
    userMenuToggle?.addEventListener('click', toggleUserMenu);
    installAndroidButton?.addEventListener('click', () => openInstallModal('android'));
    installIosButton?.addEventListener('click', () => openInstallModal('ios'));
    closeInstallModalButton?.addEventListener('click', closeInstallModal);
    installModalOkButton?.addEventListener('click', closeInstallModal);
    installModal?.addEventListener('click', (e) => { if (e.target === installModal) closeInstallModal(); });
    resetSpaceButton?.addEventListener('click', openResetModal);
    resetCancelButton?.addEventListener('click', closeResetModal);
    closeResetModalButton?.addEventListener('click', closeResetModal);
    resetModal?.addEventListener('click', (e) => { if (e.target === resetModal) closeResetModal(); });
    resetConfirmButton?.addEventListener('click', handleResetSpace);
    $('#connect-partner-button')?.addEventListener('click', openConnectPartnerModal);
    $('#close-connect-modal')?.addEventListener('click', closeConnectPartnerModal);
    $('#modal-copy-id-button')?.addEventListener('click', handleModalCopyId);
    $('#modal-join-space-form')?.addEventListener('submit', handleModalJoinSpace);
    connectPartnerModal?.addEventListener('click', (e) => { if (e.target === connectPartnerModal) closeConnectPartnerModal(); });
    fillSavedTheme();
    setupPWA();
    showStarterScreen();
  } catch (error) {
    console.error('Erro inicializando app:', error);
    showToast('Configuração do Firebase incorreta.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
