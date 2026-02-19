// ===============================
// Qiraah Swipe App – FINAL STABLE CORE
// ===============================
const SWIPE_MS = 320;
const SWIPE_EASE = 'cubic-bezier(.2,.8,.2,1)';

// ===============================
// API
// ===============================
let currentLanguage = 'ar'; // 'ar' | 'en'

function getAyahUrl(ref) {
  return `https://api.alquran.cloud/v1/ayah/${ref}/${currentLanguage}.asad`;
}

function hasForwardHistory() {
  return historyIndex < ayahHistory.length - 1;
}


function startApp() {
  const startView = document.getElementById("start-view");
  const appView = document.getElementById("app-view");

  if (startView) {
    startView.style.display = "none";
    startView.style.pointerEvents = "none";
  }

  if (appView) appView.style.display = "block";

  window.dispatchEvent(new Event("qiraah:start"));
}

//...
function isProfileVisible() {
  return profileView && !profileView.classList.contains("hidden");
}

// ===============================
// ELEMENTS
// ===============================
const startView = document.getElementById('start-view');
// --- Safe persistence helper (works whether user system exists or not) ---
function persistAppState() {
  try { if (typeof saveState === "function") saveState(); } catch (_) {}
  try { if (typeof saveUserData === "function") saveUserData(); } catch (_) {}
}
const createAccountBtn = document.getElementById('create-account-btn');
const loginBtn = document.getElementById('login-btn');

const TOTAL_AYAHS = 6236;
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

// Prevent pinch-zoom & double-tap zoom (keeps swipe intact)
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

// ===============================
// LOGOUT (Delegated – works even if button is rendered later)
// ===============================
document.addEventListener("click", (e) => {
  if (e.target.closest("#logout-btn")) {
    // 1. Clear session only
    localStorage.removeItem("qiraah_session");

    // 2. Hide app views
    const startView = document.getElementById("start-view");
    const appView = document.getElementById("app-view");
    const bookmarksView = document.getElementById("bookmarks-view");
    const profileView = document.getElementById("profile-view");

    if (appView) appView.style.display = "none";
    if (bookmarksView) bookmarksView.classList.add("hidden");
    if (profileView) profileView.classList.add("hidden");

    // 3. Show login/start screen again
    if (startView) {
      startView.style.display = "flex";
      startView.style.pointerEvents = "auto";
    }

    // 4. Reset tab state visually
    if (typeof setActiveTab === "function") {
      setActiveTab("home");
    }
  }
});

// ===============================
// TOAST (Copy feedback)
// ===============================
let toastEl = null;
let toastTimer = null;

function ensureToast() {
  if (toastEl) return toastEl;

  toastEl = document.createElement("div");
  toastEl.id = "qiraah-toast";
  toastEl.textContent = "";
  toastEl.style.position = "fixed";
  toastEl.style.left = "50%";
  toastEl.style.top = "18px";
  toastEl.style.transform = "translateX(-50%) translateY(-8px)";
  toastEl.style.padding = "10px 14px";
  toastEl.style.borderRadius = "999px";
  toastEl.style.background = "rgba(0,0,0,0.78)";
  toastEl.style.color = "#fff";
  toastEl.style.fontSize = "14px";
  toastEl.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
  toastEl.style.zIndex = "999999";
  toastEl.style.opacity = "0";
  toastEl.style.pointerEvents = "none";
  toastEl.style.transition = "opacity 180ms ease, transform 220ms cubic-bezier(.2,.8,.2,1)";
  toastEl.style.backdropFilter = "blur(8px)";

  document.body.appendChild(toastEl);
  return toastEl;
}

function showToast(message = "Copied to clipboard") {
  const el = ensureToast();

  // Reset any previous animation/timer
  if (toastTimer) clearTimeout(toastTimer);
  el.textContent = message;

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(0)";
  });

  // Animate out
  toastTimer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(-8px)";
  }, 1200);
}

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
    },
    lang: {
      ar: 'https://i.ibb.co/ZpFysr1M/Lang-AR-1.png',
      en: 'https://i.ibb.co/mr1KPdpR/Lang-AR.png'
    }
  };


// ===============================
// STARTING PAGE
// ===============================


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
// i18n (Profile / Progress)
// ===============================
function isArabicUI() {
  return currentLanguage === "ar";
}

