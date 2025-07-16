/**
 * Entry point for the modernized Sharky game with complete scene management.
 *
 * IMPROVEMENTS:
 * - Integrated scene system with title screen
 * - Enhanced error handling
 * - Performance optimization
 * - Better asset loading with fallbacks
 * - Improved mobile support detection
 * - Debug mode integration
 */

import { AssetLoader } from './utils/AssetLoader.js';
import { Game } from './game/Game.js';
import { InputManager } from './managers/InputManager.js';
import { AudioManager } from './managers/AudioManager.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameConfig } from './config/GameConfig.js';

/** @type {import('./utils/AssetLoader.js').AssetManifest} */
const manifest = {
    images: {
        // Core game assets
        logo: 'img/favicon/shark-color-icon.svg',

        // Character animations
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

        // Bubble attack
        bubble: 'img/1.Sharkie/4.Attack/Bubble trap/Bubble.png',
        shark_bubble1: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/1.png',
        shark_bubble2: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/2.png',
        shark_bubble3: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/3.png',
        shark_bubble4: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/4.png',
        shark_bubble5: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/5.png',
        shark_bubble6: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/6.png',
        shark_bubble7: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/7.png',
        shark_bubble8: 'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/8.png',

        // Enemies
        puffer_swim1: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png',
        puffer_swim2: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim2.png',
        puffer_swim3: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim3.png',
        puffer_swim4: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim4.png',
        puffer_swim5: 'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim5.png',

        // Collectibles
        coin: 'img/4.Markers/1. Coins/1.png',

        // Backgrounds (all layers)
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

        // Obstacles and hazards (placeholder - could be expanded)
        coral_danger: 'img/3.Background/Barrier/1.png',
        stone: 'img/3.Background/Barrier/2.png',
        poison_cloud: 'img/3.Background/Barrier/3.png',

        // Jellyfish (placeholder)
        jellyfish: 'img/2.Enemy/2.Jelly_fish/Regular damage/Lila 1.png',
    },

    sounds: {
        // Core game sounds
        bubble_shoot: 'audio/bubble_attack_sound.mp3',
        bubble_pop: 'audio/bubble_impact_sound.mp3',
        puffer_inflate: 'audio/big_splash_sound.mp3',
        coin_pickup: 'audio/coin_pickup_sound.mp3',

        // UI sounds (placeholder - would need actual files)
        menu_navigate: 'audio/bottle_sound.mp3', // fallback
        menu_select: 'audio/swim_sound.mp3', // fallback

        // Game state sounds
        win_sound: 'audio/win_sound.mp3',
        lose_sound: 'audio/death_sound.mp3',

        // Music (placeholder - would need actual files)
        title_music: 'audio/game_music.mp3',
        level_music: 'audio/game_music.mp3',
        boss_music: 'audio/boss_battle_music.mp3',
        victory_music: 'audio/win_sound.mp3',
        defeat_music: 'audio/death_sound.mp3',

        // Boss sounds (placeholder)
        boss_attack: 'audio/orca_bite.mp3',
        boss_hurt: 'audio/character_got_hit.mp3',
        boss_death: 'audio/death_sound.mp3',

        // Player sounds (placeholder)
        player_hurt: 'audio/character_got_hit.mp3',
        enemy_death: 'audio/death_sound.mp3',
    },
};

// Global game instance
let game = null;
// Prevent double initialization when multiple listeners or user actions call startGame()
let gameInitialized = false; // guards initializeGame()

// Loading UI elements
const loadingElements = {
    progressBar: null,
    loadingText: null,
    errorDisplay: null,
};

/**
 * Initialize loading UI
 */
function initializeLoadingUI() {
    // Create loading container
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-container';
    loadingContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        color: white;
    `;

    // Create logo
    const logo = document.createElement('div');
    logo.innerHTML = '🦈';
    logo.style.cssText = `
        font-size: 4rem;
        margin-bottom: 2rem;
        animation: pulse 2s ease-in-out infinite;
    `;

    // Create title
    const title = document.createElement('h1');
    title.textContent = 'SHARKY';
    title.style.cssText = `
        font-size: 3rem;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;

    // Create loading text
    loadingElements.loadingText = document.createElement('div');
    loadingElements.loadingText.textContent = 'Loading...';
    loadingElements.loadingText.style.cssText = `
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.8;
    `;

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        width: 400px;
        height: 8px;
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1rem;
    `;

    loadingElements.progressBar = document.createElement('div');
    loadingElements.progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #45a049);
        transition: width 0.3s ease;
    `;

    progressContainer.appendChild(loadingElements.progressBar);

    // Create error display
    loadingElements.errorDisplay = document.createElement('div');
    loadingElements.errorDisplay.style.cssText = `
        color: #ff6b6b;
        font-size: 1rem;
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(255,107,107,0.1);
        border-radius: 4px;
        border: 1px solid rgba(255,107,107,0.3);
        display: none;
        max-width: 400px;
        text-align: center;
    `;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Assemble loading UI
    loadingContainer.appendChild(logo);
    loadingContainer.appendChild(title);
    loadingContainer.appendChild(loadingElements.loadingText);
    loadingContainer.appendChild(progressContainer);
    loadingContainer.appendChild(loadingElements.errorDisplay);

    document.body.appendChild(loadingContainer);
}

