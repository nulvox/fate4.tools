# TODO — Fate4.tools Incremental Build

Work through these tasks in order. Each task is a small, testable increment.
Do NOT skip ahead. Mark `[x]` only after all tests pass and linting is clean.

---

## Phase 0: Project Skeleton

- [x] **0.1** Initialize Go module (`go mod init fate4.tools`), create directory structure (`cmd/wasm/`, `internal/character/`, `web/css/`, `web/js/`), create minimal `cmd/wasm/main.go` that compiles to WASM and prints "WASM loaded" to the JS console.
- [x] **0.2** Create `Makefile` with targets: `build` (compile WASM + copy wasm_exec.js + copy web/ assets to docs/), `test` (run Go tests), `lint` (run golangci-lint), `serve` (local HTTP server on docs/). Verify `make build` produces `docs/main.wasm`.
- [x] **0.3** Create minimal `web/index.html` that loads `wasm_exec.js` and `main.wasm`, and displays a loading message until WASM is ready. Create `web/js/app.js` that initializes the WASM module. Verify in browser: console shows "WASM loaded".
- [x] **0.4** Install and configure `golangci-lint`. Create `.golangci.yml` with sensible defaults. Run `golangci-lint run ./...` — must pass cleanly. Add a lint CI step to the Makefile.

## Phase 1: Core Data Model (Pure Go, Fully Testable)

- [x] **1.1** Define `Character` struct in `internal/character/character.go` with fields: ID, Name, Description. Write `NewCharacter()` constructor that generates a UUID and sets empty defaults. Test: creating a character returns non-empty ID and empty name.
- [x] **1.2** Add `Aspect` struct (Label, Value) and `Aspects []Aspect` field to Character. `NewCharacter()` populates 5 default aspects: "High Concept", "Trouble", "Relationship", "", "". Test: new character has 5 aspects with correct labels.
- [x] **1.3** Add `Skill` struct (Name, Rating int) and `Skills []Skill` field. Create `defaults.go` with `DefaultSkills()` returning the 18 SRD skills at rating 0. `NewCharacter()` populates skills from defaults. Test: new character has 18 skills, all at rating 0, in alphabetical order.
- [x] **1.4** Add `Stunt` struct (Name, Description) and `Stunts []Stunt` field. `NewCharacter()` starts with 3 empty stunt slots. Test: new character has 3 empty stunts.
- [x] **1.5** Add `StressTrack` struct (Name, Boxes []bool) and `Stress []StressTrack` field. `NewCharacter()` creates Physical (2 boxes) and Mental (2 boxes). Test: new character has 2 stress tracks, each with 2 false boxes.
- [x] **1.6** Add `Consequence` struct (Severity string, Shift int, Value string) and `Consequences []Consequence` field. `NewCharacter()` creates Mild (-2), Moderate (-4), Severe (-6). Test: new character has 3 consequences with correct shifts.
- [x] **1.7** Add `Refresh int`, `FatePoints int`, `Extras string`, `Notes string` fields. `NewCharacter()` sets Refresh=3, FatePoints=3. Test: defaults are correct.
- [x] **1.8** Add `GameConfig` struct (SkillNames []string, AspectLabels []string, StressTrackNames []string) embedded in Character. `NewCharacter()` populates from SRD defaults. Test: GameConfig has 18 skill names, 5 aspect labels, 2 stress track names.

## Phase 2: Serialization (JSON Import/Export)

- [x] **2.1** Implement `Character.ToJSON() ([]byte, error)` and `FromJSON([]byte) (*Character, error)` in `serialization.go`. Test: round-trip a character through JSON and verify all fields match.
- [x] **2.2** Add a `Version` field to the JSON output (start at `"1.0"`). `FromJSON` should check version and return an error for unknown versions. Test: missing version defaults to "1.0"; unknown version returns error.
- [x] **2.3** Test edge cases: empty strings, zero-length skill lists, unicode characters in names/descriptions, maximum-length fields. Verify clean round-trips.

## Phase 3: Validation

