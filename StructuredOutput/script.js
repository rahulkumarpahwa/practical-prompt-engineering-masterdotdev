/* ─── Storage ─────────────────────────────────────────────── */
const STORAGE_KEY = "prompt_library_v1";
const NOTES_STORAGE_KEY = "promptLibrary.notesByPrompt";

function loadPrompts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function savePrompts(prompts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

/* ─── State ───────────────────────────────────────────────── */
let prompts = loadPrompts();
let pendingDeleteId = null;
let searchQuery = "";

// Notes state — tracks which note is being edited, per prompt
const activeEditNoteId = {}; // { [promptId]: noteId | null }
let pendingNoteDelete = null; // { promptId, noteId }

/* ─── DOM refs ────────────────────────────────────────────── */
const titleInput = document.getElementById("promptTitle");
const contentInput = document.getElementById("promptContent");
const charCount = document.getElementById("charCount");
const saveBtn = document.getElementById("saveBtn");
const promptGrid = document.getElementById("promptGrid");
const promptCountEl = document.getElementById("promptCount");
const searchWrapper = document.getElementById("searchWrapper");
const searchInput = document.getElementById("searchInput");
const deleteOverlay = document.getElementById("deleteOverlay");
const deletePromptName = document.getElementById("deletePromptName");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const toastContainer = document.getElementById("toastContainer");
const modelInput = document.getElementById("promptModel");
const isCodeInput = document.getElementById("promptIsCode");

// Note delete modal refs
const noteDeleteOverlay   = document.getElementById("noteDeleteOverlay");
const cancelNoteDeleteBtn = document.getElementById("cancelNoteDeleteBtn");
const confirmNoteDeleteBtn = document.getElementById("confirmNoteDeleteBtn");

/* ─── Helpers ─────────────────────────────────────────────── */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─── Metadata System ──────────────────────────────────────── */
function isValidISO8601(dateStr) {
  if (typeof dateStr !== 'string') return false;
  // Exact ISO 8601 format check: YYYY-MM-DDTHH:mm:ss.sssZ
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (!isoRegex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.toISOString() === dateStr;
}

function estimateTokens(text, isCode) {
  if (typeof text !== 'string') {
    throw new Error("Content text must be a string.");
  }
  
  const trimmed = text.trim();
  const word_count = trimmed ? trimmed.split(/\s+/).length : 0;
  const character_count = text.length;
  
  let min = 0.75 * word_count;
  let max = 0.25 * character_count;
  
  if (isCode) {
    min *= 1.3;
    max *= 1.3;
  }
  
  // Round estimation results to integers
  min = Math.round(min);
  max = Math.round(max);
  
  // Ensure min <= max
  if (min > max) {
    min = max;
  }
  
  // Determine confidence based on tokens (using max as the boundary check)
  const tokenVal = max;
  let confidence = 'high';
  if (tokenVal > 5000) {
    confidence = 'low';
  } else if (tokenVal >= 1000) {
    confidence = 'medium';
  }
  
  return {
    min: min,
    max: max,
    confidence: confidence
  };
}

function trackModel(modelName, content, isCode = false) {
  if (typeof modelName !== 'string' || modelName.trim() === '') {
    throw new Error("Model name must be a non-empty string.");
  }
  if (modelName.length > 100) {
    throw new Error("Model name must not exceed 100 characters.");
  }
  if (typeof content !== 'string') {
    throw new Error("Content must be a string.");
  }
  
  const createdAt = new Date().toISOString();
  const tokenEstimate = estimateTokens(content, isCode);
  
  return {
    model: modelName.trim(),
    createdAt: createdAt,
    updatedAt: createdAt,
    tokenEstimate: tokenEstimate
  };
}

function updateTimestamps(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error("Metadata must be a valid object.");
  }
  if (!isValidISO8601(metadata.createdAt)) {
    throw new Error("createdAt must be a valid ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ss.sssZ).");
  }
  if (!isValidISO8601(metadata.updatedAt)) {
    throw new Error("updatedAt must be a valid ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ss.sssZ).");
  }
  
  const now = new Date().toISOString();
  
  const createdTime = new Date(metadata.createdAt).getTime();
  const updatedTime = new Date(now).getTime();
  
  if (updatedTime < createdTime) {
    throw new Error("updatedAt timestamp cannot be before createdAt timestamp.");
  }
  
  return {
    ...metadata,
    updatedAt: now
  };
}

function updatePromptMetadata(promptId) {
  var prompt = prompts.find(function (p) { return p.id === promptId; });
  if (prompt) {
    if (!prompt.metadata) {
      prompt.metadata = trackModel("Legacy Model", prompt.content, false);
    } else {
      try {
        prompt.metadata = updateTimestamps(prompt.metadata);
      } catch (e) {
        console.error("Failed to update prompt timestamps:", e);
      }
    }
    savePrompts(prompts);
  }
}

/* ─── Notes Storage ───────────────────────────────────────── */
function loadAllNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function loadNotes(promptId) {
  return loadAllNotes()[promptId] || [];
}
function persistNotes(promptId, notes) {
  var all = loadAllNotes();
  all[promptId] = notes;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (e) {
    // Handle quota exceeded
    if (e.name === "QuotaExceededError" || e.code === 22) {
      return "quota";
    }
    return false;
  }
}

/* ─── Notes CRUD ──────────────────────────────────────────── */
function createNote(promptId, content) {
  var notes = loadNotes(promptId);
  var now = Date.now();
  var note = {
    id: genId(),
    promptId: promptId,
    content: content,
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  var res = persistNotes(promptId, notes);
  if (res === true) {
    updatePromptMetadata(promptId);
    return note;
  }
  return res;
}
function updateNote(promptId, noteId, content) {
  var notes = loadNotes(promptId);
  var note = notes.find(function (n) { return n.id === noteId; });
  if (!note) return false;
  note.content = content;
  note.updatedAt = Date.now();
  var res = persistNotes(promptId, notes);
  if (res === true) {
    updatePromptMetadata(promptId);
  }
  return res;
}
function deleteNote(promptId, noteId) {
  var notes = loadNotes(promptId).filter(function (n) { return n.id !== noteId; });
  var res = persistNotes(promptId, notes);
  if (res === true) {
    updatePromptMetadata(promptId);
  }
  return res;
}

/* ─── Toast ───────────────────────────────────────────────── */
function showToast(message, type = "success", duration = 2800) {
  const icons = { success: "&#10003;", error: "&#10005;", info: "&#8505;" };
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerHTML =
    '<span class="toast-icon">' + icons[type] + "</span> " + escHtml(message);
  toastContainer.appendChild(toast);
  setTimeout(function () {
    toast.classList.add("removing");
    toast.addEventListener(
      "animationend",
      function () {
        toast.remove();
      },
      { once: true },
    );
  }, duration);
}

/* ─── Render ──────────────────────────────────────────────── */
function render() {
  var filtered = prompts.filter(function (p) {
    return (
      !searchQuery ||
      p.title.toLowerCase().indexOf(searchQuery) !== -1 ||
      p.content.toLowerCase().indexOf(searchQuery) !== -1
    );
  });

  // Sort prompts by metadata.createdAt (falling back to prompt.createdAt) descending
  filtered.sort(function (a, b) {
    const timeA = new Date(a.metadata ? a.metadata.createdAt : a.createdAt).getTime();
    const timeB = new Date(b.metadata ? b.metadata.createdAt : b.createdAt).getTime();
    return timeB - timeA;
  });

  var total = prompts.length;
  promptCountEl.textContent =
    total === 0 ? "No prompts" : total === 1 ? "1 prompt" : total + " prompts";

  searchWrapper.style.display = total > 0 ? "" : "none";
  promptGrid.innerHTML = "";

  if (filtered.length === 0) {
    var empty = document.createElement("div");
    empty.className = "empty-state";
    if (total === 0) {
      empty.innerHTML =
        '<span class="empty-icon">&#128221;</span>' +
        "<h4>Your library is empty</h4>" +
        "<p>Create your first prompt using the form above.<br>Saved prompts will appear here.</p>";
    } else {
      empty.innerHTML =
        '<span class="empty-icon">&#128269;</span>' +
        "<h4>No results for &ldquo;" +
        escHtml(searchQuery) +
        "&rdquo;</h4>" +
        "<p>Try a different search term.</p>";
    }
    promptGrid.appendChild(empty);
    return;
  }

  filtered.forEach(function (prompt, idx) {
    var card = document.createElement("article");
    card.className = "prompt-card";
    card.setAttribute("role", "listitem");
    card.style.animationDelay = Math.min(idx * 0.05, 0.3) + "s";

    var words = wordCount(prompt.content);

    var metadataHtml = "";
    if (prompt.metadata) {
      const meta = prompt.metadata;
      const confidenceClass = "confidence-" + meta.tokenEstimate.confidence;
      metadataHtml =
        '<div class="card-metadata">' +
        '  <div class="metadata-row">' +
        '    <span class="metadata-label">Model</span>' +
        '    <span class="metadata-value model-badge">' + escHtml(meta.model) + '</span>' +
        '  </div>' +
        '  <div class="metadata-row">' +
        '    <span class="metadata-label">Est. Tokens</span>' +
        '    <span class="metadata-value token-badge ' + confidenceClass + '">' +
               meta.tokenEstimate.min + ' - ' + meta.tokenEstimate.max + 
               ' <span class="confidence-text">(' + meta.tokenEstimate.confidence + ')</span>' +
        '    </span>' +
        '  </div>' +
        '  <div class="metadata-dates">' +
        '    <span>' +
        '      <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        '      Created: ' + formatDateTime(meta.createdAt) +
        '    </span>' +
        (meta.updatedAt !== meta.createdAt
          ? '    <span>' +
            '      <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>' +
            '      Updated: ' + formatDateTime(meta.updatedAt) +
            '    </span>'
          : '') +
        '  </div>' +
        '</div>';
    } else {
      metadataHtml =
        '<div class="card-metadata legacy-metadata">' +
        '  <div class="metadata-row">' +
        '    <span class="metadata-label">Model</span>' +
        '    <span class="metadata-value model-badge">Legacy Prompt</span>' +
        '  </div>' +
        '  <div class="metadata-dates">' +
        '    <span>' +
        '      <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        '      Created: ' + formatDateTime(prompt.createdAt) +
        '    </span>' +
        '  </div>' +
        '</div>';
    }

    card.innerHTML =
      '<div class="card-header">' +
      '<div class="card-title">' +
      escHtml(prompt.title) +
      "</div>" +
      '<div class="card-actions">' +
      '<button class="btn-icon copy-btn" title="Copy prompt" data-id="' +
      prompt.id +
      '" aria-label="Copy prompt">' +
      '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      "</button>" +
      '<button class="btn-icon delete-btn" title="Delete prompt" data-id="' +
      prompt.id +
      '" aria-label="Delete prompt">' +
      '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="card-content">' +
      escHtml(prompt.content) +
      "</div>" +
      '<div class="card-rating" id="stars-' +
      prompt.id +
      '"></div>' +
      metadataHtml +
      '<div class="card-footer">' +
      '<span class="card-date">' +
      '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      formatDate(prompt.createdAt) +
      "</span>" +
      '<div class="card-token-tags">' +
      '<span class="card-words">' +
      words +
      " word" +
      (words !== 1 ? "s" : "") +
      "</span>" +
      '<span class="card-tokens">' + '~' +
      Math.floor(words * 0.75) +
      " token" +
      (words !== 1 ? "s" : "") +
      "</span>" +
      "</div>" +
      "</div>";

    card.querySelector(".copy-btn").addEventListener("click", function () {
      copyPrompt(prompt.id);
    });
    card.querySelector(".delete-btn").addEventListener("click", function () {
      askDelete(prompt.id, prompt.title);
    });

    // Ensure legacy prompts have a ratings object
    if (!prompt.ratings)
      prompt.ratings = { userRating: 0, average: 0, count: 0 };
    renderStars(
      prompt.id,
      prompt.ratings,
      card.querySelector("#stars-" + prompt.id),
    );

    // ── Notes panel ──
    var notesPanel = document.createElement("div");
    notesPanel.className = "notes-panel";
    notesPanel.setAttribute("data-prompt-id", prompt.id);
    card.appendChild(notesPanel);
    renderNotes(prompt.id, notesPanel);

    promptGrid.appendChild(card);
  });
}

function handleSave() {
  var title = titleInput.value.trim();
  var content = contentInput.value.trim();
  var modelName = modelInput ? modelInput.value.trim() : "";
  var isCode = isCodeInput ? isCodeInput.checked : false;

  if (!title || !content) return;

  var metadata;
  try {
    metadata = trackModel(modelName, content, isCode);
  } catch (error) {
    showToast(error.message, "error");
    return;
  }

  var newPrompt = {
    id: genId(),
    title: title,
    content: content,
    createdAt: metadata.createdAt,
    ratings: { userRating: 0, average: 0, count: 0 },
    metadata: metadata
  };
  prompts = [newPrompt].concat(prompts);
  savePrompts(prompts);

  titleInput.value = "";
  contentInput.value = "";
  if (modelInput) modelInput.value = "";
  if (isCodeInput) isCodeInput.checked = false;

  updateCharCount();
  updateSaveBtn();
  render();
  showToast("Prompt saved!", "success");
  promptGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Rating ─────────────────────────────────────────────── */
function renderStars(promptId, ratingsData, container) {
  if (!container) container = document.getElementById("stars-" + promptId);
  if (!container) return;

  var avg = ratingsData.average;
  var count = ratingsData.count;
  var userVal = ratingsData.userRating;

  var starsHtml =
    '<div class="star-group" role="group" aria-label="Rate this prompt">';
  for (var s = 1; s <= 5; s++) {
    var filled =
      s <= userVal
        ? " filled"
        : userVal === 0 && s <= Math.round(avg)
          ? " avg-filled"
          : "";
    starsHtml +=
      '<button class="star-btn' +
      filled +
      '" ' +
      'data-id="' +
      promptId +
      '" ' +
      'data-val="' +
      s +
      '" ' +
      'aria-label="Rate ' +
      s +
      ' out of 5 stars" ' +
      'title="' +
      s +
      " star" +
      (s !== 1 ? "s" : "") +
      '">' +
      "★" +
      "</button>";
  }
  starsHtml += "</div>";

  if (count > 0) {
    var displayAvg = avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(1);
    starsHtml +=
      '<span class="rating-summary">' +
      displayAvg +
      " · " +
      count +
      " rating" +
      (count !== 1 ? "s" : "") +
      "</span>";
  } else {
    starsHtml += '<span class="rating-summary unrated">Not yet rated</span>';
  }

  container.innerHTML = starsHtml;

  container.querySelectorAll(".star-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      ratePrompt(
        btn.getAttribute("data-id"),
        parseInt(btn.getAttribute("data-val"), 10),
      );
    });
    btn.addEventListener("mouseenter", function () {
      var hoverVal = parseInt(btn.getAttribute("data-val"), 10);
      container.querySelectorAll(".star-btn").forEach(function (b, i) {
        b.classList.toggle("hovered", i < hoverVal);
      });
    });
    btn.addEventListener("mouseleave", function () {
      container.querySelectorAll(".star-btn").forEach(function (b) {
        b.classList.remove("hovered");
      });
    });
  });
}

