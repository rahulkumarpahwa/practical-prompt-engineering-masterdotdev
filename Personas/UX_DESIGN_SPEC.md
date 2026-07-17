# Prompt Library — UX / UI Design Considerations

**Audience:** Engineering + product team
**Author:** UI/UX Designer
**Status:** Draft v1.0 — for design review
**Date:** 2026-07-17

> This spec is written against the **current build** (dark glassmorphic theme, `localStorage` SPA, prompt cards with copy/delete, notes, star ratings, metadata block, export/import). I reviewed `index.html`, `style.css`, and `script.js` before writing. Every recommendation maps to something we either have or are about to build (see the backend spec from the Senior Engineer).

---

## 0. Design Principles (our north star)

These five rules govern every screen decision below. If a feature violates one, cut it.

1. **The prompt is the hero.** Everything else (tags, ratings, metadata) is chrome. The content a user came to copy must be one glance and one click away.
2. **Zero friction to capture.** The #1 job of a prompt library is *not losing a good prompt*. Capture must be faster than switching to a notes app.
3. **Calm by default, signal on change.** Our theme is already calm (deep navy, soft glows). Keep it. Use accent color *only* for actionable / changed state, never decoration.
4. **Progressive disclosure.** Show the essence on the card; hide notes, metadata, history behind a tap. Don't make users parse a wall of data.
5. **Trust through feedback.** Every mutation (save, sync, conflict, share) gets immediate, honest feedback. Silent failures destroy trust in a shared tool.

---

## 1. Information Architecture

### 1.1 Current IA (what we ship today)
```
App
├─ Header (brand + value prop)
├─ Add Prompt (single form, always visible)
└─ Library
   ├─ Stats bar (count, export, import)
   ├─ Search
   └─ Prompt Grid (cards: title, content, model, code flag, notes, rating, meta)
```

Problem: **"Add" and "Browse" compete for the same scroll space.** As the library grows, the form pushes content down. That breaks Principle #2 (capture) AND #1 (browse).

### 1.2 Proposed IA (teams / multi-user)
```
App
├─ Top Bar (persistent)
│  ├─ Brand
│  ├─ Team switcher         ← NEW (multi-tenant)
│  ├─ Global search         ← promote to persistent
│  └─ Account / avatar
├─ Left Rail (collections)  ← NEW
│  ├─ All Prompts
│  ├─ Shared with me
│  ├─ Starred
│  ├─ Tags / Folders
│  └─ Trash
├─ Main
│  ├─ Toolbar (sort, filter, view toggle)
│  └─ Prompt Grid / List
└─ Composer (modal or right drawer, NOT inline)
```

**Why:** Separation of capture and browse. The composer becomes a **modal/drawer** triggered by a persistent "+ New Prompt" button (Cmd/Ctrl+K or "N"), so it's always one keystroke away but never eats scroll space.

---

## 2. Visual Design System

### 2.1 Keep the existing tokens — they're good
Our `:root` tokens (`--bg #0d0f1a`, `--accent #7c6bfc`, `--surface`, etc.) are cohesive and on-brand for a developer tool. **Do not redesign the palette.** The task is to *extend* it into a system, not replace it.

**Additions needed for a teams product:**

| Token | Value (proposal) | Purpose |
|---|---|---|
| `--surface-3` | `#232842` | Nested surfaces (drawers, popovers) |
| `--success` | `#34d399` | Already used in toasts — promote to token |
| `--warning` | `#fbbf24` | Conflict / stale-state banners |
| `--presence` | `#22d3ee` | "Alex is editing" live indicator |
| `--focus-ring` | `0 0 0 3px rgba(124,107,252,0.4)` | Standardized a11y focus (already in inputs — apply everywhere) |

### 2.2 Spacing & Type Scale
Define a strict 4px spacing scale (already implied by `gap: 8/12/16`) and a type scale:
- Display (h1): clamp 28–46px (have it)
- Section (h2/h3): 17–18px (have it)
- Body: 13–14px (have it)
- Caption/meta: 11px (have it)

**New rule:** meta/text-3 text (`--text-3 #5a5f7a`) is currently *too low-contrast* for small body text on `--surface`. WCAG AA needs 4.5:1. Bump meta text to `--text-2` when it carries meaning (dates are fine at text-3; labels are not).