- [x] **3.1** Implement `ValidateSkillPyramid(skills []Skill, cap int) []string` in `validate.go` that returns a list of warning messages if skills don't form a valid pyramid. Test: valid pyramid returns no warnings; too many skills at one level returns a warning; missing levels return warnings.
- [x] **3.2** Implement `CalculateRefresh(baseRefresh int, stunts []Stunt) int` — returns effective refresh (base minus extra stunts beyond 3, minimum 1). Test: 3 stunts = base refresh; 5 stunts = base-2; 0 stunts = base refresh; never below 1.
- [x] **3.3** Implement `CalculateStressBoxes(skills []Skill, trackName string) int` — returns correct box count based on Physique (Physical) or Will (Mental). Test: no skill = 2 boxes; Fair Physique = 3 boxes; Superb Physique = 4 boxes.
- [x] **3.4** Implement `ShouldHaveExtraMildConsequence(skills []Skill, trackName string) bool`. Test: Superb+ Physique → extra Physical Mild; Superb+ Will → extra Mental Mild; lower → false.
- [x] **3.5** Implement `ValidateCharacter(c *Character) []string` that combines all validations and returns a list of all warnings. Test: a fully valid character returns no warnings; various issues return appropriate messages.

## Phase 4: WASM Bridge

- [x] **4.1** In `cmd/wasm/main.go`, expose `createCharacter()` to JS — returns a new character as a JSON string. Verify: calling `createCharacter()` in browser console returns valid JSON with all default fields.
- [x] **4.2** Expose `updateCharacter(jsonStr)` — accepts a modified character JSON, validates it, and returns the validated character JSON plus a warnings array. Test from console: modify a field, call update, get back updated character.
- [x] **4.3** Expose `validateCharacter(jsonStr)` — returns just the warnings array as JSON. Test from console.
- [x] **4.4** Expose `importCharacter(jsonStr)` and `exportCharacter(jsonStr)` — import parses and validates external JSON; export returns clean JSON for download. Test: import a hand-crafted JSON, export it, verify match.
- [x] **4.5** Expose `getDefaultSkills()` — returns the SRD skill list as JSON. Expose `getFateLadder()` — returns the rating labels as JSON. Test from console.

## Phase 5: Basic UI Shell

- [x] **5.1** Create `web/css/style.css` with a basic layout: header bar, tab bar area, main content area. Use CSS Grid or Flexbox. Dark-on-light color scheme. No character content yet — just the structural layout.
- [x] **5.2** Implement tab bar in `web/js/tabs.js`: "New Character" button creates a tab, clicking a tab activates it, tabs show character name (or "Unnamed" for new). Store active tab state. No character rendering yet — just tab switching with a placeholder in the content area.
- [x] **5.3** Wire up tab creation to `createCharacter()` WASM call. When a new tab is created, call `createCharacter()`, store the result, display the character's name in the tab. Verify: click "New Character" → new tab appears → console shows character JSON.

## Phase 6: Character Sheet UI

- [x] **6.1** In `web/js/character-ui.js`, implement `renderCharacterHeader(character)` — renders Name and Description as editable fields. On blur/change, update the character data and call `updateCharacter()`. Verify: edit name → tab label updates → data persists in memory.
- [x] **6.2** Implement `renderAspects(character)` — renders 5 aspect fields, each with a label and text input. Labels are editable (for homebrew). On change, update character via WASM. Verify: edit aspect values and labels, data updates correctly.
- [x] **6.3** Implement `renderSkills(character)` — renders skill list as rows: text input (skill name) + dropdown (rating from Fate Ladder). Add "Add Skill" button and per-row "Remove" button. On change, update via WASM. Verify: change skill rating, add a skill, remove a skill.
- [x] **6.4** Add skill reordering: up/down arrow buttons on each skill row (or drag-and-drop if straightforward). Verify: reorder skills, order persists.
- [x] **6.5** Implement `renderStunts(character)` — renders stunt list: name input + description textarea per stunt. Add "Add Stunt" button and per-row "Remove" button. Show calculated refresh. Verify: add/remove stunts, refresh updates.
- [x] **6.6** Implement `renderStress(character)` — renders stress tracks as labeled rows of checkboxes. Number of boxes comes from character data. Clicking a box toggles it. Verify: toggle stress boxes, state persists.
- [x] **6.7** Implement `renderConsequences(character)` — renders consequence slots: severity label + shift number + text input. Verify: fill in consequences, data updates.
- [x] **6.8** Implement `renderExtrasAndNotes(character)` — renders Extras and Notes as textareas. Verify: edit, data updates.
- [x] **6.9** Implement `renderValidationWarnings(character)` — display warnings from `validateCharacter()` in a non-intrusive panel (e.g., collapsible sidebar or footer). Warnings update live on edit. Verify: break the skill pyramid → warning appears; fix it → warning disappears.
- [x] **6.10** Compose all renderers into a full `renderCharacterSheet(character)` function called when a tab is activated or data changes. Verify: full character sheet renders with all sections.

