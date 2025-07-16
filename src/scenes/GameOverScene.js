/**
 * @file Game Over and Victory scene with statistics and options.
 * 
 * FEATURES:
 * - Handles both game over and victory states
 * - Shows game statistics (score, time, coins collected)
 * - Restart and main menu options
 * - Animated background and effects
 * - High score tracking
 * - Social sharing options (future)
 */

import { Scene, SceneTransitions } from '../managers/SceneManager.js';
import { TitleScene } from './TitleScene.js';
import { PlayScene } from './PlayScene.js';
import { GameConfig } from '../config/GameConfig.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { loadLevel } from '../utils/LevelLoader.js';

/**
 * Game Over scene handles both defeat and victory
 */
export class GameOverScene extends Scene {
    /**
     * Initialize game over scene
     * @param {Object} options Scene options
     * @param {import('../game/Game.js').Game} options.game Game instance
     * @param {import('../managers/InputManager.js').InputManager} options.input Input manager
     * @param {import('../managers/AudioManager.js').AudioManager} options.audio Audio manager
     * @param {import('../utils/AssetLoader.js').LoadedAssets} options.assets Loaded assets
     * @param {Object} options.gameStats Game statistics
     * @param {boolean} options.victory Whether this is a victory or defeat
     */
    constructor({ game, input, audio, assets, gameStats, victory = false }) {
        super();
        
        this._game = game;
        this._input = input;
        this._audio = audio;
        this._assets = assets;
        this._gameStats = gameStats;
        this._victory = victory;
        
        // Menu state
        this._menuItems = [
            { id: 'restart', text: 'Try Again', action: () => this._restartGame() },
            { id: 'menu', text: 'Main Menu', action: () => this._returnToMenu() }
        ];
        
        this._selectedIndex = 0;
        this._animTime = 0;
        this._showStats = false;
        this._statsAnimDelay = 1.5; // seconds
        
        // Visual effects
        this._particleSystem = new ParticleSystem(300);
        this._textAnimations = new Map();
        
        // High score handling
        this._isNewHighScore = false;
        this._highScore = this._loadHighScore();
        
        // Input handling
        this._inputHandlers = new Map();
        
        // Background animation
        this._bgOffset = 0;
        this._pulseIntensity = 0;
        
        console.log(`[GameOverScene] Created ${victory ? 'victory' : 'defeat'} scene`);
    }
    
    /**
     * Scene enter lifecycle
     */
    async enter() {
        await super.enter();
        
        // Setup input handlers
        this._setupInputHandlers();
        
        // Check for new high score
        this._checkHighScore();
        
        // Start appropriate effects
        if (this._victory) {
            this._startVictoryEffects();
            this._playVictoryMusic();
        } else {
            this._startDefeatEffects();
            this._playDefeatMusic();
        }
        
        // Initialize text animations
        this._initializeTextAnimations();
        
        // Show stats after delay
        setTimeout(() => {
            this._showStats = true;
            this._animateStatsIn();
        }, this._statsAnimDelay * 1000);
        
        console.log('[GameOverScene] Game over scene entered');
    }
    
    /**
     * Scene exit lifecycle
     */
    async exit() {
        await super.exit();
        
        // Clean up input handlers
        this._inputHandlers.forEach(unsubscribe => unsubscribe());
        this._inputHandlers.clear();
        
        // Clean up particle system
        this._particleSystem.clear();
        
        console.log('[GameOverScene] Game over scene exited');
    }
    
    /**
     * Update scene
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        super.update(dt);
        
        // Update animations
        this._animTime += dt;
        this._bgOffset += dt * 20;
        
        // Update pulse effect
        this._pulseIntensity = Math.sin(this._animTime * 3) * 0.5 + 0.5;
        
        // Update text animations
        this._updateTextAnimations(dt);
        
        // Update particle system
        this._particleSystem.update(dt);
    }
    
    /**
     * Render scene
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        super.render(ctx);
        
        // Render background
        this._renderBackground(ctx);
        
        // Render particle effects
        this._particleSystem.render(ctx);
        
        // Render main message
        this._renderMainMessage(ctx);
        
        // Render statistics if ready
        if (this._showStats) {
            this._renderStatistics(ctx);
        }
        
        // Render menu
        this._renderMenu(ctx);
        
        // Render high score notification
        if (this._isNewHighScore) {
            this._renderNewHighScore(ctx);
        }
        
        // Render controls hint
        this._renderControlsHint(ctx);
    }
    
    /**
     * Clean up scene
     */
    destroy() {
        super.destroy();
        
        // Clean up particle system
        this._particleSystem.clear();
        
        // Clear text animations
        this._textAnimations.clear();
        
        console.log('[GameOverScene] Game over scene destroyed');
    }
    
