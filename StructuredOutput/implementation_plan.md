# Implementation Plan — Metadata Tracking System for Prompt Library By Gemini

We will create a metadata tracking system for the prompts in our prompt library, enabling users to associate each prompt with a specific AI model, automatically compute token estimates, track timestamps (creation and updates), and display this metadata in the prompt cards with color-coded token confidence.

## User Review Required

> [!IMPORTANT]
> **Data Migration / Backwards Compatibility**: 
> Existing saved prompts (from prior usages) will not have a `metadata` object. We will handle these gracefully by falling back to the prompt's top-level `createdAt` timestamp for sorting, and using default placeholders (e.g., "Legacy / Unspecified Model") when rendering.

## Proposed Changes

We will modify three core files in the `StructuredOutput` workspace:
1. `index.html` — Add input fields for Model Name and a checkbox indicating if the prompt contains code.
2. `script.js` — Implement the metadata tracking/validation logic, sort prompts by `createdAt` descending, handle DOM integration, and update prompt metadata timestamps upon actions (such as rating or adding/editing notes).
3. `style.css` — Style the new input fields, checkbox components, and metadata block in the prompt cards with color-coded confidence badges.

---

### UI and Form Layout

#### [MODIFY] [index.html](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/index.html)
- Add a new grid row between **Title** and **Prompt Content** inputs containing:
  - Text input for **Model Name** (maxlength="100", required).
  - Modern toggle switch/checkbox for **Contains Code** (`isCode`).
- Clean up markup and ensure unique, descriptive IDs for new interactive elements.

---

### Logic & Storage

#### [MODIFY] [script.js](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/script.js)
- **Implement Core Utilities**:
  - `isValidISO8601(dateStr)`: Strict validation for date format `YYYY-MM-DDTHH:mm:ss.sssZ`.
  - `trackModel(modelName, content, isCode)`: Generates metadata, validates model name, estimates tokens.
  - `updateTimestamps(metadata)`: Validates and updates the `updatedAt` field.
  - `estimateTokens(text, isCode)`: Token estimate logic based on word and character count, code scaling factor (1.3), and confidence ranking.
- **Form Integration**:
  - Retrieve `modelName` and `isCode` from inputs in `handleSave()`.
  - Include validation inside a try/catch wrapper: display descriptive error toasts if the validation fails.
  - Append the `metadata` object to `newPrompt`.
- **Card Rendering**:
  - Format and render the model name, timestamps (created/updated in human-readable format), and token estimate with color-coded confidence class labels.
- **Sorting**:
  - Sort prompts by `metadata.createdAt` (falling back to prompt `createdAt` if absent) descending during `render()`.
- **Dynamic Updates**:
  - Add `updatePromptMetadata(promptId)` function which modifies the prompt's `metadata` using `updateTimestamps()`.
  - Trigger `updatePromptMetadata(promptId)` in note operations (`createNote`, `updateNote`, `deleteNote`) and prompt rating (`ratePrompt`) to show real-time `updatedAt` changes.

---

### Styling

#### [MODIFY] [style.css](file:///c:/Programming/projects/practical-prompt-engineering-masterdotdev/StructuredOutput/style.css)
- **Form Layout**:
  - Style `.form-row-grid` for layout of Model Name input and Contains Code checkbox.
  - Create a custom-styled modern checkbox with transitions matching the dark violet theme.
- **Metadata Cards**:
  - Style `.card-metadata` container with light background overlay, border, and dashed dividers.
  - Style token confidence badges (`.confidence-high` -> green, `.confidence-medium` -> yellow, `.confidence-low` -> red).
  - Style timestamps, labels, and badges.

---

## Verification Plan

### Automated Tests
- Since this is a browser-only environment, we will verify correct parsing, token calculation, and validation rules using in-app logging / alerts / toasts and code inspection.
- We will write a small validation suite helper inside `script.js` (runs once on page load in development console or as a quick sanity check) to verify:
  - Error throwing on invalid model names (empty or >100 characters).
  - Error throwing on invalid ISO dates.
  - Correct calculation of token min/max with/without code scaling.

### Manual Verification
1. Open the application in the browser.
2. Verify visual appearance of the new Model Name input and "Contains Code" checkbox.
3. Test validation errors:
   - Try to save with empty model name.
   - Try to save with a model name longer than 100 characters.
4. Verify token estimate and confidence coloring on card rendering:
   - short text (< 1000 tokens) -> Green.
   - medium text (1000 - 5000 tokens) -> Yellow.
   - long text (> 5000 tokens) -> Red.
   - Check scaling factor for "Contains Code" checkbox.
5. Verify that adding a rating or note updates the "Updated" timestamp in the metadata card section.
6. Verify sorting: add several prompts with different models and content and confirm they sort in descending order of creation.
