# Project File Structure

This document lists **all files** in the project, _excluding_ the following top-level directories which contain old or generated assets:

* `node_modules/`
* `js/`
* `levels/`
* `models/`

The paths are relative to the project root (`d:\DevDrive\Projects\Sharky`).

---

## Root files & directories

```
.eslintrc.json
.gitignore
.prettierrc
index.html
package.json
package-lock.json
style.css
vite.config.js
```

Directories detailed below:

* `audio/`
* `docs/`
* `img/`
* `src/`

---

## audio/

```
audio/big_splash_sound.mp3
audio/boss_battle_music.mp3
audio/bottle_sound.mp3
audio/bubble_attack_sound.mp3
audio/bubble_impact_sound.mp3
audio/character_got_hit.mp3
audio/coin_pickup_sound.mp3
audio/death_sound.mp3
audio/game_music.mp3
audio/orca_bite.mp3
audio/swim_sound.mp3
audio/win_sound.mp3
```

---

## docs/

```
docs/assets_overview_all.md
docs/legacy_comparison_checklist.md
docs/FileStructure.md   ← (this file)
```

---

## img/

```
img/0.Editables/BOTELLA.ai
img/0.Editables/Dead Poisoned.aep
img/0.Editables/Dead Poisoned.ai
img/0.Editables/Fondo.ai
img/0.Editables/IDLE.aep
img/0.Editables/Jelly fish.ai
img/0.Editables/Marcadores.ai
img/0.Editables/Moneda.ai
img/0.Editables/PEZ GLOBO.ai
img/0.Editables/Posión.aep
img/0.Editables/Principal.ai
img/0.Editables/Whale.ai
img/0.Editables/attack Bubble Trap.aep
img/0.Editables/attack Fin Slap.aep
img/0.Editables/attack bubble trap.ai
img/0.Editables/whale.aep
img/1.Sharkie/1.IDLE/1.png
img/1.Sharkie/1.IDLE/10.png
img/1.Sharkie/1.IDLE/11.png
img/1.Sharkie/1.IDLE/12.png
img/1.Sharkie/1.IDLE/13.png
img/1.Sharkie/1.IDLE/14.png
img/1.Sharkie/1.IDLE/15.png
img/1.Sharkie/1.IDLE/16.png
img/1.Sharkie/1.IDLE/17.png
img/1.Sharkie/1.IDLE/18.png
img/1.Sharkie/1.IDLE/2.png
img/1.Sharkie/1.IDLE/3.png
img/1.Sharkie/1.IDLE/4.png
img/1.Sharkie/1.IDLE/5.png
img/1.Sharkie/1.IDLE/6.png
img/1.Sharkie/1.IDLE/7.png
img/1.Sharkie/1.IDLE/8.png
img/1.Sharkie/1.IDLE/9.png
img/1.Sharkie/1.IDLE/Prewiew.gif
img/1.Sharkie/2.Long_IDLE/I10.png
img/1.Sharkie/2.Long_IDLE/I11.png
img/1.Sharkie/2.Long_IDLE/I12.png
img/1.Sharkie/2.Long_IDLE/I13.png
img/1.Sharkie/2.Long_IDLE/I14.png
img/1.Sharkie/2.Long_IDLE/I2.png
img/1.Sharkie/2.Long_IDLE/I3.png
img/1.Sharkie/2.Long_IDLE/I4.png
img/1.Sharkie/2.Long_IDLE/I5.png
img/1.Sharkie/2.Long_IDLE/I6.png
img/1.Sharkie/2.Long_IDLE/I7.png
img/1.Sharkie/2.Long_IDLE/I8.png
img/1.Sharkie/2.Long_IDLE/I9.png
img/1.Sharkie/2.Long_IDLE/Preview.gif
img/1.Sharkie/2.Long_IDLE/i1.png
img/1.Sharkie/2.Long_IDLE/i10.png
img/1.Sharkie/2.Long_IDLE/i11.png
img/1.Sharkie/2.Long_IDLE/i12.png
img/1.Sharkie/2.Long_IDLE/i13.png
img/1.Sharkie/2.Long_IDLE/i14.png
img/1.Sharkie/2.Long_IDLE/i2.png
img/1.Sharkie/2.Long_IDLE/i3.png
img/1.Sharkie/2.Long_IDLE/i4.png
img/1.Sharkie/2.Long_IDLE/i5.png
img/1.Sharkie/2.Long_IDLE/i6.png
img/1.Sharkie/2.Long_IDLE/i7.png
img/1.Sharkie/2.Long_IDLE/i8.png
img/1.Sharkie/2.Long_IDLE/i9.png
… (additional image assets omitted for brevity)
```

> **Note:** The `img/` directory contains over 100 art assets. For readability, only the first portion is shown here. All remaining files follow the same relative-path format and are present in the repository.

---

## src/

```
src/config/GameConfig.js
src/effects/ParticleSystem.js
src/entities/BossProjectile.js
src/entities/Bubble.js
src/entities/Character.js
src/entities/Coin.js
src/entities/EndBoss.js
src/entities/Hazard.js
src/entities/Jellyfish.js
src/entities/Obstacle.js
src/entities/PufferFish.js
src/game/Game.js
src/levels/level1.js
src/main.js
src/managers/AudioManager.js
src/managers/InputManager.js
src/managers/SceneManager.js
src/scenes/GameOverScene.js
src/scenes/PauseScene.js
src/scenes/PlayScene.js
src/scenes/TitleScene.js
src/ui/BackgroundLayer.js
src/ui/HUD.js
src/ui/SettingsOverlay.js
src/utils/AssetLoader.js
src/utils/LevelLoader.js
```

---

*Generated automatically − 2025-07-16 20:22 CEST*