    // =============================================================================
    // INITIALIZATION METHODS
    // =============================================================================
    
    /**
     * Setup input handlers
     * @private
     */
    _setupInputHandlers() {
        // Navigation
        this._inputHandlers.set('up', this._input.onAction('up', (pressed) => {
            if (pressed) this._navigateMenu(-1);
        }));
        
        this._inputHandlers.set('down', this._input.onAction('down', (pressed) => {
            if (pressed) this._navigateMenu(1);
        }));
        
        // Selection
        this._inputHandlers.set('attack', this._input.onAction('attack', (pressed) => {
            if (pressed) this._selectMenuItem();
        }));
        
        // Quick restart
        this._inputHandlers.set('pause', this._input.onAction('pause', (pressed) => {
            if (pressed) this._restartGame();
        }));
    }
    
    /**
     * Initialize text animations
     * @private
     */
    _initializeTextAnimations() {
        // Main message animation
        this._textAnimations.set('main', {
            scale: 0,
            targetScale: 1,
            alpha: 0,
            targetAlpha: 1,
            offsetY: 50,
            targetOffsetY: 0
        });
        
        // Stats animations
        const statKeys = ['score', 'time', 'coins', 'enemies'];
        statKeys.forEach((key, index) => {
            this._textAnimations.set(`stat_${key}`, {
                scale: 0,
                targetScale: 1,
                alpha: 0,
                targetAlpha: 1,
                offsetX: -100,
                targetOffsetX: 0,
                delay: index * 0.2
            });
        });
        
        // Menu animations
        this._menuItems.forEach((item, index) => {
            this._textAnimations.set(`menu_${item.id}`, {
                scale: 0,
                targetScale: 1,
                alpha: 0,
                targetAlpha: 1,
                offsetY: 30,
                targetOffsetY: 0,
                delay: 2.0 + index * 0.1
            });
        });
    }
    
    /**
     * Check for new high score
     * @private
     */
    _checkHighScore() {
        if (this._gameStats.score > this._highScore) {
            this._isNewHighScore = true;
            this._saveHighScore(this._gameStats.score);
            console.log(`[GameOverScene] New high score: ${this._gameStats.score}`);
        }
    }
    
    /**
     * Start victory effects
     * @private
     */
    _startVictoryEffects() {
        // Golden particle explosion
        this._particleSystem.createExplosion(
            this._game._canvas.width / 2,
            this._game._canvas.height / 2,
            '#FFD700',
            1.5
        );
        
        // Continuous celebration particles
        this._victoryEmitter = this._particleSystem.createBubbleStream(
            this._game._canvas.width / 2,
            this._game._canvas.height,
            10,
            0 // Infinite
        );
        
        // Additional sparkle effects
        setInterval(() => {
            const x = Math.random() * this._game._canvas.width;
            const y = Math.random() * this._game._canvas.height;
            this._particleSystem.createCoinSparkles(x, y);
        }, 500);
    }
    
    /**
     * Start defeat effects
     * @private
     */
    _startDefeatEffects() {
        // Dark particle effects
        this._particleSystem.createExplosion(
            this._game._canvas.width / 2,
            this._game._canvas.height / 2,
            '#666666',
            0.8
        );
        
        // Bubbles going down instead of up
        this._defeatEmitter = this._particleSystem.createBubbleStream(
            this._game._canvas.width / 2,
            -50,
            5,
            0
        );
    }
    
    /**
     * Play victory music
     * @private
     */
    _playVictoryMusic() {
        if (this._assets.sounds && this._assets.sounds.victory_music) {
            this._audio.playMusic('victory_music', false, 1.0);
        }
    }
    
    /**
     * Play defeat music
     * @private
     */
    _playDefeatMusic() {
        if (this._assets.sounds && this._assets.sounds.defeat_music) {
            this._audio.playMusic('defeat_music', false, 1.0);
        }
    }
    
    // =============================================================================
    // MENU NAVIGATION
    // =============================================================================
    
