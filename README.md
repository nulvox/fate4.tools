# Fate4.tools

A browser-based character sheet manager for [Fate Core](https://fate-srd.com/fate-core) (4th Edition). Built with Go compiled to WebAssembly for core logic, with a vanilla HTML/CSS/JS frontend. No server required — runs entirely in the browser.

**Live site:** [https://nulvox.github.io/fate4.tools](https://nulvox.github.io/fate4.tools)

## Features

- Create and manage multiple character sheets with tabbed navigation
- Full Fate Core character sheet: aspects, skills, stunts, stress, consequences, extras, notes
- Skill pyramid validation and automatic refresh calculation
- JSON import/export for sharing characters
- Side-by-side view for comparing two characters
- Print-friendly layout via browser print dialog
- Auto-saves to localStorage

## Build

Requires Go 1.23+ and `golangci-lint`.

```sh
make build    # Compile WASM and assemble docs/ for deployment
make test     # Run Go tests
make lint     # Run golangci-lint
make serve    # Build and serve locally at http://localhost:8080
```

## Usage

Open `docs/index.html` in a browser (or use `make serve`). Click the **+** button to create a character. All data is saved locally in your browser's localStorage.

## License

See repository for license details.
