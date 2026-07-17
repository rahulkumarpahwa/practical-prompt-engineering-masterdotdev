(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get("section");
  const titleEl = document.getElementById("doc-title");
  const summaryEl = document.getElementById("doc-summary");
  const techniqueEl = document.getElementById("doc-technique");
  const localEl = document.getElementById("doc-local");
  const filesEl = document.getElementById("doc-files");

  let config;
  try {
    const res = await fetch("config.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    config = await res.json();
  } catch (err) {
    titleEl.textContent = "Error";
    filesEl.innerHTML =
      '<p class="doc-note">Could not load config.json. Run this page from a local server (e.g. VS Code Live Server).</p>';
    console.error(err);
    return;
  }

  localEl.textContent = config.site.localStorageNote;

  const section = config.sections.find((s) => s.slug === slug);
  if (!section) {
    titleEl.textContent = "Section not found";
    filesEl.innerHTML =
      '<p class="doc-note">Unknown section "' + (slug || "") + '". <a href="index.html">Return home</a>.</p>';
    return;
  }

  document.title = section.name + " — Practical Prompt Engineering";
  titleEl.textContent = section.name;
  summaryEl.textContent = section.summary;
  techniqueEl.textContent = section.technique;

  // Decide what to render from the underlying files.
  const files = [];

  if (section.file) {
    const f = section.file;
    if (f.toLowerCase().endsWith(".png") || f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg") || f.toLowerCase().endsWith(".gif")) {
      files.push({ path: f, kind: "image" });
    } else if (f.toLowerCase().endsWith(".md")) {
      files.push({ path: f, kind: "md" });
    } else {
      files.push({ path: f, kind: "text" });
    }
  } else {
    // Folder-based: enumerate readable source files in the section folder.
    try {
      const listing = await fetchFolderListing(section.path);
      listing.forEach((name) => {
        const lower = name.toLowerCase();
        const full = section.path + "/" + name;
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) {
          files.push({ path: full, kind: "image" });
        } else if (lower.endsWith(".md")) {
          files.push({ path: full, kind: "md" });
        } else if (lower.endsWith(".txt") || lower.endsWith(".json") || lower.endsWith(".js") || lower.endsWith(".html") || lower.endsWith(".css")) {
          files.push({ path: full, kind: "text" });
        }
      });
    } catch (e) {
      filesEl.innerHTML = '<p class="doc-note">Could not read the source folder for this section.</p>';
    }
  }

  if (files.length === 0) {
    filesEl.innerHTML = '<p class="doc-note">No underlying source files were found for this section.</p>';
    return;
  }

  for (const file of files) {
    await renderFile(file, filesEl);
  }

  // Scroll to working section.
  document.getElementById("doc-working").scrollIntoView({ behavior: "smooth", block: "start" });
})();

async function fetchFolderListing(path) {
  // Try a known listing file, else fall back to directory discovery via config-exposed names.
  // Since browsers can't list directories, we attempt common candidate filenames.
  const candidates = [
    "prompt-library-market-research.md", "questions.md",
    "PersonaExample.txt", "PromptCreation.txt", "FewShortPromptExample.txt",
    "OneShortPromptExample.txt", "ZeroShortChainOfThoughts.txt", "ZeroShortChainOfThoughts2.txt",
    "PromptForProject.txt", "StructuredOutputPrompt.txt", "implementation_plan.md",
    "TECHNICAL_SPEC.md", "UX_DESIGN_SPEC.md", "example.txt",
  ];
  const found = [];
  await Promise.all(
    candidates.map(async (name) => {
      try {
        const res = await fetch(path + "/" + name, { method: "HEAD" });
        if (res.ok) found.push(name);
      } catch (e) { /* ignore */ }
    })
  );
  return found;
}

async function renderFile(file, container) {
  const block = document.createElement("div");
  block.className = "file-block";

  const head = document.createElement("div");
  head.className = "file-head";
  const label = file.path.split("/").pop();
  head.innerHTML =
    '<span class="file-icon">▤</span>' +
    '<span class="file-name">' + escapeHtml(label) + '</span>' +
    '<span class="file-path">' + escapeHtml(file.path) + '</span>';
  block.appendChild(head);

  const body = document.createElement("div");
  body.className = "file-body";
  block.appendChild(body);

  try {
    const res = await fetch(file.path);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();

    if (file.kind === "image") {
      body.innerHTML = '<div class="file-image"><img src="' + encodeURI(file.path) + '" alt="' + escapeHtml(label) + '"></div>';
    } else if (file.kind === "md") {
      body.innerHTML = '<div class="markdown">' + renderMarkdown(text) + "</div>";
    } else {
      const pre = document.createElement("pre");
      pre.textContent = text;
      body.appendChild(pre);
    }
  } catch (err) {
    body.innerHTML = '<div class="file-image"><p class="doc-note">Unable to load ' + escapeHtml(file.path) + ".</p></div>";
  }

  container.appendChild(block);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Minimal, safe Markdown renderer (headings, lists, code, tables, bold/italic, links). */
function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;

  const inline = (s) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (/^```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
      i++;
      html += "<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>";
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const lvl = h[1].length; html += "<h" + lvl + ">" + inline(h[2]) + "</h" + lvl + ">"; i++; continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { html += "<hr>"; i++; continue; }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, "")); i++; }
      html += "<blockquote>" + inline(quote.join(" ")) + "</blockquote>";
      continue;
    }

    // Table
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      let rows = "";
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        rows += "<tr>" + splitRow(lines[i]).map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>";
        i++;
      }
      html += "<table><thead><tr>" + header.map((c) => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>" + rows + "</tbody></table>";
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
      html += "<ul>" + items.map((it) => "<li>" + inline(it) + "</li>").join("") + "</ul>";
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
      html += "<ol>" + items.map((it) => "<li>" + inline(it) + "</li>").join("") + "</ol>";
      continue;
    }

    // Blank line
    if (line.trim() === "") { i++; continue; }

    // Paragraph (merge consecutive non-empty lines)
    const para = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !/^(#{1,6})\s/.test(lines[i]) && !/^```/.test(lines[i]) &&
           !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) &&
           !/^>\s?/.test(lines[i]) && !/^---+$/.test(lines[i].trim()) &&
           !/^\|.*\|\s*$/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    html += "<p>" + inline(para.join(" ")) + "</p>";
  }
  return html;
}

function splitRow(row) {
  return row.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}
