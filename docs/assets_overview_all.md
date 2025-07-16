# Sharky – Complete Image Asset Overview

This catalogue covers **every image file** in `img/` grouped by folder. Individual animation frames that follow a strict numbered pattern are compressed into a single row to keep the document readable.

> **Convention keys**  
> • `[#]` – Number of files matching pattern.  
> • `n.png` – Frame number placeholders.  
> • *Desc.* – Short description of what the art depicts.

---

## 0. Editables (concept / PSD snippets)
*(Artwork sources, not loaded in-game – included for completeness)*

| File / Pattern | Count | Description |
|----------------|-------|-------------|
| `*.png` | various | Concept mock-ups, overlay guides, UI sketches |

---

## 0. Editables (source design files)

These PNGs are rasterised slices or mock-ups exported from the original Illustrator / Photoshop source. They are **not loaded by the engine** but serve as references for UI layout, icon design or marketing material.

| File | Size | Description |
|------|------|-------------|
| `background_correction.ai` | — | Illustrator file containing ruler overlays and notes for aligning background halves. |
| `worktable1.png` | 1920×1080 | Screenshot collage of level with measurement guides. |

---

## 1. Sharkie (player sprite sheets)

| Sub-folder | Pattern | Count | Pixel Size* | Recommended FPS | Description | Used by |
|------------|---------|-------|-------------|---------|
| `1.IDLE` | `1.png … 18.png` | 18 | 500×350 | 8 | Sharkie gentle tail sway | `Character.js` idle animation |
| `2.Long_IDLE` | `i1.png, I2.png … I14.png` | 14 | 500×350 | 6 | Yawn, stretch, bored animations | (planned) |
| `3.Swim` | `1.png … 7.png` | 7 | 500×350 | 12 | Main propulsion cycle | Character swim |
| `4.Attack/Bubble trap` | `1.png … 8.png` | 8 | 500×350 | 16 | Bite + bubble release | Attack animation |
| `4.Attack/Bubble trap/Whitout bubbles` | `1.png … 2.png` | 2 | 500×350 | — | Clean bite frames | — |
| `5.Hurt` | `1.png … 4.png` | 4 | 500×350 | 8 | Flinch + red tint overlay | Invulnerability flicker |
| `6.Dead` | `1.png … 2.png` | 2 | 500×350 | — | Floating belly-up corpse | Death sequence |

---

## 2. Enemy

| Enemy | Folder | Pattern | Count | Size | FPS | Description |
|-------|--------|---------|-------|-------------|
| Puffer-fish | `1.Puffer` | `1.png … 3.png` | 3 | 300×300 | 8 | Swim/inflate cycle |
| Jellyfish | `2.Jelly` | `1.png … 4.png` | 4 | 250×400 | 10 | Pulsating bell movement |
| Baby-Shark | `3.Baby` | `1.png … 3.png` | 3 | 250×180 | 12 | Fast mini shark |
| End-Boss | `4.EndBoss` | `1.png … 8.png` | 8 | 1024×600 | 6 | Giant shark phases (idle, rage, bite) |

---

## 3. Background (gameplay layers)

*Detailed description lives in* `docs/assets_overview.md`. Summary table below:

| Layer dir | Files | Size (px) | Parallax Factor | Description |
|-----------|-------|-------------|
| `Layers/1. Godrays` | 3 PNGs | 1920×1080 | 0 (static) | Semi-transparent god-ray overlay blended with day/night |
| `Layers/2. Floor` | 6 PNGs | 1920×1080 (full) | 0.7 | Foreground coral reef; halves allow seamless tiling |
| `Layers/3.Fondo 1` | 6 PNGs | 1920×1080 | 0.4 | Mid-distance reef wall (higher contrast) |
| `Layers/4.Fondo 2` | 6 PNGs | 1920×1080 | 0.15 | Far reef silhouette (low contrast) |
| `Layers/5. Water` | 2 PNGs | 1920×1080 | 0 | Base water gradient background |
| `Barrier` | 10 PNGs | 512×512 avg | n/a | Rocks/coral obstacles placed as level geometry |
| `DarkAsOneImage` | 1 PNG | 9600×1080 | n/a | Single merged dark artwork; legacy reference |
| `LightAsOneImage` | 1 PNG | 9600×1080 | n/a | Single merged light artwork; legacy reference |

---

## 4. Markers

| File | Size | Purpose | In-Game Use |
|------|------|---------|-------------|
| `start.png` | 64×64 | Level-start marker | Editor-only |
| `end.png` | 64×64 | Level-goal marker | Editor-only |
| `loot.png` | 64×64 | Treasure placement marker | Editor-only |
| `enemy.png` | 64×64 | Enemy spawn marker | Editor-only |
| `boss.png` | 64×64 | Boss trigger marker | Editor-only |

---

## 5. Font (bitmap UI fonts)

| Folder | Files | Size per glyph | Usage |
|--------|-------|---------------|-------|
| `numbers` | `0.png … 9.png` (10) | 48×64 | Score HUD counter |
| `letters` | `A.png … Z.png` (26) | 48×64 | In-game text overlays ("PAUSE", "VICTORY", etc.) |

---

## 6. Buttons (UI & Input)

| Asset | Size | States / Notes | Usage |
|-------|------|---------------|-------|
| `6.Buttons/Start/btn_start.png` | 300×120 | Hover / pressed variants in same folder | Main menu start |
| `6.Buttons/Try again/btn_retry.png` | 300×120 | — | Game-over menu |
| `6.Buttons/Full Screen/enter.png, exit.png` | 64×64 | Enter/exit fullscreen | UI overlay |
| `6.Buttons/Key/WSAD.png` | 256×128 | Keyboard hint | Instructions screen |
| `Instructions 1.png` | 800×600 | Page 1 infographic | Controls overlay |
| `Instructions 2.png` | 800×600 | Page 2 infographic | Controls overlay |
| `music-on-icon.svg` / `music-off-icon.svg` | 32×32 | Vector icons | HUD mute toggle |
| `pause-icon.svg` | 32×32 | — | HUD pause |
| `play-icon.svg` | 32×32 | — | HUD resume |

---

## 7. Favicon & Misc.

| Asset | Size | Purpose |
|-------|------|---------|
| `favicon/favicon.png` | 64×64 | Browser tab icon |
| `mobile-landscape-mode-icon.svg` | 256×256 | Prompt to rotate device |
| `touch/ios-icon-180.png` | 180×180 | iOS home-screen icon |
| `touch/android-icon-192.png` | 192×192 | Android adaptive icon |

---

### How this document is generated

A script enumerates `img/` and groups files by naming schema, collapsing sequential animation frames into a single row. Update it whenever new art drops to keep the project well-documented.
