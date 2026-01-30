// ===============================
// Qiraah Swipe App – FINAL STABLE CORE
// ===============================

// ===============================
// API
// ===============================
let currentLanguage = 'ar'; // 'ar' | 'en'

function getApiUrl() {
  return currentLanguage === 'ar'
    ? 'https://api.alquran.cloud/v1/ayah/random/ar.asad'
    : 'https://api.alquran.cloud/v1/ayah/random/en.asad';
}

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
const langBtn = document.getElementById('lang-btn');

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
let currentEl = null;

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
// FETCH
// ===============================
async function fetchRandomAyah() {
  const res = await fetch(`${getApiUrl()}?t=${Date.now()}`);
  const json = await res.json();

  return {
    id: `${json.data.surah.number}:${json.data.numberInSurah}`,
    surahNumber: json.data.surah.number,
    ayahNumber: json.data.numberInSurah,
    surah: json.data.surah.englishName,
    text: json.data.text
  };
}

// ===============================
// RENDER
// ===============================
function createStoryElement(ayah) {
  const el = document.createElement('div');
  el.className = 'story';

  el.innerHTML = `
    <div class="story-inner">
      <p class="ayah-text">${ayah.text}</p>
      <div class="ayah-meta">${ayah.surah} · Ayah ${ayah.ayahNumber}</div>
    </div>
  `;

  return el;
}

function clearTransition(el) {
  if (!el) return;
  el.style.transition = 'none';
}

// ===============================
// NAVIGATION (REAL SWIPE ENGINE)
// ===============================
async function goNext() {
  if (loading) return;
  loading = true;

  let nextAyah;
  if (historyIndex < ayahHistory.length - 1) {
    nextAyah = ayahHistory[historyIndex + 1];
  } else {
    nextAyah = await fetchRandomAyah();
    ayahHistory.push(nextAyah);
  }

  const nextEl = createStoryElement(nextAyah);
  nextEl.style.transform = 'translateY(100%)';
  nextEl.style.opacity = '0';
  app.appendChild(nextEl);

  requestAnimationFrame(() => {
    nextEl.style.transition =
      'transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.35s ease';
    if (currentEl) {
      currentEl.style.transition =
        'transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.35s ease';
    }

    nextEl.style.transform = 'translateY(0)';
    nextEl.style.opacity = '1';

    if (currentEl) {
      currentEl.style.transform = 'translateY(-25%)';
      currentEl.style.opacity = '0';
    }
  });

  setTimeout(() => {
    if (currentEl) app.removeChild(currentEl);
    clearTransition(nextEl);

    currentEl = nextEl;
    historyIndex++;
    updateBookmarkIcon();
    saveState();
    loading = false;
  }, 480);
}

function goPrevious() {
  if (loading || historyIndex <= 0) return;
  loading = true;

  const prevAyah = ayahHistory[historyIndex - 1];
  const prevEl = createStoryElement(prevAyah);

  prevEl.style.transform = 'translateY(-100%)';
  prevEl.style.opacity = '0';
  app.appendChild(prevEl);

  requestAnimationFrame(() => {
    prevEl.style.transition =
      'transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.35s ease';
    if (currentEl) {
      currentEl.style.transition =
        'transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.35s ease';
    }

    prevEl.style.transform = 'translateY(0)';
    prevEl.style.opacity = '1';

    if (currentEl) {
      currentEl.style.transform = 'translateY(25%)';
      currentEl.style.opacity = '0';
    }
  });

  setTimeout(() => {
    if (currentEl) app.removeChild(currentEl);
    clearTransition(prevEl);

    currentEl = prevEl;
    historyIndex--;
    updateBookmarkIcon();
    saveState();
    loading = false;
  }, 480);
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
  const delta = startY - e.changedTouches[0].clientY;
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
    bookmarks[ayah.id] ? icons.save.active : icons.save.inactive;
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
  if (ayah) navigator.clipboard.writeText(ayah.text);
};

// ===============================
// SHUFFLE
// ===============================
shuffleBtn.onclick = () => {
  shuffleEnabled = !shuffleEnabled;
  shuffleBtn.querySelector('img').src =
    shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;
  saveState();
};

// ===============================
// LANGUAGE TOGGLE
// ===============================
langBtn.onclick = async () => {
  if (loading) return;

  currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
  langBtn.querySelector('span').textContent =
    currentLanguage === 'ar' ? 'AR' : 'EN';

  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;

  loading = true;
  const res = await fetch(
    `https://api.alquran.cloud/v1/ayah/${ayah.id}/${currentLanguage}.asad`
  );
  const json = await res.json();

  ayah.text = json.data.text;
  currentEl.querySelector('.ayah-text').textContent = ayah.text;
  loading = false;
};

// ===============================
// BOTTOM NAV
// ===============================
function setActiveTab(tab) {
    if (tab === 'home') {
      homeTab.querySelector('img').src = icons.home.active;
      bookmarksTab.querySelector('img').src = icons.bookmarksTab.inactive;
    } else {
      bookmarksTab.querySelector('img').src = icons.bookmarksTab.active;
      homeTab.querySelector('img').src = icons.home.inactive;
    }
  }

  homeTab.onclick = () => {
    appView.style.display = 'block';
    bookmarksView.style.display = 'none';
    setActiveTab('home');
  };
  
  bookmarksTab.onclick = () => {
    appView.style.display = 'none';
    bookmarksView.style.display = 'block';
    setActiveTab('bookmarks');
    renderBookmarks();
  };

// ===============================
// BOOKMARKS VIEW
// ===============================
function renderBookmarks() {
  bookmarksList.innerHTML = '';
  const items = Object.values(bookmarks);

  if (!items.length) {
    bookmarksList.innerHTML = '<p style="opacity:.6">No saved verses yet.</p>';
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

if (ayahHistory[historyIndex]) {
  currentEl = createStoryElement(ayahHistory[historyIndex]);
  app.appendChild(currentEl);
  updateBookmarkIcon();
} else {
  goNext();
}

setActiveTab('home');
