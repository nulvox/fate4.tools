# Fate4.tools — Fate Core Character Sheet Manager

## Project Overview

A browser-based, fully interactive character sheet generator and manager for Fate Core (4th Edition) and its homebrew variants. Built with Go compiled to WebAssembly for core logic, with an HTML/CSS/JS frontend. Hosted as static files on GitHub Pages.

## Tech Stack

- **Core logic**: Go 1.23+, compiled to `GOOS=js GOARCH=wasm`
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (no framework)
- **Storage**: `localStorage` (JSON-serialized character data)
- **PDF/Print**: CSS `@media print` stylesheet + browser print dialog
- **Build**: Makefile or shell script; output is a `docs/` directory for GitHub Pages
- **Testing**: Go standard `testing` package; JS tested via Go WASM integration tests where possible
- **Linting**: `golangci-lint` for Go; browser-console-clean JS (no lint warnings)

## Architecture

Go WASM serves as the logic backend. It exposes functions to JavaScript via `syscall/js`:

- Character CRUD (create, read, update, delete)
- JSON import/export (serialize/deserialize full character state)
- Validation (skill pyramid rules, refresh calculations)
- Default data (SRD skill list, default aspects template)

The JS frontend handles all DOM manipulation, event binding, tab management, and layout. It calls into Go WASM for all data operations.

## Development Workflow

### MANDATORY: Test-Driven Development

1. **Write the test first.** No production code without a failing test.
2. **Run the test, confirm it fails** for the right reason.
3. **Write the minimal code** to make the test pass.
4. **Refactor** only after green.
5. **Lint after every change** to a `.go`, `.js`, `.html`, or `.css` file.

### MANDATORY: Incremental TODO-Driven Progress

- Work from `TODO.md`. Each task is a small, testable increment.
- Mark tasks `[x]` only after ALL tests pass AND linting is clean.
- Never skip ahead. Complete tasks in order.
- If a task is blocked, note why and move to the next unblocked task.

### MANDATORY: Definition of Done

A task is NOT done until:
- [ ] All existing tests pass (`GOOS=js GOARCH=wasm go test ./...` or equivalent)
- [ ] New tests cover the new behavior
- [ ] `golangci-lint run` passes with zero issues
- [ ] HTML validates (no unclosed tags, no duplicate IDs)
- [ ] The feature works in a browser (manual verification described in task)
- [ ] `TODO.md` is updated

## Package Management

- Use `uv` for any Python tooling needs (never `pip`).
- Use standard Go modules (`go mod tidy`).

## Project Structure

```
fate4.tools/
  CLAUDE.md          # This file
  AGENT.md           # Agent development prompt/brief
  TODO.md            # Incremental task list
  go.mod
  go.sum
  cmd/
    wasm/
      main.go        # WASM entry point, JS bridge
  internal/
    character/
      character.go   # Core data model
      character_test.go
      defaults.go    # SRD default skills, aspects template
      defaults_test.go
      validate.go    # Pyramid validation, refresh calc
      validate_test.go
      serialization.go    # JSON marshal/unmarshal
      serialization_test.go
  web/
    index.html       # Main HTML shell
    css/
      style.css      # Main styles
      print.css      # Print-specific styles
    js/
      app.js         # App initialization, WASM loading
      character-ui.js # Character sheet DOM rendering
      tabs.js        # Tab management (multi-character)
      storage.js     # localStorage wrapper
      import-export.js # JSON file import/export UI
  docs/              # Built output for GitHub Pages
  Makefile
```

## Character Sheet Data Model

A character contains:
- **Name**: string
- **Description**: string (freeform)
- **Aspects**: ordered list of {label: string, value: string}
  - Defaults: High Concept, Trouble, Relationship, Other, Other
- **Skills**: ordered list of {name: string, rating: int}
  - Default names from SRD: Athletics, Burglary, Contacts, Crafts, Deceive, Drive, Empathy, Fight, Investigate, Lore, Notice, Physique, Provoke, Rapport, Resources, Shoot, Stealth, Will
  - Users can rename, reorder, add, remove skills
  - Ratings use the Fate Ladder: +0 Mediocre through +8 Legendary
- **Stunts**: ordered list of {name: string, description: string}
- **Stress**: map of track name to box count
  - Defaults: Physical (2 boxes), Mental (2 boxes)
  - Box count adjustable (Physique/Will can add boxes per Fate Core rules)
- **Consequences**: ordered list of {severity: string, value: string}
  - Defaults: Mild (-2), Moderate (-4), Severe (-6)
  - Extra mild slots can be added
- **Refresh**: int (default 3)
- **Current Fate Points**: int
- **Extras**: string (freeform text)
- **Notes**: string (freeform text)
- **GameConfig**: per-character configuration
  - Custom skill list template (for the whole game/table)
  - Custom aspect labels
  - Custom stress track names

## Key UX Requirements

- **Tabs**: Each character sheet opens in a tab. Tabs can be created, closed, renamed.
- **Side-by-side**: Support split-pane view to compare two characters.
- **Auto-save**: Changes persist to localStorage immediately on edit.
- **JSON export**: Download character as `.json` file.
- **JSON import**: Upload `.json` file to load a character.
- **Print**: Render a print-friendly layout mimicking the official Fate Core character sheet, triggered via browser print dialog.
- **Skills UI**: Each skill is a text input (name) + select/input (rating). Add/remove buttons. Drag-to-reorder or up/down arrows.
- **Responsive**: Should work on desktop browsers. Mobile is nice-to-have, not required.

## Fate Core SRD Reference

The Fate Core SRD is available at https://fate-srd.com/fate-core for reference. Key rules affecting the sheet:

- **Skill Pyramid**: At character creation, skills form a pyramid — one at Great (+4), two at Good (+3), three at Fair (+2), four at Average (+1). The app should validate this optionally (warn, not block).
- **Refresh**: Starts at 3, reduced by 1 for each stunt beyond the first 3. Minimum 1.
- **Stress**: Base 2 boxes each. Physique/Will at Fair (+2) or Good (+3) adds a 3rd box. At Superb (+5)+ adds a 4th box and an extra Mild consequence.
