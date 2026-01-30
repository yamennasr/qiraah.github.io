// ===============================
// Qiraah Swipe App – HISTORY + SHUFFLE (STABLE)
// ===============================

const API_URL = 'https://api.alquran.cloud/v1/ayah/random/ar.asad';

// ===============================
// ELEMENTS
// ===============================

const appView = document.getElementById('app-view');
const bookmarksView = document.getElementById('bookmarks-view');
const app = document.getElementById('app');
const bookmarksList = document.getElementById('bookmarks-list');

const bookmarkBtn = document.getElementById('bookmark-btn');
const copyBtn = document.getElementById('copy-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const homeTab = document.getElementById('home-tab');
const bookmarksTab = document.getElementById('bookmarks-tab');

// ===============================
// ICONS
// ===============================

const icons = {
  save: {
    active: 'https://i.ibb.co/0pLP8T6R/Save-Active.png',
    inactive: 'https://i.ibb.co/Q3P8BDcP/Save-Inactive.png'
  },
  shuffle: {
    active: 'https://i.ibb.co/215F5LQ3/Shuffle-Active.png',
    inactive: 'https://i.ibb.co/9mgRFgGv/Shuffle-Inactive.png'
  },
  home: {
    active: 'https://i.ibb.co/LdPFz7HY/Home-Active.png',
    inactive: 'https://i.ibb.co/6c6K6YDC/Home-Inactive.png'
  },
  bookmarksTab: {
    active: 'https://i.ibb.co/YTRkNwXh/Bookmarked-Tab-Active.png',
    inactive: 'https://i.ibb.co/TNN1j54/Bookmarked-Tab-Inactive.png'
  }
};

// ===============================
// STATE
// ===============================

let ayahHistory = [];
let historyIndex = -1;
let bookmarks = {};
let shuffleEnabled = false;
let loading = false;

// ===============================
// PERSISTENCE
// ===============================

function saveState() {
  localStorage.setItem('qiraah_history', JSON.stringify(ayahHistory));
  localStorage.setItem('qiraah_index', historyIndex);
  localStorage.setItem('qiraah_bookmarks', JSON.stringify(bookmarks));
  localStorage.setItem('qiraah_shuffle', shuffleEnabled);
}

function loadState() {
  ayahHistory = JSON.parse(localStorage.getItem('qiraah_history')) || [];
  historyIndex = Number(localStorage.getItem('qiraah_index')) || -1;
  bookmarks = JSON.parse(localStorage.getItem('qiraah_bookmarks')) || {};
  shuffleEnabled = localStorage.getItem('qiraah_shuffle') === 'true';
}

// ===============================
// FETCH AYAH
// ===============================

async function fetchRandomAyah() {
  const res = await fetch(`${API_URL}?t=${Date.now()}`);
  const json = await res.json();

  return {
    id: `${json.data.surah.number}:${json.data.numberInSurah}`,
    text: json.data.text,
    surah: json.data.surah.englishName,
    ayahNumber: json.data.numberInSurah
  };
}

// ===============================
// RENDER
// ===============================

function renderAyah(ayah) {
  app.innerHTML = `
    <div class="story">
      <p class="ayah-text">${ayah.text}</p>
      <div class="ayah-meta">${ayah.surah} · Ayah ${ayah.ayahNumber}</div>
    </div>
  `;

  updateBookmarkIcon();
  saveState();
}

// ===============================
// NAVIGATION
// ===============================

async function goNext() {
  if (loading) return;
  loading = true;

  if (historyIndex < ayahHistory.length - 1) {
    historyIndex++;
    renderAyah(ayahHistory[historyIndex]);
    loading = false;
    return;
  }

  const ayah = await fetchRandomAyah();
  ayahHistory.push(ayah);
  historyIndex++;

  renderAyah(ayah);
  loading = false;
}

function goPrevious() {
  if (historyIndex <= 0) return;

  historyIndex--;
  renderAyah(ayahHistory[historyIndex]);
}

// ===============================
// SWIPE HANDLING
// ===============================

let startY = 0;
const SWIPE_THRESHOLD = 60;

app.addEventListener('touchstart', e => {
  startY = e.touches[0].clientY;
});

app.addEventListener('touchend', e => {
  const endY = e.changedTouches[0].clientY;
  const delta = startY - endY;

  if (Math.abs(delta) < SWIPE_THRESHOLD) return;
  delta > 0 ? goNext() : goPrevious();
});

app.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) < 40) return;
  e.deltaY > 0 ? goNext() : goPrevious();
});

// ===============================
// BOOKMARKS
// ===============================

function updateBookmarkIcon() {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;

  bookmarkBtn.querySelector('img').src =
    bookmarks[ayah.id]
      ? icons.save.active
      : icons.save.inactive;
}

bookmarkBtn.onclick = () => {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;

  bookmarks[ayah.id]
    ? delete bookmarks[ayah.id]
    : (bookmarks[ayah.id] = ayah);

  updateBookmarkIcon();
  saveState();
};

copyBtn.onclick = () => {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;
  navigator.clipboard.writeText(ayah.text);
};

// ===============================
// SHUFFLE (REAL, SAFE)
// ===============================

shuffleBtn.onclick = () => {
  shuffleEnabled = !shuffleEnabled;

  shuffleBtn.querySelector('img').src =
    shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;

  if (shuffleEnabled && historyIndex < ayahHistory.length - 1) {
    const past = ayahHistory.slice(0, historyIndex + 1);
    const future = ayahHistory.slice(historyIndex + 1);
    future.sort(() => Math.random() - 0.5);
    ayahHistory = past.concat(future);
  }

  saveState();
};

// ===============================
// BOTTOM NAV
// ===============================

homeTab.onclick = () => {
  appView.style.display = 'block';
  bookmarksView.style.display = 'none';

  homeTab.querySelector('img').src = icons.home.active;
  bookmarksTab.querySelector('img').src = icons.bookmarksTab.inactive;
};

bookmarksTab.onclick = () => {
  appView.style.display = 'none';
  bookmarksView.style.display = 'block';

  bookmarksTab.querySelector('img').src = icons.bookmarksTab.active;
  homeTab.querySelector('img').src = icons.home.inactive;

  renderBookmarks();
};

// ===============================
// BOOKMARKS VIEW
// ===============================

function renderBookmarks() {
  bookmarksList.innerHTML = '';

  const items = Object.values(bookmarks);

  if (!items.length) {
    bookmarksList.innerHTML =
      '<p style="opacity:.6">No saved verses yet. Click the bookmark icon to save one now!</p>';
    return;
  }

  items.forEach(a => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.textContent = a.text;
    bookmarksList.appendChild(div);
  });
}

// ===============================
// INIT
// ===============================

loadState();

shuffleBtn.querySelector('img').src =
  shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;

if (historyIndex >= 0 && ayahHistory[historyIndex]) {
  renderAyah(ayahHistory[historyIndex]);
} else {
  goNext();
}