### 2.3 Motion
Our transitions (`cubic-bezier(0.4,0,0.2,1)`, ~0.22s) are tasteful. **Keep them, but add `prefers-reduced-motion` guard** — currently `fadeSlideUp`/`pulse` animations run unconditionally, which harms vestibular users and battery life.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

---

## 3. Core Flows & Interaction Patterns

### 3.1 Capture Flow (highest priority)
- **Trigger:** Floating "+" button (bottom-right, above toast stack) + `N` key + Cmd/Ctrl+K command palette.
- **Composer:** Right-side **drawer** (320–420px) on desktop, full-screen sheet on mobile. Pre-fills `team_id` from current team switcher.
- **Auto-save draft:** If they close without saving, stash the draft (localStorage now, server later) and show "Draft restored" on reopen. Never lose their text.
- **Character limit:** Today's 2000-char hard cap is invisible until they hit it. Show the counter turning `--warning` at 90% and `--danger` at 100% (we have `.char-count.warn` — wire it to a threshold, not just max).

### 3.2 Browse & Scan
- **Card vs List toggle** in the toolbar. Cards for visual scanning (current), List for dense power-users (title + model + tags + last-edited in rows).
- **Stable card order:** Default sort `updated_at DESC` (recently touched floats up — matches how people actually re-find prompts). Offer sort by title, created, rating.
- **Empty state:** Current `.empty-state` is decent. For *team* empty states, add a one-click "Invite teammates" CTA — an empty team library is a churn moment.

