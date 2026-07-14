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
  return persistNotes(promptId, notes) === true ? note : null;
}
function updateNote(promptId, noteId, content) {
  var notes = loadNotes(promptId);
  var note = notes.find(function (n) { return n.id === noteId; });
  if (!note) return false;
  note.content = content;
  note.updatedAt = Date.now();
  return persistNotes(promptId, notes);
}
function deleteNote(promptId, noteId) {
  var notes = loadNotes(promptId).filter(function (n) { return n.id !== noteId; });
  return persistNotes(promptId, notes);
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

/* ─── Save ────────────────────────────────────────────────── */
function handleSave() {
  var title = titleInput.value.trim();
  var content = contentInput.value.trim();
  if (!title || !content) return;

  var newPrompt = {
    id: genId(),
    title: title,
    content: content,
    createdAt: new Date().toISOString(),
    ratings: { userRating: 0, average: 0, count: 0 },
  };
  prompts = [newPrompt].concat(prompts);
  savePrompts(prompts);

  titleInput.value = "";
  contentInput.value = "";
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

  savePrompts(prompts);

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
