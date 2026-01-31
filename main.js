// ===============================
// Qiraah Swipe App – FINAL STABLE CORE
// ===============================

// ===============================
// API
// ===============================
let currentLanguage = 'ar'; // 'ar' | 'en'

function getAyahUrl(ref) {
  return `https://api.alquran.cloud/v1/ayah/${ref}/${currentLanguage}.asad`;
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
const profileView = document.getElementById('profile-view');
const profileTab = document.getElementById('profile-tab');
const profileContent = document.getElementById('profile-content');

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
    },
    profile: {
      active: 'https://i.ibb.co/tMQq5q3K/Profile-Active.png',
      inactive: 'https://i.ibb.co/N0jysZB/Profile-Inactive.png'
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

// Quran pointer (ORDER MODE)
let currentSurah = 1;
let currentAyah = 1;

let currentEl = null;

// ===============================
// SURAH AYAH COUNTS
// ===============================

const surahAyahCounts = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,
  111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,
  73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,
  60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,
  52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,
  19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,
  7,3,6,3,5,4,5,6
];

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
// FETCHERS
// ===============================
async function fetchAyahByOrder(surah, ayah) {
  const res = await fetch(getAyahUrl(`${surah}:${ayah}`));
  const json = await res.json();

  return {
    id: `${surah}:${ayah}`,
    surahNumber: surah,
    ayahNumber: ayah,
    text: json.data.text,
    surah: json.data.surah.englishName
  };
}

async function fetchRandomAyah() {
  const res = await fetch(
    `https://api.alquran.cloud/v1/ayah/random/${currentLanguage}.asad`
  );
  const json = await res.json();

  return {
    id: `${json.data.surah.number}:${json.data.numberInSurah}`,
    surahNumber: json.data.surah.number,
    ayahNumber: json.data.numberInSurah,
    text: json.data.text,
    surah: json.data.surah.englishName
  };
}

// ===============================
// POINTER LOGIC
// ===============================

function getNextPointer() {
  if (currentAyah < surahAyahCounts[currentSurah - 1]) {
    currentAyah++;
  } else if (currentSurah < 114) {
    currentSurah++;
    currentAyah = 1;
  }
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

  // HISTORY FORWARD
  if (historyIndex < ayahHistory.length - 1) {
    nextAyah = ayahHistory[historyIndex + 1];
  } else {
    // STRICT MODE CONTROL
    if (shuffleEnabled) {
      nextAyah = await fetchRandomAyah();
    } else {
      nextAyah = await fetchAyahByOrder(currentSurah, currentAyah);
      getNextPointer();
    }
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

  if (!shuffleEnabled) {
    currentSurah = ayahHistory[historyIndex]?.surahNumber || 1;
    currentAyah = (ayahHistory[historyIndex]?.ayahNumber || 0) + 1;
  }
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
  homeTab.querySelector('img').src =
    tab === 'home' ? icons.home.active : icons.home.inactive;

  bookmarksTab.querySelector('img').src =
    tab === 'bookmarks'
      ? icons.bookmarksTab.active
      : icons.bookmarksTab.inactive;

  profileTab.querySelector('img').src =
    tab === 'profile'
      ? icons.profile.active
      : icons.profile.inactive;
}

  homeTab.onclick = () => {
    appView.style.display = 'block';
    bookmarksView.style.display = 'none';
    profileView.style.display = 'none';
    setActiveTab('home');
  };
  
  bookmarksTab.onclick = () => {
    appView.style.display = 'none';
    bookmarksView.style.display = 'block';
    profileView.style.display = 'none';
    setActiveTab('bookmarks');
    renderBookmarks();
  };
  
  profileTab.onclick = () => {
    appView.style.display = 'none';
    bookmarksView.style.display = 'none';
    profileView.style.display = 'block';
  
    setActiveTab('profile');
    renderProfile();
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
// PROFILE VIEW (BASE)
// ===============================

function renderProfile() {
  profileContent.innerHTML = `
    <h2>Your Progress</h2>
    <p style="opacity:.6">Track your Quran reading journey</p>

    <div class="profile-placeholder">
      Progress system coming soon
    </div>
  `;
}

// ===============================
// INIT
// ===============================
loadState();

shuffleBtn.querySelector('img').src =
  shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;

// FORCE STARTING POINT (ORDER MODE)
if (!shuffleEnabled && ayahHistory.length === 0) {
  currentSurah = 1;
  currentAyah = 1;
}

// RESTORE FROM HISTORY
if (ayahHistory.length > 0 && historyIndex >= 0) {
  const ayah = ayahHistory[historyIndex];
  currentSurah = ayah.surahNumber;
  currentAyah = ayah.ayahNumber + 1;

  currentEl = createStoryElement(ayah);
  app.appendChild(currentEl);
  updateBookmarkIcon();
} else {
  goNext(); // ← this will now load 1:1
}

setActiveTab('home');
