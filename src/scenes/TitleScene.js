/**
 * @file Professional title screen with animated background and menu system.
 * 
 * FEATURES:
 * - Animated background with parallax bubbles
 * - Menu system with keyboard and mouse navigation
 * - Smooth animations and transitions
 * - Settings integration
 * - Audio preview and music
 * - Responsive design
 */

import { Scene, SceneTransitions } from '../managers/SceneManager.js';
import { PlayScene } from './PlayScene.js';
import { GameConfig } from '../config/GameConfig.js';
import { BackgroundLayer } from '../ui/BackgroundLayer.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { loadLevel } from '../utils/LevelLoader.js';

/**
 * Title scene with professional menu system
 */
export class TitleScene extends Scene {
    /**
     * Initialize title scene
     * @param {Object} options Scene options
     * @param {import('../game/Game.js').Game} options.game Game instance
     * @param {import('../managers/InputManager.js').InputManager} options.input Input manager
     * @param {import('../managers/AudioManager.js').AudioManager} options.audio Audio manager
     * @param {import('../utils/AssetLoader.js').LoadedAssets} options.assets Loaded assets
     */
    constructor({ game, input, audio, assets }) {
        super();
        
        this._game = game;
        this._input = input;
        this._audio = audio;
        this._assets = assets;
        
        // Menu state
        this._menuItems = [
            { id: 'start', text: 'Start Game', action: () => this._startGame() },
            { id: 'settings', text: 'Settings', action: () => this._openSettings() },
            { id: 'credits', text: 'Credits', action: () => this._showCredits() },
            { id: 'exit', text: 'Exit', action: () => this._exitGame() }
        ];
        
        this._selectedIndex = 0;
        this._menuAnimTime = 0;
        this._titleAnimTime = 0;
        
        // Background system
        this._backgroundLayers = [];
        this._particleSystem = new ParticleSystem(200);
        
        // Animation states
        this._titlePulse = 0;
        this._menuItemAnimations = new Map();
        this._logoRotation = 0;
        
        // Input handling
        this._inputHandlers = new Map();
        this._mousePos = { x: 0, y: 0 };
        this._lastMouseMove = 0;
        
        // Music state
        this._musicStarted = false;
        
        console.log('[TitleScene] Title scene initialized');
    }
    
    /**
     * Scene enter lifecycle
     */
    async enter() {
        await super.enter();
        
        // Initialize background
        this._initializeBackground();
        
        // Initialize menu animations
        this._initializeMenuAnimations();
        
        // Setup input handlers
        this._setupInputHandlers();
        
        // Setup mouse handling
        this._setupMouseHandling();
        
        // Start background music
        this._startBackgroundMusic();
        
        // Start bubble emitters
        this._startBubbleEmitters();
        
        console.log('[TitleScene] Title scene entered');
    }
    
    /**
     * Scene exit lifecycle
     */
    async exit() {
        await super.exit();
        
        // Clean up input handlers
        this._inputHandlers.forEach(unsubscribe => unsubscribe());
        this._inputHandlers.clear();
        
        // Clean up mouse handling
        this._cleanupMouseHandling();
        
        // Stop particle emitters
        this._particleSystem.clear();
        
        console.log('[TitleScene] Title scene exited');
    }
    
    /**
     * Update title scene
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        super.update(dt);
        
        // Update animations
        this._titleAnimTime += dt;
        this._menuAnimTime += dt;
        this._logoRotation += dt * 0.5;
        
        // Update title pulse
        this._titlePulse = Math.sin(this._titleAnimTime * 2) * 0.1 + 1;
        
        // Update menu item animations
        this._updateMenuAnimations(dt);
        
        // Update particle system
        this._particleSystem.update(dt);
        
        // Check for mouse movement timeout
        if (Date.now() - this._lastMouseMove > 5000) {
            // Return to keyboard navigation after 5 seconds of no mouse movement
            this._mouseMode = false;
        }
    }
    
    /**
     * Render title scene
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        super.render(ctx);
        
        // Render background
        this._renderBackground(ctx);
        
        // Render particles
        this._particleSystem.render(ctx);
        
        // Render title
        this._renderTitle(ctx);
        
        // Render menu
        this._renderMenu(ctx);
        
        // Render version info
        this._renderVersionInfo(ctx);
        
        // Render controls hint
        this._renderControlsHint(ctx);
    }
    
    /**
     * Clean up title scene
     */
    destroy() {
        super.destroy();
        
        // Clean up particle system
        this._particleSystem.clear();
        
        // Clean up background layers
        this._backgroundLayers.length = 0;
        
        console.log('[TitleScene] Title scene destroyed');
    }
    
    // =============================================================================
    // INITIALIZATION METHODS
    // =============================================================================
    
