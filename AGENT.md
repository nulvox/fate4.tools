# Agent Brief: Fate4.tools Development

You are building a browser-based character sheet manager for the Fate Core RPG system. Read `CLAUDE.md` thoroughly before starting — it contains the full spec, architecture, data model, and mandatory development rules.

## Your Development Process

You MUST follow this exact loop for every task in `TODO.md`:

```
1. Read the current task from TODO.md
2. Write a failing test for the task's acceptance criteria
3. Run the test — confirm it fails for the expected reason
4. Write the minimal production code to pass the test
5. Run ALL tests — confirm everything passes
6. Lint ALL changed files
7. Verify the feature works (for UI tasks: describe what to check in browser)
8. Mark the task [x] in TODO.md
9. Commit with a message referencing the task
10. Move to the next task
```

**Never write production code without a failing test first.**
**Never mark a task done if any test fails or any lint error exists.**
**Never skip tasks or work on multiple tasks simultaneously.**

## Linting Commands

After every code change, run the relevant linters:

```bash
# Go
golangci-lint run ./...

# HTML validation (if available, otherwise manually verify)
# Ensure: no unclosed tags, no duplicate IDs, valid attributes

# CSS (manual check: no syntax errors, print.css scoped to @media print)

# JS (ensure no console.error in browser, strict mode)
```

## Build Commands

```bash
# Compile Go to WASM
GOOS=js GOARCH=wasm go build -o docs/main.wasm ./cmd/wasm/

# Copy WASM exec helper
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" docs/

# Serve locally for testing
python3 -m http.server 8080 --directory docs/
# OR
npx serve docs/
```

## Testing Go WASM Code

Go WASM tests require a JS runtime. Use one of:

```bash
# Option 1: Use wasmbrowsertest
go install github.com/nicholasgasior/gowasm-test@latest
GOOS=js GOARCH=wasm go test ./internal/... -exec="$(go env GOPATH)/bin/gowasm-test"

# Option 2: Test pure logic with build tags
# Files without syscall/js imports can be tested normally
go test ./internal/character/...

# Option 3: Use -tags=!js for unit tests that don't need browser APIs
```

Design the `internal/character/` package to be pure Go with NO `syscall/js` imports. Only `cmd/wasm/main.go` should import `syscall/js`. This keeps all core logic testable with standard `go test`.

## Architecture Guidance

### Separation of Concerns

```
internal/character/  — Pure Go. No JS dependencies. Fully testable with `go test`.
  character.go       — Data structs, constructors
  defaults.go        — SRD default data
  validate.go        — Skill pyramid, refresh, stress box rules
  serialization.go   — JSON marshal/unmarshal, version handling

cmd/wasm/main.go     — Bridge layer. Imports syscall/js. Thin wrapper that:
                        - Registers Go functions as JS globals
                        - Converts JS values <-> Go structs via JSON
                        - Keeps a channel open to prevent WASM from exiting

web/js/              — Frontend JS that calls the WASM-exposed functions
  app.js             — Boot: load WASM, init UI
  character-ui.js    — Render character sheet, bind edit events
  tabs.js            — Tab bar, split-pane logic
  storage.js         — localStorage read/write
  import-export.js   — File download/upload for JSON, print trigger
```

### Data Flow

```
User edits field in browser
  → JS event handler captures change
  → JS calls Go WASM function (e.g., updateCharacterField)
  → Go validates and returns updated character JSON
  → JS updates DOM with new state
  → JS persists to localStorage
```

### Key Design Decisions

1. **Go WASM as pure logic engine**: All character data manipulation, validation, and serialization happens in Go. The JS side never directly mutates character data — it always round-trips through Go.

2. **JSON as the bridge format**: Data crosses the JS/Go boundary as JSON strings. This is simple, debuggable, and avoids complex `syscall/js` value marshaling.

3. **localStorage, not cookies**: Characters are stored as JSON in localStorage. Key format: `fate4_character_{id}`. A manifest key `fate4_manifest` stores the list of character IDs and metadata (name, last modified).

4. **Print, not PDF library**: The print layout uses CSS `@media print` to render a clean character sheet. Users print to PDF via their browser. This avoids bundling a PDF library in WASM.

5. **GitHub Pages via `docs/`**: The build outputs everything to `docs/`. The repo is configured to serve GitHub Pages from `docs/` on the main branch.

## SRD Default Skills

The 18 default Fate Core skills, in alphabetical order:

```
Athletics, Burglary, Contacts, Crafts, Deceive, Drive, Empathy, Fight,
Investigate, Lore, Notice, Physique, Provoke, Rapport, Resources, Shoot,
Stealth, Will
```

## Fate Ladder (Ratings)

```
+8  Legendary
+7  Epic
+6  Fantastic
+5  Superb
+4  Great
+3  Good
+2  Fair
+1  Average
+0  Mediocre
-1  Poor
-2  Terrible
```

## Skill Pyramid Rules (Character Creation)

At creation with a default refresh of 3 and skill cap of Great (+4):
- 1 skill at Great (+4)
- 2 skills at Good (+3)
- 3 skills at Fair (+2)
- 4 skills at Average (+1)
- All others at Mediocre (+0)

This is a soft constraint — the app should display a warning if violated, NOT prevent saving.

## Stress Box Rules

- Everyone starts with 2 Physical and 2 Mental stress boxes.
- Physique skill at Fair (+2) or Good (+3): gain a 3rd Physical stress box.
- Physique skill at Superb (+5)+: gain a 3rd and 4th Physical stress box, plus an extra Mild Physical consequence slot.
- Same pattern for Will skill → Mental stress/consequences.

## What "Done" Looks Like

The finished application:
1. Loads in a browser from static files (GitHub Pages compatible)
2. Creates new characters with SRD defaults pre-filled
3. Lets users edit every field: name, aspects, skills, stunts, stress, consequences, refresh, fate points, extras, notes
4. Skills are fully customizable: rename, reorder, add, remove
5. Multiple characters via tabs, with side-by-side view option
6. Auto-saves to localStorage on every edit
7. Exports character as downloadable `.json` file
8. Imports character from uploaded `.json` file
9. Prints a clean character sheet via browser print dialog
10. Shows soft validation warnings (pyramid, refresh, stress rules)
11. All Go code has test coverage, all linting passes