function ratePrompt(promptId, starValue) {
  var prompt = prompts.find(function (p) {
    return p.id === promptId;
  });
  if (!prompt) return;
  if (!prompt.ratings) prompt.ratings = { userRating: 0, average: 0, count: 0 };

  var prev = prompt.ratings.userRating;
  var avg = prompt.ratings.average;
  var count = prompt.ratings.count;

  if (prev === starValue) {
    // Undo the rating
    if (count > 1) {
      prompt.ratings.average = (avg * count - prev) / (count - 1);
    } else {
      prompt.ratings.average = 0;
    }
    prompt.ratings.count = Math.max(0, count - 1);
    prompt.ratings.userRating = 0;
    showToast("Rating removed.", "info");
  } else if (prev === 0) {
    // First-time rating
    prompt.ratings.average =
      count === 0 ? starValue : (avg * count + starValue) / (count + 1);
    prompt.ratings.count = count + 1;
    prompt.ratings.userRating = starValue;
    showToast(
      "Rated " + starValue + " star" + (starValue !== 1 ? "s" : "") + "!",
      "success",
    );
  } else {
    // Update existing rating
    prompt.ratings.average = (avg * count - prev + starValue) / count;
    prompt.ratings.userRating = starValue;
    showToast(
      "Rating updated to " +
        starValue +
        " star" +
        (starValue !== 1 ? "s" : "") +
        ".",
      "info",
    );
  }

  updatePromptMetadata(promptId);

  // Animate the star that was clicked
  var container = document.getElementById("stars-" + promptId);
  renderStars(promptId, prompt.ratings, container);
  if (container) {
    var clickedBtn = container.querySelectorAll(".star-btn")[starValue - 1];
    if (clickedBtn) {
      clickedBtn.classList.add("pop");
      clickedBtn.addEventListener(
        "animationend",
        function () {
          clickedBtn.classList.remove("pop");
        },
        { once: true },
      );
    }
  }
}