const i18n = {
  ar: {
    progressTitle: "تقدّمك",
    progressHint: "تابع رحلتك في قراءة القرآن",
    surahProgress: "تقدّم السورة",
    ayahProgress: "تقدّم الآية",
    totalQuran: "إجمالي القرآن",
    completedLine: (total, remaining) =>
      `لقد أكملت ${total}%، متبقّي ${remaining}%!`,
    percent: (n) => `${n.toFixed(2)}%`
  },
  en: {
    progressTitle: "Your Progress",
    progressHint: "Track your Quran reading journey",
    surahProgress: "Surah Progress",
    ayahProgress: "Ayah Progress",
    totalQuran: "Total Quran",
    completedLine: (total, remaining) =>
      `You’ve completed a total of ${total}%, ${remaining}% more to go!`,
    percent: (n) => `${n.toFixed(2)}%`
  }
};

function t() {
  return isArabicUI() ? i18n.ar : i18n.en;
}

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

function getUniqueReadAyahs() {
  const map = {};
  ayahHistory.forEach(a => {
    map[`${a.surahNumber}:${a.ayahNumber}`] = true;
  });
  return Object.keys(map);
}

function getSurahProgress() {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return 0;

  const surahTotal = surahAyahCounts[ayah.surahNumber - 1];

  const readInSurah = new Set();
  ayahHistory.forEach(a => {
    if (a.surahNumber === ayah.surahNumber) {
      readInSurah.add(a.ayahNumber);
    }
  });

  return Math.min(100, (readInSurah.size / surahTotal) * 100);
}

function getAyahProgress() {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return 0;

  const surahTotal = surahAyahCounts[ayah.surahNumber - 1];
  return (ayah.ayahNumber / surahTotal) * 100;
}

function getTotalProgress() {
  const uniqueAyahs = getUniqueReadAyahs();
  return (uniqueAyahs.length / TOTAL_AYAHS) * 100;
}

function renderProgress() {
  const tr = t();

  const surah = getSurahProgress();
  const ayah = getAyahProgress();
  const total = getTotalProgress();

  const surahEl = document.getElementById("surah-bar");
  const ayahEl = document.getElementById("ayah-bar");
  const totalEl = document.getElementById("total-bar");

  if (surahEl) surahEl.style.width = `${surah}%`;
  if (ayahEl) ayahEl.style.width = `${ayah}%`;
  if (totalEl) totalEl.style.width = `${total}%`;

  const remaining = Math.max(0, 100 - total);

  const subtitle = document.getElementById("progress-subtitle");
  if (subtitle) {
    subtitle.textContent = tr.completedLine(
      total.toFixed(2),
      remaining.toFixed(2)
    );
  }

  // Update labels if they exist in your HTML
  const labels = document.querySelectorAll(".progress-bar .label");
  if (labels.length >= 3) {
    labels[0].textContent = tr.surahProgress;
    labels[1].textContent = tr.ayahProgress;
    labels[2].textContent = tr.totalQuran;
  }

  // Optional: make profile content title/hint match language
  const profileTitle = document.querySelector("#profile-content h2");
  if (profileTitle) profileTitle.textContent = tr.progressTitle;

  const profileHint = document.querySelector("#profile-content p");
  if (profileHint) profileHint.textContent = tr.progressHint;
}

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
  const res = await fetch(
    `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${currentLanguage}.asad`
  );
  const json = await res.json();

  return {
    id: `${surah}:${ayah}`,
    surahNumber: surah,
    ayahNumber: ayah,
    text: json.data.text,
    surah: currentLanguage === 'ar' ? json.data.surah.name : json.data.surah.englishName
  };
}

