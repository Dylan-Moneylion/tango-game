#!/usr/bin/env bash
# Copies the latest web game assets into the iOS app's bundled Web/ folder.
# Run this after editing the web game so the iOS app stays in sync.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
DEST="$DIR/Tango/Web"
mkdir -p "$DEST"
cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/game.js" "$ROOT/levels.json" "$DEST/"
echo "Synced web assets into $DEST"