/* ─── Copy ────────────────────────────────────────────────── */
function copyPrompt(id) {
  var prompt = prompts.find(function (p) {
    return p.id === id;
  });
  if (!prompt) return;
  navigator.clipboard
    .writeText(prompt.content)
    .then(function () {
      showToast("Copied to clipboard!", "info");
    })
    .catch(function () {
      showToast("Copy failed — please copy manually.", "error");
    });
}

/* ─── Delete ──────────────────────────────────────────────── */
function askDelete(id, title) {
  pendingDeleteId = id;
  deletePromptName.textContent = '"' + title + '"';
  deleteOverlay.classList.add("active");
  confirmDeleteBtn.focus();
}
function closeDialog() {
  deleteOverlay.classList.remove("active");
  pendingDeleteId = null;
}
function confirmDelete() {
  if (!pendingDeleteId) return;
  prompts = prompts.filter(function (p) {
    return p.id !== pendingDeleteId;
  });
  savePrompts(prompts);
  closeDialog();
  render();
  showToast("Prompt deleted.", "error");
}

/* ─── Notes Render ───────────────────────────────────────── */
function renderNotes(promptId, container) {
  if (!container) {
    container = document.querySelector('.notes-panel[data-prompt-id="' + promptId + '"]');
  }
  if (!container) return;

  var notes = loadNotes(promptId);
  var isOpen = container.querySelector(".notes-body") &&
               container.querySelector(".notes-body").classList.contains("open");
  var currentEditId = activeEditNoteId[promptId] || null;

  // ── Toggle button ──
  var badgeHtml = notes.length > 0
    ? '<span class="notes-badge">' + notes.length + "</span>"
    : "";
  var toggleId = "notes-toggle-" + promptId;
  var bodyId   = "notes-body-" + promptId;

  container.innerHTML =
    '<button class="notes-toggle" id="' + toggleId + '" ' +
      'aria-expanded="' + (isOpen ? "true" : "false") + '" ' +
      'aria-controls="' + bodyId + '">' +
      '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
      "Notes" + badgeHtml +
      '<span class="notes-chevron">▼</span>' +
    "</button>" +
    '<div class="notes-body' + (isOpen ? " open" : "") + '" ' +
      'id="' + bodyId + '" ' +
      'role="region" aria-labelledby="' + toggleId + '">' +

      // Notes list
      (function () {
        if (notes.length === 0) {
          return '<p class="notes-empty">No notes yet. Add your first note below.</p>';
        }
        var listHtml = '<ul class="notes-list" data-notes-container data-prompt-id="' + promptId + '">';
        notes.forEach(function (note) {
          var isEditing = (currentEditId === note.id);
          listHtml +=
            '<li class="note-item" data-note-id="' + note.id + '">' +
              '<div class="note-item-body">' +
                (isEditing
                  ? '' // Editing — content shown in editor below
                  : '<div class="note-item-content">' + escHtml(note.content) + '</div>') +
                '<div class="note-item-meta">Updated ' + formatDateTime(note.updatedAt) + '</div>' +
              '</div>' +
              '<div class="note-item-actions">' +
                (isEditing
                  ? '<button class="note-btn cancel-edit-note-btn" title="Cancel edit" data-id="' + note.id + '" data-prompt-id="' + promptId + '">✕</button>'
                  : '<button class="note-btn edit-note-btn" title="Edit note" data-id="' + note.id + '" data-prompt-id="' + promptId + '">' +
                      '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                      "</button>") +
                '<button class="note-btn delete-note-btn" title="Delete note" data-id="' + note.id + '" data-prompt-id="' + promptId + '">' +
                  '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
                '</button>' +
              '</div>' +
            '</li>';
        });
        listHtml += '</ul>';
        return listHtml;
      }()) +

      // Editor
      '<div class="notes-editor" data-prompt-id="' + promptId + '">' +
        '<textarea placeholder="Write a note…" ' +
          'aria-label="Note content" ' +
          'data-prompt-id="' + promptId + '">' +
          (currentEditId
            ? escHtml((loadNotes(promptId).find(function(n){return n.id===currentEditId;})||{content:""}).content)
            : "") +
        '</textarea>' +
        '<div class="notes-editor-controls">' +
          (currentEditId
            ? '<button class="btn-note-save" data-action="save-note" data-prompt-id="' + promptId + '">✓ Save</button>' +
              '<button class="btn-note-cancel" data-action="cancel-note" data-prompt-id="' + promptId + '">Cancel</button>'
            : '<button class="btn-note-add" data-action="add-note" data-prompt-id="' + promptId + '">' +
                '<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
                "Add Note" +
              "</button>") +
          '<span class="note-feedback" id="note-fb-' + promptId + '" style="display:none;"></span>' +
        '</div>' +
      '</div>' +

    '</div>';

  // ── Toggle accordion ──
  container.querySelector(".notes-toggle").addEventListener("click", function () {
    var body   = container.querySelector(".notes-body");
    var toggle = container.querySelector(".notes-toggle");
    var open   = body.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ── Event delegation on the whole panel ──
  container.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action], .edit-note-btn, .delete-note-btn, .cancel-edit-note-btn");
    if (!btn) return;

    var pid    = btn.getAttribute("data-prompt-id") || promptId;
    var action = btn.getAttribute("data-action");
    var nid    = btn.getAttribute("data-id");

    // Edit note
    if (btn.classList.contains("edit-note-btn")) {
      activeEditNoteId[pid] = nid;
      renderNotes(pid, container);
      // Reopen panel
      var body = container.querySelector(".notes-body");
      if (body && !body.classList.contains("open")) {
        body.classList.add("open");
        container.querySelector(".notes-toggle").setAttribute("aria-expanded", "true");
      }
      var ta = container.querySelector(".notes-editor textarea");
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      return;
    }

    // Cancel edit
    if (btn.classList.contains("cancel-edit-note-btn") || action === "cancel-note") {
      activeEditNoteId[pid] = null;
      renderNotes(pid, container);
      return;
    }

    // Delete note
    if (btn.classList.contains("delete-note-btn")) {
      pendingNoteDelete = { promptId: pid, noteId: nid };
      noteDeleteOverlay.classList.add("active");
      confirmNoteDeleteBtn.focus();
      return;
    }

    // Add note
    if (action === "add-note") {
      var ta = container.querySelector(".notes-editor textarea");
      var content = ta ? ta.value.trim() : "";
      if (!content) {
        showNoteFeedback(pid, "Note cannot be empty.", "error");
        return;
      }
      var result = createNote(pid, content);
      if (!result) {
        showNoteFeedback(pid, "Storage error — try clearing old data.", "error");
        return;
      }
      if (result === "quota") {
        showNoteFeedback(pid, "Storage full — free some space.", "error");
        return;
      }
      activeEditNoteId[pid] = null;
      renderNotes(pid, container);
      // Keep panel open after adding
      var body = container.querySelector(".notes-body");
      if (body && !body.classList.contains("open")) {
        body.classList.add("open");
        container.querySelector(".notes-toggle").setAttribute("aria-expanded", "true");
      }
      showNoteFeedback(pid, "✓ Saved", "saved");
      return;
    }

    // Save (update) note
    if (action === "save-note") {
      var editId = activeEditNoteId[pid];
      if (!editId) return;
      var ta = container.querySelector(".notes-editor textarea");
      var content = ta ? ta.value.trim() : "";
      if (!content) {
        showNoteFeedback(pid, "Note cannot be empty.", "error");
        return;
      }
      var res = updateNote(pid, editId, content);
      if (res === "quota") {
        showNoteFeedback(pid, "Storage full — free some space.", "error");
        return;
      }
      if (!res) {
        showNoteFeedback(pid, "Save failed.", "error");
        return;
      }
      activeEditNoteId[pid] = null;
      renderNotes(pid, container);
      var body = container.querySelector(".notes-body");
      if (body && !body.classList.contains("open")) {
        body.classList.add("open");
        container.querySelector(".notes-toggle").setAttribute("aria-expanded", "true");
      }
      showNoteFeedback(pid, "✓ Saved", "saved");
      return;
    }
  });
}