    /**
     * Navigate menu up or down
     * @param {number} direction Direction (-1 for up, 1 for down)
     * @private
     */
    _navigateMenu(direction) {
        const prevIndex = this._selectedIndex;
        this._selectedIndex = (this._selectedIndex + direction + this._menuItems.length) % this._menuItems.length;
        
        if (prevIndex !== this._selectedIndex) {
            // Play navigation sound
            if (this._assets.sounds && this._assets.sounds.menu_navigate) {
                this._audio.playSfx(this._assets.sounds.menu_navigate.src, { volume: 0.3 });
            }
        }
    }
    
    /**
     * Select current menu item
     * @private
     */
    _selectMenuItem() {
        const selectedItem = this._menuItems[this._selectedIndex];
        
        // Play selection sound
        if (this._assets.sounds && this._assets.sounds.menu_select) {
            this._audio.playSfx(this._assets.sounds.menu_select.src, { volume: 0.5 });
        }
        
        // Execute action
        selectedItem.action();
    }
    
    // =============================================================================
    // MENU ACTIONS
    // =============================================================================
    
    /**
     * Restart the game
     * @private
     */
    async _restartGame() {
        console.log('[GameOverScene] Restarting game...');
        
        try {
            // Load level data
            const levelData = await loadLevel('level1');
            
            // Create new play scene
            const playScene = new PlayScene({
                game: this._game,
                input: this._input,
                audio: this._audio,
                assets: this._assets,
                levelData
            });
            
            // Transition to game
            await this._game._sceneManager.replaceScene(playScene, SceneTransitions.FADE_NORMAL);
            
        } catch (error) {
            console.error('[GameOverScene] Error restarting game:', error);
        }
    }
    
    /**
     * Return to main menu
     * @private
     */
    async _returnToMenu() {
        console.log('[GameOverScene] Returning to main menu...');
        
        try {
            // Create title scene
            const titleScene = new TitleScene({
                game: this._game,
                input: this._input,
                audio: this._audio,
                assets: this._assets
            });
            
            // Transition to title
            await this._game._sceneManager.replaceScene(titleScene, SceneTransitions.FADE_NORMAL);
            
        } catch (error) {
            console.error('[GameOverScene] Error returning to menu:', error);
        }
    }
    
    // =============================================================================
    // ANIMATION METHODS
    // =============================================================================
    
    /**
     * Update text animations
     * @param {number} dt Delta time in seconds
     * @private
     */
    _updateTextAnimations(dt) {
        this._textAnimations.forEach((anim, key) => {
            // Handle delay
            if (anim.delay > 0) {
                anim.delay -= dt;
                return;
            }
            
            // Animate properties
            const speed = 8; // Animation speed
            
            if (anim.hasOwnProperty('scale')) {
                const scaleDiff = anim.targetScale - anim.scale;
                anim.scale += scaleDiff * dt * speed;
            }
            
            if (anim.hasOwnProperty('alpha')) {
                const alphaDiff = anim.targetAlpha - anim.alpha;
                anim.alpha += alphaDiff * dt * speed;
            }
            
            if (anim.hasOwnProperty('offsetX')) {
                const offsetDiff = anim.targetOffsetX - anim.offsetX;
                anim.offsetX += offsetDiff * dt * speed;
            }
            
            if (anim.hasOwnProperty('offsetY')) {
                const offsetDiff = anim.targetOffsetY - anim.offsetY;
                anim.offsetY += offsetDiff * dt * speed;
            }
        });
    }
    
    /**
     * Animate statistics in
     * @private
     */
    _animateStatsIn() {
        const statKeys = ['score', 'time', 'coins', 'enemies'];
        
        statKeys.forEach((key, index) => {
            const anim = this._textAnimations.get(`stat_${key}`);
            if (anim) {
                anim.delay = index * 0.2;
            }
        });
    }
    
    // =============================================================================
    // RENDER METHODS
    // =============================================================================
    