/**
 * Update loading progress
 * @param {number} progress Progress percentage (0-100)
 * @param {string} message Loading message
 */
function updateLoadingProgress(progress, message = 'Loading...') {
    if (loadingElements.progressBar) {
        loadingElements.progressBar.style.width = `${progress}%`;
    }
    if (loadingElements.loadingText) {
        loadingElements.loadingText.textContent = message;
    }
}

/**
 * Show loading error
 * @param {string} message Error message
 */
function showLoadingError(message) {
    if (loadingElements.errorDisplay) {
        loadingElements.errorDisplay.textContent = message;
        loadingElements.errorDisplay.style.display = 'block';
    }
    if (loadingElements.loadingText) {
        loadingElements.loadingText.textContent = 'Loading failed';
    }
}

/**
 * Hide loading UI
 */
function hideLoadingUI() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.opacity = '0';
        loadingContainer.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingContainer.remove();
        }, 500);
    }
}

/**
 * Detect mobile device
 * @returns {boolean} True if mobile
 */
function isMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
    );
}

/**
 * Setup mobile controls
 */
function setupMobileControls() {
    if (isMobileDevice()) {
        const mobilePanel = document.querySelector('.mobilePanel');
        if (mobilePanel) {
            mobilePanel.style.display = 'flex';
            console.log('[Main] Mobile controls enabled');
        }
    }
}

/**
 * Initialize global error handling
 */
function initializeErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('[Main] Global error:', event.error);
        showLoadingError('An error occurred while loading the game');
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[Main] Unhandled promise rejection:', event.reason);
        showLoadingError('Failed to load game resources');
    });
}

/**
 * Main initialization function
 */
async function initializeGame() {
    if (gameInitialized) {
        console.warn('[Main] initializeGame() has already been invoked, ignoring subsequent call');
        return;
    }
    gameInitialized = true;
    try {
        console.log('[Main] Starting Sharky game initialization...');

        // Initialize error handling
        initializeErrorHandling();

        // Initialize loading UI
        initializeLoadingUI();

        // Check for required features
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('Web Audio API is not supported in this browser');
        }

        updateLoadingProgress(10, 'Initializing systems...');

        // Create core managers
        const input = new InputManager();
        const audio = new AudioManager();

        updateLoadingProgress(20, 'Loading assets...');

        // Load all assets
        const loader = new AssetLoader(manifest);
        const assets = await loader.loadAll((progress) => {
            updateLoadingProgress(20 + progress * 0.6, `Loading assets... ${progress}%`);
        });

        updateLoadingProgress(80, 'Initializing game...');

        // Create game instance
        game = new Game({
            canvasId: 'canvas',
            assets,
            input,
            audio,
        });

        updateLoadingProgress(90, 'Setting up scenes...');

        // Create and set initial scene
        const titleScene = new TitleScene({
            game,
            input,
            audio,
            assets,
        });

        await game.setInitialScene(titleScene);

        updateLoadingProgress(95, 'Finalizing...');

        // Setup mobile controls
        setupMobileControls();

        // Hide main menu and show canvas
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.style.display = 'none';
        }

        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.style.display = 'block';
        }

        updateLoadingProgress(100, 'Ready!');

        // Start the game
        game.start();

        // Hide loading UI
        setTimeout(() => {
            hideLoadingUI();
        }, 500);

        console.log('[Main] Game initialization complete');
    } catch (error) {
        console.error('[Main] Failed to initialize game:', error);
        showLoadingError(error.message || 'Failed to initialize game');
    }
}

/**
 * Legacy support for HTML start button
 */
window.startGame = function () {
    console.log('[Main] Legacy startGame() called - game should already be running');

    // If game hasn't started yet, try to initialize
    if (!game) {
        initializeGame();
    }
};

/**
 * Expose game instance for debugging
 */
window.game = game;

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (game && game.isRunning) {
        if (document.hidden) {
            // Page is hidden, pause game
            if (!game.isPaused) {
                game.togglePause();
            }
            console.log('[Main] Game paused due to page visibility change');
        } else {
            // Page is visible, resume game
            if (game.isPaused) {
                game.togglePause();
            }
            console.log('[Main] Game resumed due to page visibility change');
        }
    }
});

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', () => {
    if (game) {
        game.destroy();
    }
});

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM loaded, initializing game...');
    initializeGame();
});

// Also support direct script loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
