# Tango — iOS app

A native iOS wrapper around the Tango web game. The full game (all 1,500 levels)
is **bundled inside the app**, so it runs completely offline — no server, no
network. A SwiftUI `App` hosts a `WKWebView` that serves the bundled web assets
through a custom URL scheme (so `fetch()` and `localStorage` work like on the web).

## Requirements

- **Xcode 15 or newer** (this machine currently only has the Command Line Tools —
  install Xcode from the App Store to build/run).
- iOS 16+ deployment target. Runs on the Simulator with no signing setup.

## Run it

1. Open `ios/Tango.xcodeproj` in Xcode.
2. Pick an iPhone Simulator (e.g. iPhone 15) in the toolbar.
3. Press **Run** (⌘R).

To run on a physical device, select your device, then set your Apple ID team
under **Signing & Capabilities** (the bundle id is `com.tango.game` — change it
if it's taken).

Or from the command line once full Xcode is installed:

```bash
cd ios
xcodebuild -project Tango.xcodeproj -scheme Tango \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build
```

## Keeping the game in sync

The web assets live in `ios/Tango/Web/` (a bundled folder). If you edit the web
game in the repo root, re-copy them:

```bash
./ios/sync-web.sh
```

## Project layout

- `Tango/TangoApp.swift` — SwiftUI app entry point.
- `Tango/ContentView.swift` — full-screen container (background matches the web app).
- `Tango/WebView.swift` — `WKWebView` + a `WKURLSchemeHandler` that serves `Web/`.
- `Tango/Web/` — the bundled game (`index.html`, `styles.css`, `game.js`, `levels.json`).
- `Tango/Assets.xcassets/` — app icon + accent color.
- `generate-icon.js` — regenerates the 1024² app icon (`node ios/generate-icon.js`).

## Notes

- The web layout already handles the notch/safe areas via CSS `env(safe-area-inset-*)`,
  and the web view extends edge-to-edge.
- Progress is saved via `localStorage` inside the app's persistent data store.
- If you'd prefer a fully-native (non-web) implementation later, the puzzle bank
  in `levels.json` and the rules are simple enough to port to SwiftUI directly.