    /**
     * Render background
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBackground(ctx) {
        // Animated background color
        const baseColor = this._victory ? 
            [20, 50, 100] : // Blue for victory
            [50, 20, 20];   // Red for defeat
        
        const pulseColor = baseColor.map(c => 
            Math.floor(c + this._pulseIntensity * 30)
        );
        
        ctx.fillStyle = `rgb(${pulseColor.join(',')})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Animated patterns
        ctx.save();
        ctx.globalAlpha = 0.1;
        
        // Moving circles
        for (let i = 0; i < 5; i++) {
            const x = (this._bgOffset + i * 200) % (ctx.canvas.width + 100);
            const y = 100 + Math.sin(this._animTime + i) * 50;
            const radius = 30 + Math.sin(this._animTime * 2 + i) * 10;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this._victory ? '#FFD700' : '#666666';
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Render main message
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderMainMessage(ctx) {
        const anim = this._textAnimations.get('main');
        if (!anim) return;
        
        ctx.save();
        ctx.globalAlpha = anim.alpha;
        
        const centerX = ctx.canvas.width / 2;
        const messageY = ctx.canvas.height * 0.25;
        
        // Transform for animation
        ctx.translate(centerX, messageY + anim.offsetY);
        ctx.scale(anim.scale, anim.scale);
        
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Main message
        ctx.fillStyle = this._victory ? '#FFD700' : '#FF6B6B';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._victory ? 'VICTORY!' : 'GAME OVER', 0, 0);
        
        // Subtitle
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        const subtitle = this._victory ? 
            'Congratulations!' : 
            'Better luck next time!';
        ctx.fillText(subtitle, 0, 60);
        
        ctx.restore();
    }
    
    /**
     * Render game statistics
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderStatistics(ctx) {
        const centerX = ctx.canvas.width / 2;
        const statsY = ctx.canvas.height * 0.5;
        
        // Statistics data
        const stats = [
            { key: 'score', label: 'Score', value: this._gameStats.score.toLocaleString() },
            { key: 'time', label: 'Time', value: this._formatTime(this._gameStats.time) },
            { key: 'coins', label: 'Coins', value: this._gameStats.coins || 0 },
            { key: 'enemies', label: 'Enemies Defeated', value: this._gameStats.enemies || 0 }
        ];
        
        stats.forEach((stat, index) => {
            const anim = this._textAnimations.get(`stat_${stat.key}`);
            if (!anim || anim.delay > 0) return;
            
            ctx.save();
            ctx.globalAlpha = anim.alpha;
            
            const y = statsY + index * 40;
            
            // Transform for animation
            ctx.translate(centerX + anim.offsetX, y);
            ctx.scale(anim.scale, anim.scale);
            
            // Stat background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(-150, -15, 300, 30);
            
            // Stat label
            ctx.fillStyle = '#B0C4DE';
            ctx.font = '18px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(stat.label, -140, 0);
            
            // Stat value
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(stat.value, 140, 0);
            
            ctx.restore();
        });
    }
    
    /**
     * Render menu
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderMenu(ctx) {
        const centerX = ctx.canvas.width / 2;
        const menuY = ctx.canvas.height * 0.75;
        
        this._menuItems.forEach((item, index) => {
            const anim = this._textAnimations.get(`menu_${item.id}`);
            if (!anim || anim.delay > 0) return;
            
            ctx.save();
            ctx.globalAlpha = anim.alpha;
            
            const y = menuY + index * 50;
            const isSelected = index === this._selectedIndex;
            
            // Transform for animation
            ctx.translate(centerX, y + anim.offsetY);
            ctx.scale(anim.scale, anim.scale);
            
            // Menu item background
            if (isSelected) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(-100, -20, 200, 40);
            }
            
            // Menu item text
            ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
            ctx.font = `${isSelected ? 'bold ' : ''}24px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, 0, 0);
            
            ctx.restore();
        });
    }
    
    /**
     * Render new high score notification
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderNewHighScore(ctx) {
        ctx.save();
        
        // Pulsing effect
        const pulse = Math.sin(this._animTime * 8) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        
        // Position
        const centerX = ctx.canvas.width / 2;
        const y = ctx.canvas.height * 0.4;
        
        // Background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(centerX - 120, y - 20, 240, 40);
        
        // Text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('NEW HIGH SCORE!', centerX, y);
        
        ctx.restore();
    }
    
    /**
     * Render controls hint
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderControlsHint(ctx) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('↑↓ Navigate • SPACE/K Select • ESC Quick Restart', 
                     ctx.canvas.width / 2, ctx.canvas.height - 20);
        
        ctx.restore();
    }
    
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    /**
     * Format time in minutes:seconds
     * @param {number} seconds Time in seconds
     * @returns {string} Formatted time string
     * @private
     */
    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Load high score from localStorage
     * @returns {number} High score
     * @private
     */
    _loadHighScore() {
        try {
            const saved = localStorage.getItem('sharky_high_score');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('[GameOverScene] Could not load high score:', error);
            return 0;
        }
    }
    
    /**
     * Save high score to localStorage
     * @param {number} score Score to save
     * @private
     */
    _saveHighScore(score) {
        try {
            localStorage.setItem('sharky_high_score', score.toString());
        } catch (error) {
            console.warn('[GameOverScene] Could not save high score:', error);
        }
    }
}