## Phase 7: Persistence (localStorage)

- [x] **7.1** Implement `web/js/storage.js`: `saveCharacter(character)` writes to `localStorage` keyed by `fate4_character_{id}`. `loadCharacter(id)` reads and parses. `listCharacters()` returns all stored character IDs and names. `deleteCharacter(id)` removes.
- [x] **7.2** Wire auto-save: every time `updateCharacter()` returns successfully, save to localStorage. On app load, restore all characters from localStorage and recreate tabs. Verify: create character, edit name, reload page → character and name persist.
- [x] **7.3** Handle storage errors gracefully: if localStorage is full or unavailable, show a non-blocking warning banner.

## Phase 8: JSON File Import/Export

- [x] **8.1** Implement JSON export in `web/js/import-export.js`: "Export JSON" button triggers a download of the current character as `{name}.fate4.json`. Uses the Blob + download link pattern. Verify: export, open file, valid JSON.
- [x] **8.2** Implement JSON import: "Import JSON" button opens a file picker. On file select, read contents, call `importCharacter()` WASM function, create a new tab with the imported character. Verify: export a character, delete it, import the file → character restored.
- [x] **8.3** Handle import errors: malformed JSON, wrong version, missing required fields. Show clear error messages. Verify: try importing a random text file → friendly error message.

## Phase 9: Print Layout

- [x] **9.1** Create `web/css/print.css` with `@media print` rules: hide tabs, hide UI controls (buttons, warnings), show only the active character sheet in a clean single-page layout. Verify: print preview shows clean sheet.
- [x] **9.2** Style the print layout to mimic the official Fate Core character sheet: aspects in a header block, skills in a columnar pyramid layout, stress as box outlines, consequences as lined slots. Verify: print preview looks like a proper character sheet.
- [x] **9.3** Add a "Print" button in the UI that triggers `window.print()`. Verify: button works, print dialog opens, preview is clean.

## Phase 10: Side-by-Side View

- [x] **10.1** Add a "Split View" toggle button. When active, the content area splits into two panes. Each pane has a dropdown to select which character tab to display. Verify: toggle split view, select different characters in each pane.
- [x] **10.2** Both panes are fully interactive — edits in either pane auto-save and update. Verify: edit a character in the right pane, switch to its tab in single view, changes are there.
- [x] **10.3** Print in split view: print only the left pane (or add option to print both). Verify: print preview is clean.

## Phase 11: Polish and Edge Cases

- [ ] **11.1** Tab management: close button on tabs (with confirmation if character has data), rename tab by double-clicking, reorder tabs by drag or keyboard.
- [ ] **11.2** Empty state: when no characters exist, show a welcome/getting-started message with a prominent "Create Character" button.
- [ ] **11.3** Keyboard accessibility: all interactive elements reachable via Tab key, Enter/Space to activate, Escape to cancel. Skill rating dropdown navigable via arrow keys.
- [ ] **11.4** Responsive layout: ensure the sheet is usable at 1024px+ width. Collapse skill columns on narrower viewports.
- [ ] **11.5** Performance: test with 10+ characters loaded. Ensure tab switching is instant, no lag on edits.

## Phase 12: Build and Deploy

- [ ] **12.1** Verify `make build` produces a complete `docs/` directory: `index.html`, `main.wasm`, `wasm_exec.js`, CSS files, JS files. Verify: `make serve` → app works in browser.
- [ ] **12.2** Add a `.github/pages.yml` or configure repo settings for GitHub Pages from `docs/` on main branch. Verify deployment instructions in README.
- [ ] **12.3** Final test pass: run all Go tests, lint all files, create a character from scratch, fill every field, export JSON, import it back, print preview, verify side-by-side. All green.
- [ ] **12.4** Write a minimal `README.md`: what this is, how to build, how to use, link to live site.