### 3.3 Search & Find
- Promote search to the **persistent top bar** (currently hidden until prompts exist — that's wrong; search should always be discoverable).
- **Command palette (Cmd/Ctrl+K):** The fastest path for technical users. Fuzzy search titles + tags, jump to a prompt, create new, switch team. This is how devs expect to navigate a tool like ours.
- As the backend adds `tsvector` (and later `pgvector` semantic), the UI must surface **"similar prompts"** as a results row — a genuine differentiator for a *prompt* library.

### 3.4 Collaboration UI (ties to backend spec §1.3)
- **Presence:** Small avatar stack on a card when someone else has it open (`--presence` ring). Non-intrusive.
- **Conflict resolution:** When `version` moved (optimistic concurrency), show an inline **diff modal**: "Alex edited 2 min ago. Keep yours / Take theirs / Merge." Mirror the calm dialog styling we already use for delete/import.
- **Ownership & sharing:** A "Share" affordance on each card → copy link / invite by email. Show a shared icon on cards visible to other teams.
- **Audit:** "History" entry in the card menu → read-only version timeline (cheap to build on `prompt_versions`).

---

## 4. Component-Level Recommendations

### 4.1 Buttons
We have `--btn-primary` (gradient, full-width) and `--btn-secondary`. Add:
- **Icon-only buttons** need a visible `:focus-visible` ring (our `.btn-icon` only changes color on hover — keyboard users can't see focus). Apply `--focus-ring`.
- **Loading state:** No spinner style exists. Add `.btn.is-loading` with a 16px spinner + disable interaction. Critical for async save/sync so users don't double-submit.

### 4.2 Forms & Validation
- Inline validation: red border + message under field on blur, not on submit. Reuse `--danger` and `--danger-glow`.
- Required-field affordance: asterisk in `--text-2`, not `--text-3` (visibility).

### 4.3 Feedback (Toasts)
Current toasts are good (success/error/info, bottom-right). Rules:
- **Stacking:** cap at 3 visible; queue the rest.
- **Persistence:** errors stay until dismissed; success auto-dismiss at 3s (have it).
- **Sync state:** add an "info/syncing" variant that does *not* auto-dismiss while a network op is in flight.

### 4.4 Dialogs & Modals
Our `.overlay`/`.dialog` pattern is solid. Standardize:
- All modals: `Esc` to close, click-outside to close, `focus-trap`, return focus to trigger on close. (Currently delete/import modals — verify Esc works; it's not in the CSS.)
- **Conflict/History modals** reuse `.dialog` with a wider `--max-width` variant (we have `.conflict-dialog { max-width: 500px }` — generalize to `.dialog.wide`).

### 4.5 Cards
Current `.prompt-card` is strong (hover lift, top-gradient reveal, notes panel, rating, metadata block). Refinements:
- **Keyboard navigation:** cards should be focusable (`tabindex="0"`) and open on Enter, not just hover/click.
- **Density control:** add a "compact" class that hides metadata block by default (progressive disclosure).
- **Selection mode:** for bulk actions (move, tag, delete many) — shift/ctrl-click to multi-select with a toolbar that appears. Necessary once libraries exceed ~50 prompts.

---

## 5. Accessibility (non-negotiable for a "production" tool)

Our current build is **visually rich but a11y-light**. Must-fix before teams launch:

1. **Color contrast:** audit `--text-3` usage (fails AA at small sizes). Bump meaningful text to `--text-2`.
2. **Focus visibility:** add `:focus-visible` rings to *all* interactive elements (buttons, cards, radios, links). Standardize on `--focus-ring`.
3. **Semantics:** ensure dialogs use `role="dialog" aria-modal="true"` (have it on delete/note/import — extend to all), and that the live region for toasts (`aria-live="polite"`, have it) announces errors as `aria-live="assertive"`.
4. **Keyboard parity:** every mouse action has a key path. Ship `Cmd/Ctrl+K`, `N` (new), `/` (search focus), `Esc` (close).
5. **Reduced motion:** add the media query from §2.3.
6. **Target size:** touch targets ≥ 44×44px on mobile (our `.btn-icon` at 32px is too small for touch — enlarge hit area even if visual stays 32).

---

## 6. Responsive & Cross-Device

- **Desktop (>900px):** current 900px max-width is fine, but with left rail + composer we'll want ~1200–1280px container. Keep cards `auto-fill minmax(280px,1fr)` (good).
- **Tablet (600–900):** collapse left rail to a icon-only strip or a slide-in drawer.
- **Mobile (<560px):** already handled (single column, full-width toasts). Add: composer as bottom sheet; team switcher as a top dropdown; command palette still works.
- **Touch:** enlarge hit areas (see §5.6); disable hover-only reveals (show actions on tap).

---

## 7. Onboarding & First-Run Experience

A teams product lives or dies on **time-to-first-prompt**. Current app assumes the user knows what to do. Add:

1. **First-run empty state** with a 3-step mini-tour: (1) Create your first prompt, (2) Add tags so you can find it, (3) Invite a teammate. Dismissable, non-modal tooltips.
2. **Template gallery:** pre-seeded example prompts (we have `PersonaExample.txt` spirit — ship 5–10 starter prompts per category) so a new user isn't staring at a blank void.
3. **Import as onboarding:** the existing JSON import is a great "bring your own" path — surface it prominently on first run for users migrating from the `localStorage` version.

---

## 8. Design Deliverables I Need From Engineering

To implement this cleanly, I need:
- **Design tokens as CSS custom properties** (done) — promoted to a single `tokens.css` imported first, so the same values drive web + future mobile.
- **A component storybook** (even a lightweight one) so we stop hand-editing 1300-line CSS per component.
- **Loading / empty / error states for every screen**, not just the happy path.
- **i18n-ready strings** from day one (we'll go global; hardcode-free text).

---

## 9. What I'd Ship First (UX Cut Line)

Aligned with the Senior Engineer's MVP cut:

1. **Promote search to top bar + Cmd/Ctrl+K palette** — biggest UX win, cheapest build.
2. **Composer as drawer/modal** — fixes the capture-vs-browse conflict.
3. **Team switcher + shared/starred rails** — makes "teams" real in the UI.
4. **A11y pass** (focus rings, contrast, reduced motion, keyboard) — required for "production."
5. **First-run onboarding + template gallery.**

**Defer:** bulk selection mode, semantic "similar" UI, full presence cursors, mobile bottom-sheet polish. Each waits for backend readiness or proven demand.

---

## 10. Open Questions for the Team

- **Drawer vs modal vs full-page** for the composer? I recommend drawer on desktop (context-preserving), sheet on mobile.
- **Folders vs tags vs both?** Tags are more flexible for a prompt library; folders feel rigid. I lean tags-first, optional folders later.
- **Light mode?** Our theme is dark-only. Dev tools can ship dark-first, but enterprise buyers often demand light. Build tokens to support both from the start (cheap now, expensive later).
- **Density default:** comfortable (current) or compact for power users? Offer a toggle; default comfortable.
