# Implementation Plan — Export/Import System with Conflict Resolution and Error Recovery

We will implement a complete, robust import/export backup system for the Prompt Journal application. This will allow users to download their entire prompt library (including ratings, metadata, and associated notes) in a single JSON file, and import it with validation, duplicate resolution, and full error recovery (rollback).

## User Review Required

> [!IMPORTANT]
> **Conflict Resolution Flow**:
> When importing, if duplicate prompt IDs are detected, we will prompt the user with a custom modal dialog offering three clear resolution strategies:
> 1. **Replace / Overwrite Library**: Wipes all current prompts and notes, replacing them entirely with the imported file.
> 2. **Skip Duplicates**: Keeps the current prompts and imports only the new prompts with unique IDs.
> 3. **Keep Both (Generate New IDs)**: Imports all prompts, but auto-generates new IDs for any conflicting prompts so both the existing and imported copies coexist.
> 4. **Overwrite Conflicts**: Overwrites existing prompts with imported ones when IDs match, while keeping non-conflicting existing prompts.

## Proposed Changes

We will modify three core files in the `StructuredOutput` workspace:
1. `index.html` — Add Export and Import buttons, a hidden file input element for uploading JSON, and a Conflict Resolution Overlay.
2. `script.js` — Implement export/import logic, statistics calculation, schema validation, duplicate detection, backup/rollback mechanism, and DOM events.
3. `style.css` — Style the new buttons, import conflict modal, and transition animations.

---

### UI Elements

#### [MODIFY] [index.html](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/index.html)
- Add a new actions container in the header or stats-bar with:
  - **Export** button (`id="exportBtn"`)
  - **Import** button (`id="importBtn"`)
  - Hidden file input (`id="importFileInput"`, `accept=".json"`)
- Add a **Conflict Resolution Dialog Overlay** (`id="importConflictOverlay"`) with selections for:
  - Overwrite entire library
  - Overwrite conflicts only
  - Skip duplicates
  - Keep both (auto-assign new IDs)
  - Cancel import
- Add a **Loading / Processing Dialog Overlay** (`id="importLoadingOverlay"`) for importing large datasets.

---

### Logic & JSON Schema

#### [MODIFY] [script.js](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/script.js)
- **JSON Schema Definition**:
  ```json
  {
    "version": 1,
    "timestamp": "ISO-8601 String",
    "stats": {
      "totalPrompts": 10,
      "averageRating": 4.5,
      "mostUsedModel": "Claude 3.5 Sonnet"
    },
    "prompts": [
      {
        "id": "string",
        "title": "string",
        "content": "string",
        "createdAt": "ISO-8601",
        "ratings": {
          "userRating": 0,
          "average": 0,
          "count": 0
        },
        "metadata": {
          "model": "string",
          "createdAt": "ISO-8601",
          "updatedAt": "ISO-8601",
          "tokenEstimate": {
            "min": 10,
            "max": 20,
            "confidence": "high"
          }
        },
        "notes": [
          {
            "id": "string",
            "promptId": "string",
            "content": "string",
            "createdAt": 1721088000000,
            "updatedAt": 1721088000000
          }
        ]
      }
    ]
  }
  ```
- **Export Functionality (`exportLibrary()`)**:
  - Gathers prompts from localStorage.
  - Loads notes associated with each prompt and nests them as `notes` key under the respective prompt.
  - Computes statistics: `totalPrompts`, `averageRating` (ignoring 0 ratings), and `mostUsedModel` (mode calculation).
  - Prepares JSON matching the schema, generates a file Blob, and triggers browser download with timestamp (e.g. `prompt_library_backup_YYYY-MM-DD_HH-mm-ss.json`).
- **Import Functionality (`importLibrary(file)`)**:
  - Read file as text and parse JSON.
  - **Schema Validation**: Verify presence of `version`, `prompts` array, and standard fields.
  - **Integrity Validation**: Validate prompt IDs, createdAt timestamps, metadata structures, and notes arrays.
  - **Backup Current State**: Keep in-memory copies of current `prompts` and `notes` state before applying changes.
  - **Duplicate Detection**: Check if any imported prompt ID already exists in current library.
  - **Conflict Handling**: If duplicates are found, show the custom overlay asking the user how to merge.
  - **Apply Changes**: Merge or overwrite prompts and notes based on user choice.
  - **Error Recovery (Rollback)**: If storage quotas are exceeded or writing fails, revert back to the in-memory backup state and display error messages.

---

### Styling

#### [MODIFY] [style.css](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/style.css)
- Style import/export action buttons (e.g., place them in the stats-bar or head section, style with nice gradients and border shadows).
- Style the conflict resolution dialog options with clear choice badges and hover effects.

---

## Verification Plan

### Automated Tests
- We will add automated test suite test cases to `runMetadataValidationTests()` to test:
  - Export schema compiler & statistics calculations.
  - JSON importer schema parser & validator.
  - ID deduplication and conflict resolution merging logic.

### Manual Verification
1. Click **Export** and check the downloaded JSON structure and stats accuracy.
2. Modify existing prompts (e.g. change rating or note) and verify backup files differ.
3. Import a valid JSON file using **Keep Both** and verify duplicates exist side-by-side with new IDs.
4. Import a valid JSON file using **Skip Duplicates** and verify only new prompts are imported.
5. Import a valid JSON file using **Overwrite conflicts** and verify original conflicting prompts are replaced.
6. Import an invalid or corrupted JSON file and verify the app rejects it with a toast error, keeping existing library intact.
