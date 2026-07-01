# Tango

[![Play now](https://img.shields.io/badge/Play-live%20demo-6366f1)](https://dylan-moneylion.github.io/tango-game/)
[![Validate levels](https://github.com/Dylan-Moneylion/tango-game/actions/workflows/validate.yml/badge.svg)](https://github.com/Dylan-Moneylion/tango-game/actions/workflows/validate.yml)

A clone of the LinkedIn puzzle game **Tango**, with **no daily limit** and **1,000 hand-verified levels each** of Easy, Medium, and Hard (3,000 total). Instead of suns and moons it uses **red triangles** and **blue circles**.

**▶ Play it now: https://dylan-moneylion.github.io/tango-game/**

Runs as a **mobile-friendly web app** and as a **native iOS app** (see [`ios/`](ios/README.md)) that bundles the whole game for offline play.

## How to play

Fill every cell of the 6×6 grid with a blue circle or a red triangle so that:

1. **No three in a line** — you can't have three of the same shape in a row horizontally or vertically.
2. **Balance** — each row and column has exactly three circles and three triangles.
3. **Signs between cells**:
   - `=` the two cells are the **same** shape.
   - `×` the two cells are **different** shapes.

Every puzzle has exactly one solution and is solvable with logic alone (no guessing).

**Controls**

- Click/tap a cell to cycle: empty → circle → triangle → empty.
- Right-click (desktop) or **long-press** (touch) to cycle backwards.
- `←` / `→` change level, `Ctrl/Cmd+Z` undoes.
- Undo / Clear / Hint / Check buttons are below the board.

**Mobile:** the board scales fluidly to the screen, respects the notch/safe areas, and disables pinch/double-tap zoom for reliable tapping. Add it to your home screen for a full-screen experience.

Progress (solved levels + last level per difficulty) is saved in your browser via `localStorage`.

## Run it

It's a static site. Because it fetches `levels.json`, open it via a local web server (not `file://`):

```bash
cd tango-game
python3 -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

## Regenerating levels

`levels.json` is produced by a self-contained Node script (no dependencies). It generates a random valid solution, derives constraints, minimizes clues while keeping a **unique** solution, and rates difficulty by the hardest deduction technique required.

```bash
node generate-levels.js 1000            # 1000 puzzles per difficulty (fresh)
node generate-levels.js 500 --append    # keep existing bank and add 500 more per difficulty
node validate-levels.js          # sanity-check uniqueness & rules (exits non-zero on failure)
```

Every push and pull request runs `validate-levels.js` in GitHub Actions (see [`.github/workflows/validate.yml`](.github/workflows/validate.yml)) to guarantee all levels stay valid and uniquely solvable.

## iOS app

A ready-to-open Xcode project lives in [`ios/`](ios/README.md). Open `ios/Tango.xcodeproj` in **Xcode 15+**, pick a simulator, and press Run. The game is bundled inside the app for offline play. After editing the web game, run `./ios/sync-web.sh` to copy the latest assets into the app.

## Files

- `index.html` / `styles.css` / `game.js` — the game.
- `levels.json` — generated puzzle bank (`{ easy, medium, hard }`).
- `generate-levels.js` — puzzle generator + solver + difficulty rater.
- `validate-levels.js` — verifies every level is valid and uniquely solvable.
- `ios/` — native iOS app (SwiftUI + `WKWebView`) bundling the game. 
