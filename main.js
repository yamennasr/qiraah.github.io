// ===============================
// Qiraah Swipe – STABLE SCROLL FEED
// ===============================

const API_URL = 'https://api.alquran.cloud/v1/ayah/random';

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
  }
};

// ===============================
// STATE
// ===============================

let bookmarks = {};
let loading = false;
let currentAyahId = null;

// ===============================
// FETCH AYAH
// ===============================

async function fetchAyah() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return {
    id: data.data.number,
    text: data.data.text
  };
}

// ===============================
// ADD STORY TO FEED
// ===============================

function appendStory(ayah) {
  const story = document.createElement('div');
  story.className = 'story';
  story.dataset.id = ayah.id;

  story.innerHTML = `
    <p class="ayah-text">${ayah.text}</p>
  `;

  app.appendChild(story);
  currentAyahId = ayah.id;
  updateBookmarkIcon();
}

// ===============================
// LOAD NEXT AYAH
// ===============================

async function loadNextAyah() {
  if (loading) return;
  loading = true;

  try {
    const ayah = await fetchAyah();
    appendStory(ayah);
  } catch (e) {
    console.error(e);
  }

  loading = false;
}

// ===============================
// SCROLL DETECTION (CORRECT WAY)
// ===============================

app.addEventListener('scroll', () => {
  const nearBottom =
    app.scrollTop + app.clientHeight >= app.scrollHeight - 100;

  if (nearBottom) {
    loadNextAyah();
  }
});

// ===============================
// BOOKMARK LOGIC
// ===============================

function updateBookmarkIcon() {
  bookmarkBtn.querySelector('img').src =
    bookmarks[currentAyahId]
      ? icons.save.active
      : icons.save.inactive;
}

bookmarkBtn.onclick = () => {
  if (!currentAyahId) return;

  if (bookmarks[currentAyahId]) {
    delete bookmarks[currentAyahId];
  } else {
    const story = document.querySelector(
      `.story[data-id="${currentAyahId}"] .ayah-text`
    );
    bookmarks[currentAyahId] = story.textContent;
  }

  updateBookmarkIcon();
};

// ===============================
// COPY
// ===============================

copyBtn.onclick = () => {
  const story = document.querySelector(
    `.story[data-id="${currentAyahId}"] .ayah-text`
  );
  if (story) navigator.clipboard.writeText(story.textContent);
};

// ===============================
// NAV
// ===============================

homeTab.onclick = () => {
  appView.style.display = 'block';
  bookmarksView.style.display = 'none';
};

bookmarksTab.onclick = () => {
  appView.style.display = 'none';
  bookmarksView.style.display = 'block';
  renderBookmarks();
};

// ===============================
// BOOKMARKS VIEW
// ===============================

function renderBookmarks() {
  bookmarksList.innerHTML = '';

  const items = Object.values(bookmarks);
  if (!items.length) {
    bookmarksList.innerHTML = '<p>No saved verses yet.</p>';
    return;
  }

  items.forEach(text => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.textContent = text;
    bookmarksList.appendChild(div);
  });
}

// ===============================
// INIT
// ===============================

loadNextAyah();
loadNextAyah(); // preload second for smooth scroll
