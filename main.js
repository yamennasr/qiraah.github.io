// ===============================
// Qiraah Swipe App – JPG Icons
// ===============================

const API_URL = 'https://api.alquran.cloud/v1/ayah/random';

// Views
const appView = document.getElementById('app-view');
const bookmarksView = document.getElementById('bookmarks-view');
const app = document.getElementById('app');
const bookmarksList = document.getElementById('bookmarks-list');

// Buttons
const bookmarkBtn = document.getElementById('bookmark-btn');
const copyBtn = document.getElementById('copy-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const homeTab = document.getElementById('home-tab');
const bookmarksTab = document.getElementById('bookmarks-tab');

// ===============================
// ICON URLS (JPG)
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

let bookmarks = {};
let currentStoryEl = null;
let loading = false;

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
// CREATE STORY
// ===============================

function createStory(text, id) {
  const div = document.createElement('div');
  div.className = 'story';
  div.dataset.id = id;
  div.textContent = text;
  return div;
}

// ===============================
// ADD STORY (INFINITE FEED)
// ===============================

async function addStory() {
  if (loading) return;
  loading = true;

  const ayah = await fetchAyah();
  const story = createStory(ayah.text, ayah.id);
  app.appendChild(story);

  if (!currentStoryEl) {
    currentStoryEl = story;
    updateBookmarkIcon(story.dataset.id);
  }

  loading = false;
}

// ===============================
// INIT FEED
// ===============================

async function initFeed() {
  app.innerHTML = '';
  await addStory();
  await addStory(); // preload next
}

// ===============================
// SCROLL HANDLING
// ===============================

app.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = app;

  // Load next Ayah near bottom
  if (scrollTop + clientHeight >= scrollHeight - 80) {
    addStory();
  }

  // Detect active story
  const stories = document.querySelectorAll('.story');
  stories.forEach(story => {
    const rect = story.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
      if (currentStoryEl !== story) {
        currentStoryEl = story;
        updateBookmarkIcon(story.dataset.id);
      }
    }
  });
});

// ===============================
// ICON UPDATES
// ===============================

function updateBookmarkIcon(id) {
  bookmarkBtn.querySelector('img').src =
    bookmarks[id] ? icons.save.active : icons.save.inactive;
}

// ===============================
// ACTION BUTTONS
// ===============================

// Bookmark
bookmarkBtn.onclick = () => {
  if (!currentStoryEl) return;

  const id = currentStoryEl.dataset.id;
  const text = currentStoryEl.textContent;

  if (bookmarks[id]) delete bookmarks[id];
  else bookmarks[id] = text;

  updateBookmarkIcon(id);
};

// Copy
copyBtn.onclick = () => {
  if (!currentStoryEl) return;
  navigator.clipboard.writeText(currentStoryEl.textContent);
};

// Shuffle (UI only for MVP)
shuffleBtn.onclick = () => {
  const img = shuffleBtn.querySelector('img');
  const isActive = img.src === icons.shuffle.active;
  img.src = isActive ? icons.shuffle.inactive : icons.shuffle.active;
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

initFeed();
