// ==========================
// Qiraah Swipe App (MVP)
// ==========================

// Example API: https://api.alquran.cloud/v1/ayah/random
// For demo purposes, we can fetch 5 random verses

const API_URL = 'https://api.alquran.cloud/v1/ayah/random';
const app = document.getElementById('app');
const bookmarkBtn = document.getElementById('bookmark-btn');
const copyBtn = document.getElementById('copy-btn');
const shuffleBtn = document.getElementById('shuffle-btn');

let stories = [];        // Stores fetched verses
let currentIndex = 0;
let bookmarks = new Set();
let shuffleMode = false;

// Fetch multiple random stories
async function fetchStories(count = 5) {
  stories = [];
  for (let i = 0; i < count; i++) {
    const res = await fetch(API_URL);
    const data = await res.json();
    stories.push({
      id: data.data.number,
      text: data.data.text
    });
  }
  renderStories();
}

// Render stories in DOM
function renderStories() {
  app.innerHTML = '';
  stories.forEach(story => {
    const div = document.createElement('div');
    div.classList.add('story');
    div.setAttribute('data-id', story.id);
    div.textContent = story.text;
    app.appendChild(div);
  });
  scrollToStory(currentIndex);
}

// Scroll to a specific story
function scrollToStory(index) {
  const storyElements = document.querySelectorAll('.story');
  if (storyElements[index]) {
    storyElements[index].scrollIntoView({ behavior: 'smooth' });
    updateControls();
  }
}

// Update buttons (bookmark highlight)
function updateControls() {
  const id = stories[currentIndex].id;
  bookmarkBtn.classList.toggle('active', bookmarks.has(id));
}

// ==========================
// Swipe / Scroll Handling
// ==========================

let startY = 0;
let endY = 0;

// Touch start
app.addEventListener('touchstart', e => {
  startY = e.touches[0].clientY;
});

// Touch end
app.addEventListener('touchend', e => {
  endY = e.changedTouches[0].clientY;
  handleSwipe();
});

// Mouse wheel (desktop testing)
document.addEventListener('wheel', e => {
  if (e.deltaY > 0) nextStory();
  else previousStory();
});

// ==========================
// Navigation
// ==========================
function nextStory() {
  if (shuffleMode) {
    currentIndex = Math.floor(Math.random() * stories.length);
  } else {
    currentIndex = Math.min(currentIndex + 1, stories.length - 1);
  }
  scrollToStory(currentIndex);
}

function previousStory() {
  if (shuffleMode) {
    currentIndex = Math.floor(Math.random() * stories.length);
  } else {
    currentIndex = Math.max(currentIndex - 1, 0);
  }
  scrollToStory(currentIndex);
}

function handleSwipe() {
  const diff = startY - endY;
  if (Math.abs(diff) > 50) { // threshold
    if (diff > 0) nextStory();
    else previousStory();
  }
}

// ==========================
// Buttons Actions
// ==========================
bookmarkBtn.addEventListener('click', () => {
  const id = stories[currentIndex].id;
  if (bookmarks.has(id)) bookmarks.delete(id);
  else bookmarks.add(id);
  updateControls();
});

copyBtn.addEventListener('click', () => {
  const story = stories[currentIndex];
  navigator.clipboard.writeText(`Qiraah #${story.id}: ${story.text}`)
    .then(() => alert('Copied to clipboard!'))
    .catch(() => alert('Copy failed'));
});

shuffleBtn.addEventListener('click', () => {
  shuffleMode = !shuffleMode;
  shuffleBtn.classList.toggle('active', shuffleMode);
});

// ==========================
// Initialize
// ==========================
fetchStories(10); // Fetch 10 random verses for MVP