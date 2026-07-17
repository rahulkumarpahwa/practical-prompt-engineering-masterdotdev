# Practical Prompt Engineering Master.dev — Prompt Library Playgrounds

This repository is a set of small, browser-based HTML/CSS/JS “prompt engineering” playgrounds and a growing prompt-library concept. The mini-apps are intentionally lightweight: everything runs in your browser and stores data locally (via `localStorage`) so you can experiment quickly without backend setup.

In addition to the mini-apps, the repo contains prompt/spec documents that explain the design thinking behind features such as metadata tracking, export/import, token estimation confidence, and prompt organization architecture.

---

## What’s included

### Prompt library mini-app (browser + localStorage)

All of the prompt UI folders follow the same core idea: author prompts, save them locally, render them as cards, and reuse/delete them.

Folders:

- `ZeroShortPrompt/` — baseline prompt library (save/delete).
- `OneShortPrompt/` — short prompting variation (UI-based experimentation).
- `FewShortPrompt/` — few-shot prompting variation (UI-based experimentation).
- `StandardPrompt/` — static prompt reference.
- `StructuredOutput/` — prompt library with **metadata tracking** + **structured output prompt**.
- `ZeroShortCOTPrompt/` — chain-of-thought prompting exploration + implementation notes.
- `Personas/` — personas spec and supporting prompt examples/UI.
- `questions/` — Q&A notes for prompt engineering concepts.
- `DelimitersAndXML/` — prompt organization + architecture research notes.
- `EmotionalPrompt/` — emotional prompting example/screenshot.

> Note: Each folder contains its own `index.html`, `style.css`, and (usually) `script.js`.

---

## Quick start (run locally in the browser)

1. Open the repository root in VS Code.
2. For a specific mini-app folder (example: `StructuredOutput/`), start a local server:
   - Use the **Live Server** extension
   - Click **“Go Live”** (or right-click `index.html` → “Open with Live Server”)
3. Open the browser page that serves that folder’s `index.html`.

Repeat step 2 for any folder you want to run.

### No setup / no dependencies

These mini-apps are pure front-end:

- No build step
- No package installation required
- No backend required
- Data persistence is local to your browser/device

---

## How the prompt library data works (conceptual)

Across the prompt library pages, prompts and related user interactions are stored in the browser using `localStorage`. The “StructuredOutput” workspace goes further and defines explicit metadata structures (model name, timestamps, token estimates, confidence) and includes export/import design documents.

Because this is local-first:

- You can refresh/reload and keep your saved prompts
- You should use the Export feature (where implemented) to back up your work
- Clearing browser storage will delete saved prompts

---

## Documentation by folder (usage + what each contributes)

### `ZeroShortPrompt/` — baseline prompt library

**Purpose:** simplest prompt saving and browsing experience.

**Key files:**

- `ZeroShortPrompt/index.html`
- `ZeroShortPrompt/script.js`
- `ZeroShortPrompt/style.css`

**What to do:**

- Enter a Title and Prompt Content
- Save Prompt → prompt card appears
- Delete Prompt → removes from local storage

---

### `StructuredOutput/` — metadata tracking system + structured output prompt

This workspace extends the prompt library with:

- **Model name**
- **Contains Code** checkbox
- **Token estimation** with confidence coloring
- **Created/updated timestamps** surfaced in the UI
- **Sorting** by creation time
- (Planned/defined via specs) **Export/Import** for backups with conflict resolution

**Key docs/specs:**

- `StructuredOutput/implementation_plan.md`  
  Describes UI + logic changes for metadata tracking and validation.
- `StructuredOutput/StructuredOutputPrompt.txt`  
  The structured output prompting instructions used to generate/test structured responses.
- `StructuredOutput/implementation_plan.md` and `StructuredOutput/StructuredOutputPrompt.txt` together define both “how to run” and “how to prompt”.

**Key files:**

- `StructuredOutput/index.html` — includes Model Name + Contains Code inputs, plus UI components.
- `StructuredOutput/script.js`
- `StructuredOutput/style.css`

---

### `ZeroShortCOTPrompt/` — chain-of-thought prompting exploration

**Purpose:** explore zero-shot chain-of-thought techniques and keep implementation notes alongside the prompt(s).

**Key docs/specs:**

- `ZeroShortCOTPrompt/PromptForProject.txt` — plan/prompt text focused on building the export/import system.
- `ZeroShortCOTPrompt/implementation_plan.md` — detailed import/export conflict resolution + rollback approach.

**Key files:**