    /**
     * Initialize background layers
     * @private
     */
    _initializeBackground() {
        // Create background layers similar to game scene
        const layerConfigs = [
            { key: 'bg_water', factor: 0 },
            { key: 'bg_far', factor: 0.05 },
            { key: 'bg_mid', factor: 0.1 },
            { key: 'bg_near', factor: 0.15 }
        ];
        
        layerConfigs.forEach(config => {
            if (this._assets.images[config.key]) {
                this._backgroundLayers.push(
                    new BackgroundLayer({
                        img: this._assets.images[config.key],
                        factor: config.factor,
                        canvas: this._game._canvas,
                        stretch: true,
                    })
                );
            }
        });
    }
    
    /**
     * Initialize menu item animations
     * @private
     */
    _initializeMenuAnimations() {
        this._menuItems.forEach((item, index) => {
            this._menuItemAnimations.set(item.id, {
                scale: 1,
                targetScale: 1,
                alpha: 1,
                offsetX: 0,
                bounce: 0,
                glowIntensity: 0
            });
        });
    }
    
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
        
        // Quick start
        this._inputHandlers.set('pause', this._input.onAction('pause', (pressed) => {
            if (pressed) this._startGame();
        }));
    }
    
    /**
     * Setup mouse handling
     * @private
     */
    _setupMouseHandling() {
        this._mouseMode = false;
        
        // Mouse move handler
        this._mouseMoveHandler = (e) => {
            const rect = this._game._canvas.getBoundingClientRect();
            this._mousePos.x = e.clientX - rect.left;
            this._mousePos.y = e.clientY - rect.top;
            this._lastMouseMove = Date.now();
            this._mouseMode = true;
            
            // Check menu item hover
            this._checkMenuHover();
        };
        
        // Mouse click handler
        this._mouseClickHandler = (e) => {
            if (this._mouseMode) {
                this._selectMenuItem();
            }
        };
        
        // Add event listeners
        this._game._canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this._game._canvas.addEventListener('click', this._mouseClickHandler);
    }
    
    /**
     * Cleanup mouse handling
     * @private
     */
    _cleanupMouseHandling() {
        if (this._mouseMoveHandler) {
            this._game._canvas.removeEventListener('mousemove', this._mouseMoveHandler);
        }
        if (this._mouseClickHandler) {
            this._game._canvas.removeEventListener('click', this._mouseClickHandler);
        }
    }
    
    /**
     * Start background music
     * @private
     */
    _startBackgroundMusic() {
        if (!this._musicStarted) {
            this._musicStarted = true;
            // Start title music (if available)
            if (this._assets.sounds && this._assets.sounds.title_music) {
                this._audio.playMusic('title_music', true, 2.0);
            }
        }
    }
    
    /**
     * Start bubble emitters for atmosphere
     * @private
     */
    _startBubbleEmitters() {
        // Create multiple bubble streams
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 200;
            const y = this._game._canvas.height + 50;
            
            this._particleSystem.createBubbleStream(x, y, 2, 0); // Infinite duration
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
            
            // Animate menu items
            this._animateMenuSelection();
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
        
        // Animate selection
        this._animateMenuItemSelection(selectedItem.id);
        
        // Execute action after animation
        setTimeout(() => {
            selectedItem.action();
        }, 150);
    }
    
    /**
     * Check menu item hover with mouse
     * @private
     */
    _checkMenuHover() {
        const menuY = this._game._canvas.height * 0.6;
        const itemHeight = 60;
        
        for (let i = 0; i < this._menuItems.length; i++) {
            const itemY = menuY + i * itemHeight;
            
            if (this._mousePos.y >= itemY - itemHeight/2 && 
                this._mousePos.y <= itemY + itemHeight/2) {
                
                if (this._selectedIndex !== i) {
                    this._selectedIndex = i;
                    this._animateMenuSelection();
                }
                break;
            }
        }
    }
    
    // =============================================================================
    // MENU ACTIONS
    // =============================================================================
    
    /**
     * Start the game
     * @private
     */
    async _startGame() {
        console.log('[TitleScene] Starting game...');
        
        try {
            // Load level data
            const levelData = await loadLevel('level1');
            
            // Create play scene
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
            console.error('[TitleScene] Error starting game:', error);
            // Could show error message to user
        }
    }
    
    /**
     * Open settings
     * @private
     */
    _openSettings() {
        console.log('[TitleScene] Opening settings...');
        // TODO: Push settings scene as overlay
        // For now, just show the existing settings overlay
        this._game._overlay.show();
    }
    
    /**
     * Show credits
     * @private
     */
    _showCredits() {
        console.log('[TitleScene] Showing credits...');
        // TODO: Push credits scene
        // For now, just log
        alert('Credits:\n\nSharky Game\nDeveloped with Claude AI\nUsing modern JavaScript & Canvas');
    }
    
    /**
     * Exit game
     * @private
     */
    _exitGame() {
        console.log('[TitleScene] Exiting game...');
        // For web games, just close the tab/window
        if (confirm('Are you sure you want to exit?')) {
            window.close();
        }
    }
    
    // =============================================================================
    // ANIMATION METHODS
    // =============================================================================
    
    /**
     * Update menu item animations
     * @param {number} dt Delta time in seconds
     * @private
     */
    _updateMenuAnimations(dt) {
        this._menuItemAnimations.forEach((anim, itemId) => {
            // Smooth scale animation
            const scaleDiff = anim.targetScale - anim.scale;
            anim.scale += scaleDiff * dt * 8;
            
            // Bounce animation
            if (anim.bounce > 0) {
                anim.bounce -= dt * 3;
                anim.offsetX = Math.sin(anim.bounce * 10) * 5;
            }
            
            // Glow animation
            if (anim.glowIntensity > 0) {
                anim.glowIntensity -= dt * 2;
            }
        });
    }
    
    /**
     * Animate menu selection change
     * @private
     */
    _animateMenuSelection() {
        this._menuItemAnimations.forEach((anim, itemId) => {
            const index = this._menuItems.findIndex(item => item.id === itemId);
            
            if (index === this._selectedIndex) {
                anim.targetScale = 1.1;
                anim.glowIntensity = 1;
            } else {
                anim.targetScale = 1;
            }
        });
    }
    
    /**
     * Animate menu item selection
     * @param {string} itemId Item ID to animate
     * @private
     */
    _animateMenuItemSelection(itemId) {
        const anim = this._menuItemAnimations.get(itemId);
        if (anim) {
            anim.bounce = 1;
            anim.targetScale = 1.2;
            anim.glowIntensity = 2;
        }
    }
    
    // =============================================================================
    // RENDER METHODS
    // =============================================================================
    
    /**
     * Render background layers
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBackground(ctx) {
        // Slowly moving background
        const scrollSpeed = 10; // pixels per second
        const scrollOffset = this._titleAnimTime * scrollSpeed;
        
        this._backgroundLayers.forEach(layer => {
            layer.render(ctx, scrollOffset);
        });
        
        // Dark overlay for readability
        ctx.fillStyle = 'rgba(0, 20, 40, 0.3)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    /**
     * Render game title
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderTitle(ctx) {
        ctx.save();
        
        // Title positioning
        const centerX = ctx.canvas.width / 2;
        const titleY = ctx.canvas.height * 0.25;
        
        // Title shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Title text
        ctx.fillStyle = '#4A90E2';
        ctx.font = `bold ${60 * this._titlePulse}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SHARKY', centerX, titleY);
        
        // Title glow effect
        ctx.shadowColor = 'rgba(74, 144, 226, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText('SHARKY', centerX, titleY);
        
        // Subtitle
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#87CEEB';
        ctx.font = '24px Arial';
        ctx.fillText('Ocean Adventure', centerX, titleY + 80);
        
        ctx.restore();
    }
    
    /**
     * Render menu items
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderMenu(ctx) {
        ctx.save();
        
        const centerX = ctx.canvas.width / 2;
        const menuY = ctx.canvas.height * 0.6;
        const itemHeight = 60;
        
        this._menuItems.forEach((item, index) => {
            const anim = this._menuItemAnimations.get(item.id);
            const y = menuY + index * itemHeight;
            const isSelected = index === this._selectedIndex;
            
            // Transform for animation
            ctx.save();
            ctx.translate(centerX + anim.offsetX, y);
            ctx.scale(anim.scale, anim.scale);
            
            // Glow effect for selected item
            if (isSelected && anim.glowIntensity > 0) {
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 15 * anim.glowIntensity;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
            
            // Menu item background
            if (isSelected) {
                ctx.fillStyle = `rgba(74, 144, 226, ${0.3 + anim.glowIntensity * 0.2})`;
                ctx.fillRect(-120, -20, 240, 40);
            }
            
            // Menu item text
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
            ctx.font = `${isSelected ? 'bold ' : ''}28px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, 0, 0);
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    /**
     * Render version info
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderVersionInfo(ctx) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('v1.0.0', ctx.canvas.width - 10, ctx.canvas.height - 10);
        
        ctx.restore();
    }
    
    /**
     * Render controls hint
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderControlsHint(ctx) {
        ctx.save();
        
        const hintY = ctx.canvas.height - 40;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this._mouseMode) {
            ctx.fillText('Click to select • Move mouse to navigate', ctx.canvas.width / 2, hintY);
        } else {
            ctx.fillText('↑↓ Navigate • SPACE/K Select • ESC Quick Start', ctx.canvas.width / 2, hintY);
        }
        
        ctx.restore();
    }
}