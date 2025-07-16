/**
 * @file Core Game class with integrated scene management and enhanced features.
 * 
 * IMPROVEMENTS:
 * - Integrated SceneManager for proper game states
 * - Enhanced audio system integration
 * - Particle system integration
 * - Performance monitoring
 * - Better error handling and cleanup
 * - Settings overlay integration
 * - Pause functionality
 */

import { SettingsOverlay } from '../ui/SettingsOverlay.js';
import { SceneManager } from '../managers/SceneManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets} LoadedAssets
 * @typedef {import('../managers/InputManager.js').InputManager} InputManager
 * @typedef {import('../managers/AudioManager.js').AudioManager} AudioManager
 */

/**
 * Enhanced Game class with scene management and performance optimization
 */
export class Game {
    /**
     * @param {{ canvasId: string; assets: LoadedAssets; input: InputManager; audio: AudioManager }} options
     */
    constructor({ canvasId, assets, input, audio }) {
        /** @private */
        this._canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasId));
        if (!this._canvas) throw new Error(`Canvas with id "${canvasId}" not found.`);

        /** @private */
        this._ctx = /** @type {CanvasRenderingContext2D} */ (this._canvas.getContext('2d'));

        /** @private */
        this._assets = assets;

        /** @private */
        this._input = input;
        /** @private */
        this._audio = audio;

        // Game loop timing
        /** @private */
        this._lastTime = 0;
        /** @private */
        this._rafId = 0;
        /** @private */
        this._running = false;

        // Scene management
        /** @private */
        this._sceneManager = new SceneManager(this);

        // Global particle system
        /** @private */
        this._particleSystem = new ParticleSystem(GameConfig.performance.maxEntities.particles);

        // Settings overlay
        /** @private */
        this._overlay = new SettingsOverlay();
        this._overlay.loadPersisted();

        // Game state
        /** @private */
        this._paused = false;
        /** @private */
        this._gameStats = {
            score: 0,
            time: 0,
            coins: 0,
            enemies: 0,
            startTime: 0
        };

        // Performance monitoring
        /** @private */
        this._performanceStats = {
            fps: 60,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            lastFrameTime: 0
        };

        // Debug mode
        /** @private */
        this._debugMode = GameConfig.debug.showPerformanceStats;

        // Initialize canvas
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());

        // Setup input handlers
        this._setupInputHandlers();

        // Error handling
        this._setupErrorHandling();

        console.log('[Game] Game initialized with scene management');
    }

    /**
     * Start the main game loop
     */
    start() {
        if (this._running) {
            console.warn('[Game] Game is already running');
            return;
        }

        this._running = true;
        this._gameStats.startTime = Date.now();
        
        // Ensure canvas is properly sized
        this._resizeCanvas();

        // Start game loop
        this._lastTime = performance.now();
        this._performanceStats.lastFrameTime = this._lastTime;
        
        const gameLoop = (currentTime) => {
            if (!this._running) return;

            // Calculate delta time
            const deltaTime = Math.min((currentTime - this._lastTime) / 1000, 0.1); // Cap at 100ms
            this._lastTime = currentTime;

            // Update performance stats
            this._updatePerformanceStats(currentTime, deltaTime);

            // Update game
            const updateStartTime = performance.now();
            this._update(deltaTime);
            this._performanceStats.updateTime = performance.now() - updateStartTime;

            // Render game
            const renderStartTime = performance.now();
            this._render();
            this._performanceStats.renderTime = performance.now() - renderStartTime;

            // Continue loop
            this._rafId = requestAnimationFrame(gameLoop);
        };

        this._rafId = requestAnimationFrame(gameLoop);
        console.log('[Game] Game loop started');
    }

    /**
     * Stop the game loop
     */
    stop() {
        if (!this._running) {
            console.warn('[Game] Game is not running');
            return;
        }

        this._running = false;
        cancelAnimationFrame(this._rafId);
        console.log('[Game] Game loop stopped');
    }

    /**
     * Pause/unpause the game
     */
    togglePause() {
        this._paused = !this._paused;
        
        if (this._paused) {
            this._overlay.show();
        } else {
            this._overlay.hide();
        }
        
        console.log(`[Game] Game ${this._paused ? 'paused' : 'resumed'}`);
    }

    /**
     * Set the initial scene
     * @param {Object} scene Scene instance
     */
    async setInitialScene(scene) {
        await this._sceneManager.pushScene(scene, { transition: 'instant' });
    }

    /**
     * Get current scene
     * @returns {Object|null} Current scene
     */
    getCurrentScene() {
        return this._sceneManager.getCurrentScene();
    }

    /**
     * Get game statistics
     * @returns {Object} Current game stats
     */
    getGameStats() {
        // Update time
        this._gameStats.time = (Date.now() - this._gameStats.startTime) / 1000;
        return { ...this._gameStats };
    }

    /**
     * Add to score
     * @param {number} points Points to add
     */
    addScore(points) {
        this._gameStats.score += points;
    }

    /**
     * Add coin collected
     * @param {number} coins Coins to add
     */
    addCoins(coins = 1) {
        this._gameStats.coins += coins;
    }

    /**
     * Add enemy defeated
     * @param {number} enemies Enemies to add
     */
    addEnemies(enemies = 1) {
        this._gameStats.enemies += enemies;
    }

    /**
     * Reset game statistics
     */
    resetGameStats() {
        this._gameStats = {
            score: 0,
            time: 0,
            coins: 0,
            enemies: 0,
            startTime: Date.now()
        };
        console.log('[Game] Game statistics reset');
    }

    /**
     * Clean up game resources
     */
    destroy() {
        // Stop game loop
        this.stop();

        // Clean up scene manager
        this._sceneManager.destroy();

        // Clean up particle system
        this._particleSystem.clear();

        // Clean up audio
        this._audio.destroy();

        // Clean up settings overlay
        this._overlay.hide();

        // Remove event listeners
        window.removeEventListener('resize', this._resizeCanvas);
        window.removeEventListener('error', this._handleError);
        window.removeEventListener('unhandledrejection', this._handleUnhandledRejection);

        console.log('[Game] Game destroyed');
    }

    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================

    /**
     * Main update loop
     * @param {number} dt Delta time in seconds
     * @private
     */
    _update(dt) {
        if (this._paused) return;

        // Update audio manager
        this._audio.update(dt);

        // Update global particle system
        this._particleSystem.update(dt);

        // Update scene manager
        this._sceneManager.update(dt);

        // Update game stats
        this._gameStats.time = (Date.now() - this._gameStats.startTime) / 1000;
    }

    /**
     * Main render loop
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _render() {
        // Clear canvas
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Render scene manager
        this._sceneManager.render(this._ctx);

        // Render global particle system
        this._particleSystem.render(this._ctx);

        // Render debug info
        if (this._debugMode) {
            this._renderDebugInfo(this._ctx);
        }

        // Render pause overlay
        if (this._paused) {
            this._renderPauseOverlay(this._ctx);
        }
    }

    /**
     * Setup input handlers
     * @private
     */
    _setupInputHandlers() {
        // Pause/Settings toggle
        this._input.onAction('pause', (pressed) => {
            if (pressed) {
                this.togglePause();
            }
        });

        // Debug toggle (F3)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                this._debugMode = !this._debugMode;
                console.log(`[Game] Debug mode ${this._debugMode ? 'enabled' : 'disabled'}`);
            }
        });
    }

    /**
     * Setup error handling
     * @private
     */
    _setupErrorHandling() {
        this._handleError = (error) => {
            console.error('[Game] Runtime error:', error);
            // Could show error screen or gracefully handle
        };

        this._handleUnhandledRejection = (event) => {
            console.error('[Game] Unhandled promise rejection:', event.reason);
            // Could show error screen or gracefully handle
        };

        window.addEventListener('error', this._handleError);
        window.addEventListener('unhandledrejection', this._handleUnhandledRejection);
    }

    /**
     * Update performance statistics
     * @param {number} currentTime Current time
     * @param {number} deltaTime Delta time
     * @private
     */
    _updatePerformanceStats(currentTime, deltaTime) {
        // Calculate FPS
        this._performanceStats.frameTime = currentTime - this._performanceStats.lastFrameTime;
        this._performanceStats.fps = 1000 / this._performanceStats.frameTime;
        this._performanceStats.lastFrameTime = currentTime;

        // Log performance warnings
        if (this._performanceStats.fps < 30) {
            console.warn(`[Game] Low FPS detected: ${this._performanceStats.fps.toFixed(1)}`);
        }

        if (deltaTime > 0.05) { // 50ms
            console.warn(`[Game] High frame time detected: ${(deltaTime * 1000).toFixed(1)}ms`);
        }
    }

    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderDebugInfo(ctx) {
        ctx.save();
        
        // Debug background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 120);

        // Debug text
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const debugInfo = [
            `FPS: ${this._performanceStats.fps.toFixed(1)}`,
            `Frame: ${this._performanceStats.frameTime.toFixed(1)}ms`,
            `Update: ${this._performanceStats.updateTime.toFixed(1)}ms`,
            `Render: ${this._performanceStats.renderTime.toFixed(1)}ms`,
            `Particles: ${this._particleSystem.activeParticleCount}`,
            `Scenes: ${this._sceneManager.getSceneCount()}`,
            `Memory: ${this._getMemoryUsage()}MB`,
            `Audio: ${this._audio.isMuted ? 'Muted' : 'Active'}`
        ];

        debugInfo.forEach((info, index) => {
            ctx.fillText(info, 15, 20 + index * 14);
        });

        ctx.restore();
    }

    /**
     * Render pause overlay
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderPauseOverlay(ctx) {
        ctx.save();
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Pause text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Instructions
        ctx.font = '24px Arial';
        ctx.fillText('Press ESC to resume', ctx.canvas.width / 2, ctx.canvas.height / 2 + 60);

        ctx.restore();
    }

    /**
     * Get memory usage estimate
     * @returns {string} Memory usage in MB
     * @private
     */
    _getMemoryUsage() {
        if (performance.memory) {
            return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        }
        return 'N/A';
    }

    /**
     * Resize canvas to match CSS size with device pixel ratio
     * @private
     */
    _resizeCanvas() {
        let { clientWidth, clientHeight } = this._canvas;
        
        // Fallback if canvas is not styled yet
        if (clientWidth === 0 || clientHeight === 0) {
            clientWidth = parseInt(this._canvas.getAttribute('width') || '720', 10);
            clientHeight = parseInt(this._canvas.getAttribute('height') || '480', 10);
            
            // Set CSS size
            this._canvas.style.width = clientWidth + 'px';
            this._canvas.style.height = clientHeight + 'px';
        }

        const ratio = window.devicePixelRatio || 1;
        this._canvas.width = clientWidth * ratio;
        this._canvas.height = clientHeight * ratio;
        this._ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        // Update canvas size in GameConfig for other systems
        GameConfig.canvas = {
            width: clientWidth,
            height: clientHeight,
            ratio: ratio
        };
    }

    // =============================================================================
    // GETTERS FOR EXTERNAL ACCESS
    // =============================================================================

    /**
     * Get canvas element
     * @returns {HTMLCanvasElement} Canvas element
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * Get canvas context
     * @returns {CanvasRenderingContext2D} Canvas context
     */
    get context() {
        return this._ctx;
    }

    /**
     * Get scene manager
     * @returns {SceneManager} Scene manager
     */
    get sceneManager() {
        return this._sceneManager;
    }

    /**
     * Get particle system
     * @returns {ParticleSystem} Particle system
     */
    get particleSystem() {
        return this._particleSystem;
    }

    /**
     * Get audio manager
     * @returns {AudioManager} Audio manager
     */
    get audio() {
        return this._audio;
    }

    /**
     * Get input manager
     * @returns {InputManager} Input manager
     */
    get input() {
        return this._input;
    }

    /**
     * Get assets
     * @returns {LoadedAssets} Loaded assets
     */
    get assets() {
        return this._assets;
    }

    /**
     * Check if game is running
     * @returns {boolean} True if running
     */
    get isRunning() {
        return this._running;
    }

    /**
     * Check if game is paused
     * @returns {boolean} True if paused
     */
    get isPaused() {
        return this._paused;
    }

    /**
     * Get performance stats
     * @returns {Object} Performance statistics
     */
    get performanceStats() {
        return { ...this._performanceStats };
    }
}