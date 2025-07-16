# Legacy vs. New Sharky Game – Feature Parity Checklist

This document captures every major file/module, gameplay mechanic, visual/audio element, and UX feature found in the **original (legacy)** codebase (`/js`, `/models`, `/levels`) and maps its implementation status in the **new modular TypeScript-ready rewrite** (`/src`).  
Use it to track outstanding work and verify that no original behaviour is lost during the migration.

Legend
- ✅ Implemented and working in new game
- 🟡 Partially implemented – behaviour/UI/API differs or needs polish
- 🔲 Not yet migrated / missing entirely

| Domain | Legacy Component(s) | Description (legacy behaviour) | New Equivalent | Status |
|--------|---------------------|---------------------------------|----------------|--------|
| **Core Engine** | `game.js`, `world.class.js`, `movable-object.class.js`, `drawable-object.class.js` | Custom canvas loop, camera follow, basic inheritance hierarchy for all renderables | `Game` (RAF + delta), scene system, `Character`, `Obstacle`, etc. use composition | ✅ |
| | `level.class.js` + `levels/level1.js` | Static arrays specify enemy/collectible positions, background mappings | JSON‐like level objects + `_loadLevel` in `PlayScene` | ✅ (basic), 🟡 (schema lacks boss/poison placements) |
| **Player** | `character.class.js`, `keyboard.class.js` | Swim, gravity, jump, attack, bubble throw | `Character.js` + `InputManager` (WASD + space, bite & bubble) | ✅ |
| **Projectiles** | `throwable-object.class.js` (glass bottles) | Arced bottle throw damages enemies | ‑ | 🔲 Not started (possible replacement: bubble only) |
| **Enemies** | `puffer-fish.class.js` | Horizontal swimmer inflates on proximity | `PufferFish.js` | ✅ |
| | `jellyfish.class.js` | Vertical sine movement; contact damage | `Jellyfish.js` | ✅ |
| | `endboss.class.js` | Multi-phase boss with HP bar & poison attacks | Basic `EndBoss.js` entity + HP bar, damage, scene integration | 🟡 Placeholder (needs AI/attacks) |
| **Hazards / Obstacles** | `poison.class.js` | Timed poison clouds that hurt player | `Hazard.js` (cycle active/inactive) | ✅ |
| | `barrier.class.js` | Static coral rocks; damage on touch | `Obstacle.js` (damage = true, uses coral sprite) | ✅ |
| **Collectibles** | `coin.class.js` | Yellow coins increase score | `Coin.js` | ✅ |
| | `coin-bar.class.js` | Animated coin bar UI (fills as you collect) | HUD segmented coin bar fills smoothly | ✅ |
| **Status Bars / HUD** | `status-bar.class.js` (life), `poison-bar.class.js`, `coin-bar.class.js` | Image-based bars with fill values | HUD: hearts, bubble CD pie, coin bar, boss HP bar | 🟡 Missing poison bar |
| **Audio** | `sound-config.js`, `sound-handling.js` | Preloaded audio sprites, mute/pause | `AudioManager` + manifest, SFX triggers | ✅ (basic) 🟡 (volume/mute ui) |
| **Game States** | `gameState-handling.js` | Start-screen, game-over, victory handling | Scene system exists but no menus yet | 🟡 |
| **Background** | `background-layers.class.js` | Parallax layers (Water, Fondo2, Fondo1, Floor, Godrays) with seamless tiling, day/night blend | `BackgroundLayer.js` with correct ordering, 100 %-height scaling, asset catalogue | ✅ |
| **Settings** | (none) | ‑ | `SettingsOverlay.js` with tunables & ESC close | ✅ (overlay), 🟡 (some sliders still missing polish) |
| **Performance / Resilience** | ‑ | Loader fails if image missing | `AssetLoader` resilient + progress bar | ✅ |
| **Dev Tooling** | ‑ | none | ESLint, Prettier, Vite bundler | ✅ |
| **Animations & Frames** | Sprite sheets (idle, long idle, swim, attack, hurt) | Frame-based animations incl. long-idle Easter-egg after idle-timeout | Character/Enemy frame systems (long-idle missing) | 🟡 |
| **Camera & Viewport** | Camera in `world.class.js` follows player & clamps bounds | Basic viewport fixed at 720×480, no smoothing | 🟡 |
| **Menus & Screens** | Start, Pause, Game-over, Victory HTML overlays | Only Settings overlay exists; scene stack ready | 🔲 |
| **Background Music** | Looping track, pauses on mute / state change | `AudioManager` ready; no music asset in manifest | 🟡 |
| **Mute / Volume UI** | Speaker toggle button, keyboard `M` hotkey | Not implemented | 🔲 |
| **Touch / Mobile Controls** | On-screen D-Pad / buttons for mobile browsers | Not implemented | 🔲 |
| **Water Particles** | Continuous bubble/particle emitters in bg layers | Not implemented | 🔲 |
| **Throwables (Glass Bottles)** | Bottle arc physics, break SFX, damages enemies | Not implemented | 🔲 |
| **Physics & Movement** | Gravity, buoyancy, drag, knock-back | Basic horizontal swim + buoyancy; no drag/knock-back | 🟡 |
| **Controls / Hotkeys** | Keyboard: ←→↑↓ Swim, SPACE bubble, D bite, M mute, P pause | WASD+Space+bite implemented; no hotkeys for mute/pause | 🟡 |
| **Visual Feedback** | Character flicker on damage, screen-shake on explosions, hit SFX | Invulnerability flicker done; no screen-shake | 🟡 |
| **Particle / FX** | Water bubbles trail, splash on land, coin sparkle | None | 🔲 |
| **Localization / Text** | In-game text in DE/EN ("Sammele Münzen") | Only English UI strings hard-coded | 🔲 |
| **Save / Highscore** | LocalStorage highscore save after win | Not implemented | 🔲 |
| **Credits / End Screen** | Scrolling credits with dev names | Not implemented | 🔲 |
| **Boss Intro Cutscene** | Endboss swim-in cinematic & on-screen text | Not implemented | 🔲 |
| **Boss Music Switch** | Switches to intense theme when boss spawns | `AudioManager` ready; trigger logic missing | 🔲 |
| **Coin Bar Fill Logic** | Bar fills 0→100 % in 5 segments; implemented smooth segmented bar in HUD | ✅ |

