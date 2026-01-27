const API_URL = 'https://api.alquran.cloud/v1/ayah/random';

const app = document.getElementById('app');
const bookmarkBtn = document.getElementById('bookmark-btn');
const copyBtn = document.getElementById('copy-btn');
const shuffleBtn = document.getElementById('shuffle-btn');

const homeTab = document.getElementById('home-tab');
const bookmarksTab = document.getElementById('bookmarks-tab');
const bookmarksView = document.getElementById('bookmarks-view');
const appView = document.getElementById('app-view');
const bookmarksList = document.getElementById('bookmarks-list');

let currentStory = null;
let bookmarks = {};
let shuffleMode = false;

/* FETCH AYAH */
async function fetchAyah() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return {
    id: data.data.number,
    text: data.data.text
  };
}

/* RENDER STORY */
async function renderStory() {
  const ayah = await fetchAyah();
  currentStory = ayah;

  app.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'story';
  div.textContent = ayah.text;
  app.appendChild(div);

  updateControls();
}

/* CONTROLS */
function updateControls() {
  bookmarkBtn.classList.toggle(
    'active',
    bookmarks[currentStory.id]
  );
}

/* SWIPE */
let startY = 0;
app.addEventListener('touchstart', e => startY = e.touches[0].clientY);
app.addEventListener('touchend', e => {
  if (Math.abs(startY - e.changedTouches[0].clientY) > 50) {
    renderStory();
  }
});

/* BUTTON ACTIONS */
bookmarkBtn.onclick = () => {
  if (!currentStory) return;
  if (bookmarks[currentStory.id]) delete bookmarks[currentStory.id];
  else bookmarks[currentStory.id] = currentStory.text;
  updateControls();
};

copyBtn.onclick = () => {
  navigator.clipboard.writeText(currentStory.text);
};

shuffleBtn.onclick = () => {
  shuffleMode = !shuffleMode;
  shuffleBtn.classList.toggle('active', shuffleMode);
};

/* NAVIGATION */
homeTab.onclick = () => {
  homeTab.classList.add('active');
  bookmarksTab.classList.remove('active');
  bookmarksView.classList.add('hidden');
  appView.classList.remove('hidden');
};

bookmarksTab.onclick = () => {
  bookmarksTab.classList.add('active');
  homeTab.classList.remove('active');
  appView.classList.add('hidden');
  bookmarksView.classList.remove('hidden');
  renderBookmarks();
};

/* BOOKMARK LIST */
function renderBookmarks() {
  bookmarksList.innerHTML = '';
  Object.values(bookmarks).forEach(text => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.textContent = text;
    bookmarksList.appendChild(div);
  });
}

/* INIT */
renderStory();