async function fetchRandomAyah() {
  const res = await fetch(
    `https://api.alquran.cloud/v1/ayah/random/${currentLanguage}.asad?t=${Date.now()}`
  );
  const json = await res.json();

  return {
    id: `${json.data.surah.number}:${json.data.numberInSurah}`,
    surahNumber: json.data.surah.number,
    ayahNumber: json.data.numberInSurah,
    text: json.data.text,
    surah: currentLanguage === 'ar' ? json.data.surah.name : json.data.surah.englishName
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
  // Make stories behave like TikTok cards (overlapping full-screen)
  el.style.position = 'absolute';
  el.style.inset = '0';
  el.style.width = '100%';
  el.style.height = '100%';

  // API Arabic surah name often already starts with "سُورَةُ"
  const cleanSurahAr = (name) =>
    String(name || "")
      .replace(/^\s*(سورة|سُورَةُ)\s*/u, "")   // remove leading "سورة"/"سُورَةُ"
      .trim();

  const surahName =
    currentLanguage === "ar"
      ? cleanSurahAr(ayah.surah)
      : ayah.surah;

  const metaLabel =
    currentLanguage === 'ar'
      ? `سورة ${surahName} · آية ${ayah.ayahNumber}`
      : `${surahName} · Ayah ${ayah.ayahNumber}`;

  el.innerHTML = `
    <div class="story-inner">
      <p class="ayah-text">${ayah.text}</p>
      <div class="ayah-meta-inline">${metaLabel}</div>
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

  // ===============================
  // SHUFFLE MODE (ALWAYS FETCH NEW)
  // ===============================
  if (shuffleEnabled) {
    nextAyah = await fetchRandomAyah();

    // hard duplicate guard
    const last = ayahHistory[ayahHistory.length - 1];
    if (last && last.id === nextAyah.id) {
      nextAyah = await fetchRandomAyah();
    }

    ayahHistory.push(nextAyah);
    historyIndex = ayahHistory.length - 1;
  }

  // ===============================
  // ORDER MODE (SEQUENTIAL QURAN)
  // ===============================
  else {
    if (historyIndex < ayahHistory.length - 1) {
      historyIndex++;
      nextAyah = ayahHistory[historyIndex];
    } else {
      nextAyah = await fetchAyahByOrder(currentSurah, currentAyah);
      ayahHistory.push(nextAyah);
      historyIndex++;
      getNextPointer();
    }
  }

  // ===============================
  // ANIMATION
  // ===============================
  const nextEl = createStoryElement(nextAyah);
  nextEl.style.transform = 'translateY(100%)';
  app.appendChild(nextEl);

  requestAnimationFrame(() => {
    nextEl.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
    if (currentEl) {
      currentEl.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      currentEl.style.transform = 'translateY(-100%)';
    }
    nextEl.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    if (currentEl) app.removeChild(currentEl);
    currentEl = nextEl;
  
    updateBookmarkIcon();
    // bottom-left reference removed; meta is centered under the ayah
    persistAppState();
  
    loading = false;
  }, SWIPE_MS + 30);
}

function goPrevious() {
  if (loading || historyIndex <= 0) return;
  loading = true;

  const prevAyah = ayahHistory[historyIndex - 1];
  const prevEl = createStoryElement(prevAyah);

  prevEl.style.transform = 'translateY(-100%)';
  app.appendChild(prevEl);

  requestAnimationFrame(() => {
    prevEl.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
    if (currentEl) {
      currentEl.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      currentEl.style.transform = 'translateY(100%)';
    }
    prevEl.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    if (currentEl) app.removeChild(currentEl);
    currentEl = prevEl;
    historyIndex--;
  
    updateBookmarkIcon();
    persistAppState();
  
    loading = false;
  }, SWIPE_MS + 30);
}

// ===============================
// SWIPE HANDLING
// ===============================
let startY = 0;
const SWIPE_THRESHOLD = 45;

app.addEventListener('touchstart', e => {
  startY = e.touches[0].clientY;
});

app.addEventListener('touchend', e => {
  const delta = startY - e.changedTouches[0].clientY;
  if (Math.abs(delta) < SWIPE_THRESHOLD) return;
  delta > 0 ? goNext() : goPrevious();
});

app.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) < 20) return;
  e.deltaY > 0 ? goNext() : goPrevious();
}, { passive: true });

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

copyBtn.onclick = async () => {
  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;

  try {
    await navigator.clipboard.writeText(ayah.text);
    showToast(currentLanguage === "ar" ? "تم النسخ" : "Copied to clipboard");
  } catch (e) {
    // Fallback if clipboard is blocked (some Safari cases)
    try {
      const ta = document.createElement("textarea");
      ta.value = ayah.text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      showToast(currentLanguage === "ar" ? "تم النسخ" : "Copied to clipboard");
    } catch (err) {
      showToast(currentLanguage === "ar" ? "تعذر النسخ" : "Copy failed");
      console.error("Copy failed:", err);
    }
  }
};

// ===============================
// SHUFFLE
// ===============================
if (shuffleBtn) {
  shuffleBtn.onclick = () => {
    shuffleEnabled = !shuffleEnabled;

    // (button is removed now, but if you ever bring it back, this keeps working)
    const img = shuffleBtn.querySelector('img');
    if (img) img.src = shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;

    if (shuffleEnabled) {
      ayahHistory = ayahHistory.slice(0, historyIndex + 1);
    }

    persistAppState();
  };
}

// ===============================
// LANGUAGE TOGGLE
// ===============================
if (langBtn) {
  langBtn.onclick = async () => {
  if (loading) return;

  // Toggle language
  currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';

  // Update icon
  langBtn.querySelector('img').src =
    currentLanguage === 'ar'
      ? icons.lang.ar
      : icons.lang.en;

  const ayah = ayahHistory[historyIndex];
  if (!ayah) return;

  // 🚨 CRITICAL: discard forward history
  ayahHistory = ayahHistory.slice(0, historyIndex + 1);

  loading = true;

  // Re-fetch CURRENT ayah in new language
  const res = await fetch(getAyahUrl(ayah.id));
  const json = await res.json();

  ayah.text = json.data.text;
  ayah.surah = currentLanguage === 'ar' ? json.data.surah.name : json.data.surah.englishName;

  const textEl = currentEl?.querySelector('.ayah-text');
  if (textEl) textEl.textContent = ayah.text;

  const metaEl = currentEl?.querySelector('.ayah-meta-inline');
  if (metaEl) {
    metaEl.textContent =
      currentLanguage === 'ar'
        ? `سورة ${ayah.surah} · آية ${ayah.ayahNumber}`
        : `${ayah.surah} · Ayah ${ayah.ayahNumber}`;
  }

  persistAppState();
  saveState();

  // for instant profile refresh
  if (isProfileVisible()) {
    renderProgress();
  }
  
  renderProgress();
  loading = false;
};
}

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
    renderProgress();
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
    <div class="profile-topbar">
      <div>
        <h2>Your Progress</h2>
        <p style="opacity:.6">Track your Quran reading journey</p>
      </div>

      <button id="settings-btn" class="settings-icon-btn" aria-label="Settings">
        <img src="https://i.ibb.co/7NTJSLVk/Settings.png" alt="Settings">
      </button>
    </div>
  `;

  wireSettingsUI();   // <— add this line
}

function openSettings() {
  const panel = document.getElementById("settings-panel");
  if (panel) panel.classList.remove("hidden");
}

function closeSettings() {
  const panel = document.getElementById("settings-panel");
  if (panel) panel.classList.add("hidden");
}

function markLangActive() {
  const arBtn = document.getElementById("lang-ar");
  const enBtn = document.getElementById("lang-en");
  if (!arBtn || !enBtn) return;

  arBtn.classList.toggle("active", currentLanguage === "ar");
  enBtn.classList.toggle("active", currentLanguage === "en");
}


/**
 * Keep functionality without touching swipe engine:
 * - shuffleEnabled toggled here
 * - language changed here (future verses will follow)
 */
async function setLanguage(lang) {
  if (loading) return;
  if (lang !== "ar" && lang !== "en") return;
  if (currentLanguage === lang) return;

  currentLanguage = lang;
  markLangActive();
  persistAppState();

  // Optional but nice: re-fetch CURRENT ayah text in new language
  const ayah = ayahHistory?.[historyIndex];
  if (!ayah) {
    persistAppState();
    return;
  }

  loading = true;
  try {
    // Discard forward history so upcoming verses are in the new language
    if (Array.isArray(ayahHistory)) ayahHistory = ayahHistory.slice(0, historyIndex + 1);

    const res = await fetch(getAyahUrl(ayah.id));
    const json = await res.json();

    ayah.text = json.data.text;

    // Update on-screen text if present
    if (currentEl) {
      const t = currentEl.querySelector(".ayah-text");
      if (t) t.textContent = ayah.text;
    }

    persistAppState();
  } finally {
    loading = false;
  }
}

function setShuffle(enabled) {
  shuffleEnabled = !!enabled;

  // When turning shuffle ON, discard forward history so we don't loop/reuse
  if (shuffleEnabled && Array.isArray(ayahHistory)) {
    ayahHistory = ayahHistory.slice(0, historyIndex + 1);
  }

  persistAppState();
  persistAppState();
}

function wireSettingsUI() {
  const btn = document.getElementById("settings-btn");
  const closeBtn = document.getElementById("settings-close");
  const panel = document.getElementById("settings-panel");

  const shuffleToggle = document.getElementById("settings-shuffle");
  const arBtn = document.getElementById("lang-ar");
  const enBtn = document.getElementById("lang-en");

  if (btn) btn.onclick = openSettings;
  if (closeBtn) closeBtn.onclick = closeSettings;

  // close if user taps outside the card
  if (panel) {
    panel.addEventListener("click", (e) => {
      if (e.target === panel) closeSettings();
    });
  }

  // reflect current state
  if (shuffleToggle) shuffleToggle.checked = !!shuffleEnabled;
  markLangActive();

  if (shuffleToggle) {
    shuffleToggle.onchange = () => setShuffle(shuffleToggle.checked);
  }

  if (arBtn) arBtn.onclick = () => setLanguage("ar");
  if (enBtn) enBtn.onclick = () => setLanguage("en");
}

// ===============================
// INIT
// ===============================


// Old bottom-left reference (deprecated)
const ayahReferenceEl = document.getElementById('ayah-reference');
if (ayahReferenceEl) ayahReferenceEl.style.display = 'none';

loadState();

if (shuffleBtn) {
  const img = shuffleBtn.querySelector('img');
  if (img) img.src = shuffleEnabled ? icons.shuffle.active : icons.shuffle.inactive;
}

// FORCE STARTING POINT (ORDER MODE)
if (!shuffleEnabled && ayahHistory.length === 0) {
  currentSurah = 1;
  currentAyah = 1;
}

if (historyIndex >= 0 && ayahHistory[historyIndex]) {
  currentEl = createStoryElement(ayahHistory[historyIndex]);
  app.appendChild(currentEl);
} else {
  goNext();
}

if (langBtn) {
  const img = langBtn.querySelector('img');
  if (img) img.src = currentLanguage === 'ar' ? icons.lang.ar : icons.lang.en;
}

    appView.style.display = 'none';
    setActiveTab('home');


    window.addEventListener("qiraah:start", () => {
      const appView = document.getElementById("app-view");
      const bookmarksView = document.getElementById("bookmarks-view");
      const profileView = document.getElementById("profile-view");
    
      const homeTab = document.getElementById("home-tab");
      const bookmarksTab = document.getElementById("bookmarks-tab");
      const profileTab = document.getElementById("profile-tab");

      const tabIcons = {
        home: {
          active: "https://i.ibb.co/LdPFz7HY/Home-Active.png",
          inactive: "https://i.ibb.co/6c6K6YDC/Home-Inactive.png"
        },
        bookmarks: {
          active: "https://i.ibb.co/YTRkNwXh/Bookmarked-Tab-Active.png",
          inactive: "https://i.ibb.co/TNN1j54/Bookmarked-Tab-Inactive.png"
        },
        profile: {
          active: "https://i.ibb.co/tMQq5q3K/Profile-Active.png",
          inactive: "https://i.ibb.co/N0jysZB/Profile-Inactive.png"
        }
      };
      
      function hardShow(view) {
        // Always close settings if open (prevents black overlay)
        const settingsPanel = document.getElementById("settings-panel");
        if (settingsPanel) settingsPanel.classList.add("hidden");
      
        // Hide everything first (hard)
        if (appView) appView.style.display = "none";
        if (bookmarksView) {
          bookmarksView.style.display = "none";
          bookmarksView.classList.add("hidden");
        }
        if (profileView) {
          profileView.style.display = "none";
          profileView.classList.add("hidden");
        }
      
        // Show the requested view
        if (view === "home") {
          if (appView) appView.style.display = "block";
        }
      
        if (view === "bookmarks") {
          if (bookmarksView) {
            bookmarksView.classList.remove("hidden");
            bookmarksView.style.display = "block";
          }
          if (typeof renderBookmarks === "function") renderBookmarks();
        }
      
        if (view === "profile") {
          if (profileView) {
            profileView.classList.remove("hidden");
            profileView.style.display = "block";
          }
          if (typeof renderProfile === "function") renderProfile();
          if (typeof renderProgress === "function") renderProgress();
        }
      }
      
      // Tabs
      if (homeTab) homeTab.onclick = () => {
        hardShow("home");
        if (typeof setActiveTab === "function") setActiveTab("home");
      };
      
      if (bookmarksTab) bookmarksTab.onclick = () => {
        hardShow("bookmarks");
        if (typeof setActiveTab === "function") setActiveTab("bookmarks");
      };
      
      if (profileTab) profileTab.onclick = () => {
        hardShow("profile");
        if (typeof setActiveTab === "function") setActiveTab("profile");
      };
      
      // Default
      hardShow("home");
      if (typeof setActiveTab === "function") setActiveTab("home");
    });
