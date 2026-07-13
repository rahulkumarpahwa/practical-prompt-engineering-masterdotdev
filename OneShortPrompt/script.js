/* ─── Storage ─────────────────────────────────────────────── */
const STORAGE_KEY = 'prompt_library_v1';

function loadPrompts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function savePrompts(prompts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

/* ─── State ───────────────────────────────────────────────── */
let prompts = loadPrompts();
let pendingDeleteId = null;
let searchQuery = '';

/* ─── DOM refs ────────────────────────────────────────────── */
const titleInput       = document.getElementById('promptTitle');
const contentInput     = document.getElementById('promptContent');
const charCount        = document.getElementById('charCount');
const saveBtn          = document.getElementById('saveBtn');
const promptGrid       = document.getElementById('promptGrid');
const promptCountEl    = document.getElementById('promptCount');
const searchWrapper    = document.getElementById('searchWrapper');
const searchInput      = document.getElementById('searchInput');
const deleteOverlay    = document.getElementById('deleteOverlay');
const deletePromptName = document.getElementById('deletePromptName');
const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const toastContainer   = document.getElementById('toastContainer');

/* ─── Helpers ─────────────────────────────────────────────── */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Toast ───────────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 2800) {
  const icons = { success: '&#10003;', error: '&#10005;', info: '&#8505;' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + icons[type] + '</span> ' + escHtml(message);
  toastContainer.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('removing');
    toast.addEventListener('animationend', function() { toast.remove(); }, { once: true });
  }, duration);
}

/* ─── Render ──────────────────────────────────────────────── */
function render() {
  var filtered = prompts.filter(function(p) {
    return !searchQuery ||
      p.title.toLowerCase().indexOf(searchQuery) !== -1 ||
      p.content.toLowerCase().indexOf(searchQuery) !== -1;
  });

  var total = prompts.length;
  promptCountEl.textContent = total === 0 ? 'No prompts'
    : total === 1 ? '1 prompt'
    : total + ' prompts';

  searchWrapper.style.display = total > 0 ? '' : 'none';
  promptGrid.innerHTML = '';

  if (filtered.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    if (total === 0) {
      empty.innerHTML =
        '<span class="empty-icon">&#128221;</span>' +
        '<h4>Your library is empty</h4>' +
        '<p>Create your first prompt using the form above.<br>Saved prompts will appear here.</p>';
    } else {
      empty.innerHTML =
        '<span class="empty-icon">&#128269;</span>' +
        '<h4>No results for &ldquo;' + escHtml(searchQuery) + '&rdquo;</h4>' +
        '<p>Try a different search term.</p>';
    }
    promptGrid.appendChild(empty);
    return;
  }

  filtered.forEach(function(prompt, idx) {
    var card = document.createElement('article');
    card.className = 'prompt-card';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = Math.min(idx * 0.05, 0.3) + 's';

    var words = wordCount(prompt.content);

    card.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' + escHtml(prompt.title) + '</div>' +
        '<div class="card-actions">' +
          '<button class="btn-icon copy-btn" title="Copy prompt" data-id="' + prompt.id + '" aria-label="Copy prompt">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '</button>' +
          '<button class="btn-icon delete-btn" title="Delete prompt" data-id="' + prompt.id + '" aria-label="Delete prompt">' +
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card-content">' + escHtml(prompt.content) + '</div>' +
      '<div class="card-rating" id="stars-' + prompt.id + '"></div>' +
      '<div class="card-footer">' +
        '<span class="card-date">' +
          '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          formatDate(prompt.createdAt) +
        '</span>' +
        '<span class="card-words">' + words + ' word' + (words !== 1 ? 's' : '') + '</span>' +
      '</div>';

    card.querySelector('.copy-btn').addEventListener('click', function() { copyPrompt(prompt.id); });
    card.querySelector('.delete-btn').addEventListener('click', function() { askDelete(prompt.id, prompt.title); });

    // Ensure legacy prompts have a ratings object
    if (!prompt.ratings) prompt.ratings = { userRating: 0, average: 0, count: 0 };
    renderStars(prompt.id, prompt.ratings, card.querySelector('#stars-' + prompt.id));

    promptGrid.appendChild(card);
  });
}