## TODO Summary
1. **Boss fight** – flesh out `EndBoss.js` (state machine, attack patterns, intro cutscene).  
2. **Throwable bottles** – decide to keep or replace; implement projectile arc + collision.
3. ~~Graphical coin bar – match original fill‐bar animation in HUD~~ ✅
4. **Poison bar** – if boss/poison gauge is required, add to HUD.
5. **Game states / UI screens** – title, pause, victory, game-over using scene stack.
6. **Audio controls** – mute toggle, volume slider in SettingsOverlay.
7. **Level schema** – extend to support boss, poison pool, additional backgrounds.
8. **QA / polish** – sprite sizes, hitboxes vs. originals, sound timings, animation parity.
9. **Long-Idle Animation** – implement Easter-egg idle sequence frames.
10. **Camera smoothing / clamp** – replicate legacy follow logic.
11. **Screen-shake FX** – minor shake on boss stomp / explosions.
12. **Water particles / bubbles trail** – background particle emitter.
13. **Highscore storage** – persist score to localStorage.
14. **Mute / Pause Hotkeys** – implement `M`, `P` shortcuts.
15. **Touch UI** – virtual joystick & buttons for mobile.
16. **Localization** – move strings to JSON and add German translations.
17. **Credits & End Screen** – scrolling credits after victory.
18. **Boss intro cutscene** – implement boss cinematic spawn sequence.
19. **Boss music switch** – trigger battle theme when boss appears.
~~20. **Coin bar fill logic** – animate graphical bar fill in HUD~~ ✅


_Please tick items as they’re completed to keep migration transparent._
