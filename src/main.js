/**
 * Entry point for the modernised Sharky game.
 * All heavy lifting is delegated to the `Game` class; this file only loads
 * assets and boots the game once they are ready.
 */

import { AssetLoader } from './utils/AssetLoader.js';
import { Game } from './game/Game.js';
import { InputManager } from './managers/InputManager.js';
import { AudioManager } from './managers/AudioManager.js';
import { PlayScene } from './scenes/PlayScene.js';
import { loadLevel } from './utils/LevelLoader.js';

/** @type {import('./utils/AssetLoader.js').AssetManifest} */
const manifest = {
    images: {
        // TODO: list essential images used by the loading screen & early UI.
        // The rest can be lazy-loaded later.
        // placeholder image for manifest demo; can be changed to custom loading bar asset
        logo: 'img/favicon/shark-color-icon.svg',
        shark_swim1: 'img/1.Sharkie/3.Swim/1.png',
        shark_swim2: 'img/1.Sharkie/3.Swim/2.png',
        shark_swim3: 'img/1.Sharkie/3.Swim/3.png',
        shark_swim4: 'img/1.Sharkie/3.Swim/4.png',
        shark_swim5: 'img/1.Sharkie/3.Swim/5.png',
        shark_swim6: 'img/1.Sharkie/3.Swim/6.png',
        shark_idle1: 'img/1.Sharkie/1.IDLE/1.png',
        shark_idle2: 'img/1.Sharkie/1.IDLE/2.png',
        shark_idle3: 'img/1.Sharkie/1.IDLE/3.png',
        shark_idle4: 'img/1.Sharkie/1.IDLE/4.png',
        shark_idle5: 'img/1.Sharkie/1.IDLE/5.png',
        shark_idle6: 'img/1.Sharkie/1.IDLE/6.png',
        shark_attack1: 'img/1.Sharkie/4.Attack/Fin slap/1.png',
        shark_attack2: 'img/1.Sharkie/4.Attack/Fin slap/2.png',
        shark_attack3: 'img/1.Sharkie/4.Attack/Fin slap/3.png',
        shark_attack4: 'img/1.Sharkie/4.Attack/Fin slap/4.png',
        shark_attack5: 'img/1.Sharkie/4.Attack/Fin slap/5.png',
        shark_attack6: 'img/1.Sharkie/4.Attack/Fin slap/6.png',
        shark_attack7: 'img/1.Sharkie/4.Attack/Fin slap/7.png',
        shark_attack8: 'img/1.Sharkie/4.Attack/Fin slap/8.png',
        bubble: 'img/1.Sharkie/4.Attack/Bubble trap/Bubble.png',
        shark_bubble1: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/1.png',
        shark_bubble2: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/2.png',
        shark_bubble3: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/3.png',
        shark_bubble4: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/4.png',
        shark_bubble5: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/5.png',
        shark_bubble6: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/6.png',
        shark_bubble7: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/7.png',
        shark_bubble8: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/8.png',
        puffer_swim1: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png',
        puffer_swim2: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim2.png',
        puffer_swim3: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim3.png',
        puffer_swim4: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim4.png',
        puffer_swim5: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim5.png',

        // Coin collectible
        coin: 'img/4.Markers/1. Coins/1.png',

        // Parallax backgrounds
        bg_godrays: 'img/3.Background/Layers/1. Godrays/1.png',
        bg_far: 'img/3.Background/Layers/4.Fondo 2/L.png',
        bg_mid: 'img/3.Background/Layers/3.Fondo 1/L.png',
        bg_near: 'img/3.Background/Layers/2. Floor/L.png',
        bg_water: 'img/3.Background/Layers/5. Water/L.png',

        // Night variants
        bg_far_dark: 'img/3.Background/Layers/4.Fondo 2/D.png',
        bg_mid_dark: 'img/3.Background/Layers/3.Fondo 1/D.png',
        bg_near_dark: 'img/3.Background/Layers/2. Floor/D.png',
        bg_water_dark: 'img/3.Background/Layers/5. Water/D.png',
    },
    sounds: {
        bubble_shoot: 'audio/bubble_attack_sound.mp3', // bubble shoot SFX
        bubble_pop: 'audio/bubble_impact_sound.mp3', // bubble pop SFX
        puffer_inflate: 'audio/big_splash_sound.mp3', // puffer fish inflate SFX
        coin_pickup: 'audio/coin_pickup_sound.mp3', // coin pickup SFX
        win_sound: 'audio/win_sound.mp3', // level completion SFX
    },
};

// Simple DOM loading bar element (optional)
const progressBar = document.createElement('progress');
progressBar.max = 100;
progressBar.value = 0;
progressBar.style.position = 'absolute';
progressBar.style.top = '50%';
progressBar.style.left = '50%';
progressBar.style.transform = 'translate(-50%, -50%)';
progressBar.style.zIndex = '9999';
document.body.appendChild(progressBar);

(async () => {
    const loader = new AssetLoader(manifest);
    const assets = await loader.loadAll((p) => {
        progressBar.value = p;
    });

    // Assets loaded – remove loading bar and start game.
    progressBar.remove();

    // Instantiate shared managers
    const input = new InputManager();
    const audio = new AudioManager();

    const levelData = await loadLevel('level1');

    const game = new Game({
        canvasId: 'canvas',
        assets,
        input,
        audio,
    });

    // Create first scene (placeholder)
    const playScene = new PlayScene({ game, input, audio, assets, levelData });
    game.setScene(playScene);

    // Expose global startGame for existing HTML button until UI is refactored
    window.startGame = () => {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';
        game.start();
    };
})();