/* ─── Save ────────────────────────────────────────────────── */
function handleSave() {
  var title   = titleInput.value.trim();
  var content = contentInput.value.trim();
  if (!title || !content) return;

  var newPrompt = { id: genId(), title: title, content: content, createdAt: new Date().toISOString(), ratings: { userRating: 0, average: 0, count: 0 } };
  prompts = [newPrompt].concat(prompts);
  savePrompts(prompts);

  titleInput.value   = '';
  contentInput.value = '';
  updateCharCount();
  updateSaveBtn();
  render();
  showToast('Prompt saved!', 'success');
  promptGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Rating ─────────────────────────────────────────────── */
function renderStars(promptId, ratingsData, container) {
  if (!container) container = document.getElementById('stars-' + promptId);
  if (!container) return;

  var avg     = ratingsData.average;
  var count   = ratingsData.count;
  var userVal = ratingsData.userRating;

  var starsHtml = '<div class="star-group" role="group" aria-label="Rate this prompt">';
  for (var s = 1; s <= 5; s++) {
    var filled = s <= userVal ? ' filled' : (userVal === 0 && s <= Math.round(avg) ? ' avg-filled' : '');
    starsHtml +=
      '<button class="star-btn' + filled + '" ' +
        'data-id="' + promptId + '" ' +
        'data-val="' + s + '" ' +
        'aria-label="Rate ' + s + ' out of 5 stars" ' +
        'title="' + s + ' star' + (s !== 1 ? 's' : '') + '">' +
        '★' +
      '</button>';
  }
  starsHtml += '</div>';

  if (count > 0) {
    var displayAvg = avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(1);
    starsHtml += '<span class="rating-summary">' + displayAvg + ' · ' + count + ' rating' + (count !== 1 ? 's' : '') + '</span>';
  } else {
    starsHtml += '<span class="rating-summary unrated">Not yet rated</span>';
  }

  container.innerHTML = starsHtml;

  container.querySelectorAll('.star-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      ratePrompt(btn.getAttribute('data-id'), parseInt(btn.getAttribute('data-val'), 10));
    });
    btn.addEventListener('mouseenter', function() {
      var hoverVal = parseInt(btn.getAttribute('data-val'), 10);
      container.querySelectorAll('.star-btn').forEach(function(b, i) {
        b.classList.toggle('hovered', i < hoverVal);
      });
    });
    btn.addEventListener('mouseleave', function() {
      container.querySelectorAll('.star-btn').forEach(function(b) {
        b.classList.remove('hovered');
      });
    });
  });
}

function ratePrompt(promptId, starValue) {
  var prompt = prompts.find(function(p) { return p.id === promptId; });
  if (!prompt) return;
  if (!prompt.ratings) prompt.ratings = { userRating: 0, average: 0, count: 0 };

  var prev  = prompt.ratings.userRating;
  var avg   = prompt.ratings.average;
  var count = prompt.ratings.count;

  if (prev === starValue) {
    // Undo the rating
    if (count > 1) {
      prompt.ratings.average = (avg * count - prev) / (count - 1);
    } else {
      prompt.ratings.average = 0;
    }
    prompt.ratings.count      = Math.max(0, count - 1);
    prompt.ratings.userRating = 0;
    showToast('Rating removed.', 'info');
  } else if (prev === 0) {
    // First-time rating
    prompt.ratings.average    = count === 0 ? starValue : (avg * count + starValue) / (count + 1);
    prompt.ratings.count      = count + 1;
    prompt.ratings.userRating = starValue;
    showToast('Rated ' + starValue + ' star' + (starValue !== 1 ? 's' : '') + '!', 'success');
  } else {
    // Update existing rating
    prompt.ratings.average    = (avg * count - prev + starValue) / count;
    prompt.ratings.userRating = starValue;
    showToast('Rating updated to ' + starValue + ' star' + (starValue !== 1 ? 's' : '') + '.', 'info');
  }

  savePrompts(prompts);

  // Animate the star that was clicked
  var container = document.getElementById('stars-' + promptId);
  renderStars(promptId, prompt.ratings, container);
  if (container) {
    var clickedBtn = container.querySelectorAll('.star-btn')[starValue - 1];
    if (clickedBtn) {
      clickedBtn.classList.add('pop');
      clickedBtn.addEventListener('animationend', function() { clickedBtn.classList.remove('pop'); }, { once: true });
    }
  }
}

/* ─── Copy ────────────────────────────────────────────────── */
function copyPrompt(id) {
  var prompt = prompts.find(function(p) { return p.id === id; });
  if (!prompt) return;
  navigator.clipboard.writeText(prompt.content).then(function() {
    showToast('Copied to clipboard!', 'info');
  }).catch(function() {
    showToast('Copy failed — please copy manually.', 'error');
  });
}

/* ─── Delete ──────────────────────────────────────────────── */
function askDelete(id, title) {
  pendingDeleteId = id;
  deletePromptName.textContent = '"' + title + '"';
  deleteOverlay.classList.add('active');
  confirmDeleteBtn.focus();
}
function closeDialog() {
  deleteOverlay.classList.remove('active');
  pendingDeleteId = null;
}
function confirmDelete() {
  if (!pendingDeleteId) return;
  prompts = prompts.filter(function(p) { return p.id !== pendingDeleteId; });
  savePrompts(prompts);
  closeDialog();
  render();
  showToast('Prompt deleted.', 'error');
}

/* ─── Char counter & button state ────────────────────────── */
function updateCharCount() {
  var len = contentInput.value.length;
  charCount.textContent = len + ' / 2000';
  charCount.classList.toggle('warn', len > 1800);
}
function updateSaveBtn() {
  var ok = titleInput.value.trim().length > 0 && contentInput.value.trim().length > 0;
  saveBtn.disabled = !ok;
}

/* ─── Event listeners ────────────────────────────────────── */
titleInput.addEventListener('input', updateSaveBtn);
contentInput.addEventListener('input', function() { updateCharCount(); updateSaveBtn(); });
saveBtn.addEventListener('click', handleSave);

titleInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); contentInput.focus(); }
});
contentInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
});

searchInput.addEventListener('input', function() {
  searchQuery = searchInput.value.toLowerCase().trim();
  render();
});

cancelDeleteBtn.addEventListener('click', closeDialog);
confirmDeleteBtn.addEventListener('click', confirmDelete);
deleteOverlay.addEventListener('click', function(e) { if (e.target === deleteOverlay) closeDialog(); });
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && deleteOverlay.classList.contains('active')) closeDialog();
});

/* ─── Init ───────────────────────────────────────────────── */
render();