/* ─── Note Feedback ───────────────────────────────────────── */
function showNoteFeedback(promptId, message, type) {
  // Try inline feedback first
  var fb = document.getElementById("note-fb-" + promptId);
  if (fb) {
    fb.textContent = message;
    fb.className = "note-feedback " + type;
    fb.style.display = "";
    clearTimeout(fb._timer);
    fb._timer = setTimeout(function () {
      fb.classList.add("fade-out");
      fb.addEventListener("animationend", function () {
        fb.style.display = "none";
        fb.classList.remove("fade-out");
      }, { once: true });
    }, 1800);
  } else {
    // Fallback to toast
    showToast(message, type === "saved" ? "success" : "error");
  }
}

/* ─── Note Delete Modal ───────────────────────────────────── */
function closeNoteDialog() {
  noteDeleteOverlay.classList.remove("active");
  pendingNoteDelete = null;
}
function confirmNoteDelete() {
  if (!pendingNoteDelete) return;
  var pid = pendingNoteDelete.promptId;
  var nid = pendingNoteDelete.noteId;
  var res = deleteNote(pid, nid);
  // Clear edit state if the deleted note was being edited
  if (activeEditNoteId[pid] === nid) activeEditNoteId[pid] = null;
  closeNoteDialog();
  var container = document.querySelector('.notes-panel[data-prompt-id="' + pid + '"]');
  if (container) {
    renderNotes(pid, container);
    // Keep open
    var body = container.querySelector(".notes-body");
    if (body && !body.classList.contains("open")) {
      body.classList.add("open");
      container.querySelector(".notes-toggle").setAttribute("aria-expanded", "true");
    }
    if (res === "quota") {
      showNoteFeedback(pid, "Storage error during delete.", "error");
    } else {
      showNoteFeedback(pid, "Deleted", "deleted");
    }
  } else {
    showToast("Note deleted.", "error");
  }
}

