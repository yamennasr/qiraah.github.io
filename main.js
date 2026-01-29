// ===============================
// Qiraah Swipe App – STABLE RANDOM AYAH
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

let currentAyah = null;
let bookmarks = {};
let loading = false;
let shuffleEnabled = false;

// ===============================
// FETCH RANDOM AYAH (SAFE)
// ===============================

async function fetchRandomAyah() {
  const res = await fetch(`${API_URL}?t=${Date.now()}`); // cache-bust
  const json = await res.json();

  return {
    id: `${json.data.surah.number}:${json.data.numberInSurah}`,
    text: json.data.text,
    surah: json.data.surah.englishName,
    ayahNumber: json.data.numberInSurah
  };
}

// ===============================
// RENDER AYAH
// ===============================

function renderAyah(ayah) {
  app.innerHTML = `
    <div class="story">
      <p class="ayah-text">${ayah.text}</p>
    </div>
  `;

  currentAyah = ayah;
  updateBookmarkIcon();
}

// ===============================
// LOAD NEXT AYAH (HARD GUARANTEE)
// ===============================

async function loadNextAyah() {
  if (loading) return;
  loading = true;

  try {
    const ayah = await fetchRandomAyah();
    renderAyah(ayah);
  } catch (err) {
    console.error('Ayah fetch failed:', err);
  }

  // lock for a short moment to avoid double-fire
  setTimeout(() => {
    loading = false;
  }, 300);
}

// ===============================
// SWIPE DETECTION (TOUCH + MOUSE)
// ===============================

let startY = 0;
const SWIPE_THRESHOLD = 60;

// Touch
app.addEventListener('touchstart', e => {
  startY = e.touches[0].clientY;
});

app.addEventListener('touchend', e => {
  const endY = e.changedTouches[0].clientY;
  if (Math.abs(startY - endY) > SWIPE_THRESHOLD) {
    loadNextAyah();
  }
});

// Mouse wheel
app.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) > 40) {
    loadNextAyah();
  }
});

// ===============================
// ICON STATE
// ===============================

function updateBookmarkIcon() {
  if (!currentAyah) return;

  bookmarkBtn.querySelector('img').src =
    bookmarks[currentAyah.id]
      ? icons.save.active
      : icons.save.inactive;
}

// ===============================
// ACTION BUTTONS
// ===============================

bookmarkBtn.onclick = () => {
  if (!currentAyah) return;

  if (bookmarks[currentAyah.id]) {
    delete bookmarks[currentAyah.id];
  } else {
    bookmarks[currentAyah.id] = currentAyah;
  }

  updateBookmarkIcon();
};

copyBtn.onclick = () => {
  if (!currentAyah) return;
  navigator.clipboard.writeText(currentAyah.text);
};

shuffleBtn.onclick = () => {
  shuffleEnabled = !shuffleEnabled;
  shuffleBtn.querySelector('img').src =
    shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;
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
      '<p style="opacity:.6">No saved verses yet.</p>';
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

loadNextAyah();