- `ZeroShortCOTPrompt/index.html`
- `ZeroShortCOTPrompt/script.js`
- `ZeroShortCOTPrompt/style.css`
- `ZeroShortCOTPrompt/ZeroShortChainOfThoughts.txt`
- `ZeroShortCOTPrompt/ZeroShortChainOfThoughts2.txt`

---

### `Personas/` — personas specs and supporting examples

**Purpose:** document and experiment with persona-driven prompting (tone/role shaping).

**Key specs:**

- `Personas/TECHNICAL_SPEC.md` — production-minded architecture guidance (auth, DB, collaboration, rate limiting, search, etc.).
- `Personas/UX_DESIGN_SPEC.md` — (present in repo) UX guidance for persona-based flows and how to present prompt tooling to users.

**Key files:**

- `Personas/index.html`
- `Personas/script.js`
- `Personas/style.css`
- `Personas/PersonaExample.txt`

---

### `FewShortPrompt/` and `OneShortPrompt/` — prompt engineering technique playgrounds

These folders are meant to demonstrate different prompting “shots” in a UI-friendly way.

**Key files (examples):**

- `FewShortPrompt/PromptCreation.txt`
- `FewShortPrompt/FewShortPromptExample.txt`
- `FewShortPrompt/index.html`, `script.js`, `style.css`
- `OneShortPrompt/OneShortPromptExample.txt`
- `OneShortPrompt/index.html`, `script.js`, `style.css`

---

### `DelimitersAndXML/` — prompt structure and architecture research

**Purpose:** capture guidance on delimiters/XML tagging in prompts and include prompt management architecture research.

**Key doc:**

- `DelimitersAndXML/prompt-library-market-research.md`

This is a deep research/notes file covering:

- Versioning philosophy (linear vs labels vs branching)
- Collaboration patterns (RBAC, workspaces)
- Technical considerations (telemetry store vs control plane, search, export/import)
- MVP vs future feature recommendations

---

### `EmotionalPrompt/`

Contains the screenshot and supporting material for emotional prompt engineering concepts:

- `EmotionalPrompt/Screenshot 2026-07-16 at 22-42-53 Emotional Prompts - Practical Prompt Engineering Master.dev.png`

---

### `questions/` — prompt engineering Q&A

A reference notes file:

- `questions/questions.md`

---

## Export / Import (backup) design (from the specs)

The repo documents an export/import system for prompt libraries (notably in `ZeroShortCOTPrompt/implementation_plan.md` and `ZeroShortCOTPrompt/PromptForProject.txt`):

Core behaviors:

- Export prompt library (including metadata, ratings, notes)
- Import with:
  - JSON schema validation
  - duplicate ID detection
  - user choice conflict resolution (overwrite library, overwrite conflicts, skip duplicates, keep both with new IDs)
- Backup-before-import + rollback on failures (e.g., storage quota issues)
- Detailed error reporting

These are described as step-by-step implementation plans in the spec files and are meant to be used as a “reference checklist” when implementing robust backup features.

---

## Metadata tracking (token estimates + confidence) (from the specs)

In `StructuredOutput/implementation_plan.md` and `StructuredOutput/StructuredOutputPrompt.txt` the repo specifies token estimation metadata:

- Validate ISO 8601 timestamps
- Validate model name rules (non-empty, max 100 chars)
- Estimate tokens using:
  - base: `min = 0.75 * word_count`, `max = 0.25 * character_count`
  - if `isCode`: multiply both by `1.3`
- Confidence:
  - `high` if `< 1000` tokens
  - `medium` if `1000–5000`
  - `low` if `> 5000`

The UI then displays:

- model name
- created/updated timestamps
- token estimate badges with confidence coloring
- sorting by `createdAt` descending

---

## File map / where to look first

- Start by running a UI:
  - `ZeroShortPrompt/` (baseline)
  - `StructuredOutput/` (metadata + richer UI)
- Then read specs:
  - `StructuredOutput/implementation_plan.md`
  - `StructuredOutput/StructuredOutputPrompt.txt`
  - `ZeroShortCOTPrompt/implementation_plan.md`
  - `ZeroShortCOTPrompt/PromptForProject.txt`
  - `Personas/TECHNICAL_SPEC.md`
  - `DelimitersAndXML/prompt-library-market-research.md`
  - `questions/questions.md`

---

## Notes / limitations

- Everything in these mini-apps is front-end only.
- “Production architecture” is described in specs (e.g., `Personas/TECHNICAL_SPEC.md`) but is not implemented as a backend service in this repository unless a specific mini-app includes it.
- Because storage is local-first:
  - exports are the recommended method for backups when available
  - browser storage clearing will lose your prompts