cancelNoteDeleteBtn.addEventListener("click", closeNoteDialog);
confirmNoteDeleteBtn.addEventListener("click", confirmNoteDelete);
noteDeleteOverlay.addEventListener("click", function (e) {
  if (e.target === noteDeleteOverlay) closeNoteDialog();
});

/* ─── Char counter & button state ────────────────────────── */
function updateCharCount() {
  var len = contentInput.value.length;
  charCount.textContent = len + " / 2000";
  charCount.classList.toggle("warn", len > 1800);
}
function updateSaveBtn() {
  var ok =
    titleInput.value.trim().length > 0 && contentInput.value.trim().length > 0;
  saveBtn.disabled = !ok;
}

/* ─── Event listeners ────────────────────────────────────── */
titleInput.addEventListener("input", updateSaveBtn);
contentInput.addEventListener("input", function () {
  updateCharCount();
  updateSaveBtn();
});
saveBtn.addEventListener("click", handleSave);

titleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    contentInput.focus();
  }
});
contentInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleSave();
  }
});

searchInput.addEventListener("input", function () {
  searchQuery = searchInput.value.toLowerCase().trim();
  render();
});

cancelDeleteBtn.addEventListener("click", closeDialog);
confirmDeleteBtn.addEventListener("click", confirmDelete);
deleteOverlay.addEventListener("click", function (e) {
  if (e.target === deleteOverlay) closeDialog();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (deleteOverlay.classList.contains("active")) closeDialog();
    if (noteDeleteOverlay.classList.contains("active")) closeNoteDialog();
  }
});

/* ─── Init ───────────────────────────────────────────────── */
render();

/* ─── Validation Tests ────────────────────────────────────── */
function runMetadataValidationTests() {
  console.log("=== RUNNING METADATA TRACKING SYSTEM VALIDATION TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log("✓ PASS: " + message);
    } else {
      failed++;
      console.error("✕ FAIL: " + message);
    }
  }

  // Test 1: estimateTokens logic for plain text
  try {
    const est = estimateTokens("Word1 Word2 Word3 Word4 Word5", false);
    assert(est.min === 4 && est.max === 6 && est.confidence === 'high', "estimateTokens basic text");
  } catch (e) {
    failed++;
    console.error("✕ FAIL: estimateTokens basic text threw: " + e.message);
  }

  // Test 2: estimateTokens logic for code
  try {
    const est = estimateTokens("Word1 Word2 Word3 Word4 Word5", true);
    assert(est.min === 5 && est.max === 8 && est.confidence === 'high', "estimateTokens code text scaling");
  } catch (e) {
    failed++;
    console.error("✕ FAIL: estimateTokens code text threw: " + e.message);
  }

  // Test 3: estimateTokens confidence levels
  try {
    const longText = "a".repeat(21000);
    const est = estimateTokens(longText, false);
    assert(est.confidence === 'low', "estimateTokens low confidence threshold (>5000)");
  } catch (e) {
    failed++;
    console.error("✕ FAIL: estimateTokens low confidence threw: " + e.message);
  }

  // Test 4: trackModel valid inputs
  try {
    const meta = trackModel("GPT-4", "test content here", false);
    assert(meta.model === "GPT-4" && isValidISO8601(meta.createdAt) && meta.createdAt === meta.updatedAt, "trackModel valid inputs");
  } catch (e) {
    failed++;
    console.error("✕ FAIL: trackModel valid inputs threw: " + e.message);
  }

  // Test 5: trackModel invalid modelName (empty)
  try {
    trackModel("", "test content here");
    failed++;
    console.error("✕ FAIL: trackModel allowed empty model name");
  } catch (e) {
    passed++;
    console.log("✓ PASS: trackModel empty model name rejected: " + e.message);
  }

  // Test 6: trackModel invalid modelName (too long)
  try {
    trackModel("a".repeat(101), "test content here");
    failed++;
    console.error("✕ FAIL: trackModel allowed model name > 100 characters");
  } catch (e) {
    passed++;
    console.log("✓ PASS: trackModel long model name rejected: " + e.message);
  }

  // Test 7: updateTimestamps valid
  try {
    const meta = trackModel("Claude 3", "content");
    const updated = updateTimestamps(meta);
    assert(isValidISO8601(updated.updatedAt) && new Date(updated.updatedAt).getTime() >= new Date(updated.createdAt).getTime(), "updateTimestamps valid transition");
  } catch (e) {
    failed++;
    console.error("✕ FAIL: updateTimestamps threw error on valid update: " + e.message);
  }

  // Test 8: updateTimestamps invalid createdAt date format rejection
  try {
    updateTimestamps({
      model: "Test",
      createdAt: "invalid-date",
      updatedAt: new Date().toISOString(),
      tokenEstimate: { min: 10, max: 20, confidence: "high" }
    });
    failed++;
    console.error("✕ FAIL: updateTimestamps accepted invalid createdAt date format");
  } catch (e) {
    passed++;
    console.log("✓ PASS: updateTimestamps rejected invalid createdAt format: " + e.message);
  }

  console.log(`=== METADATA VALIDATION TEST SUMMARY: Passed: ${passed}, Failed: ${failed} ===`);
}

// Run tests silently in console to verify rules correctness on load
try {
  runMetadataValidationTests();
} catch (err) {
  console.error("Error executing validation tests:", err);
}
