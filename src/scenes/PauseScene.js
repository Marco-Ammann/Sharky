/**
 * @file Professional pause menu scene with settings integration.
 * 
 * FEATURES:
 * - Overlay scene that doesn't pause the underlying game completely
 * - Settings integration with sliders and controls
 * - Resume, restart, and quit options
 * - Animated background with particles
 * - Keyboard and mouse navigation
 * - Audio settings with live preview
 */

import { Scene, SceneTransitions } from '../managers/SceneManager.js';
import { TitleScene } from './TitleScene.js';
import { PlayScene } from './PlayScene.js';
import { GameConfig } from '../config/GameConfig.js';
import { loadLevel } from '../utils/LevelLoader.js';

/**
 * Pause scene with integrated settings
 */
export class PauseScene extends Scene {
    /**
     * Initialize pause scene
     * @param {Object} options Scene options
     * @param {import('../game/Game.js').Game} options.game Game instance
     * @param {import('../managers/InputManager.js').InputManager} options.input Input manager
     * @param {import('../managers/AudioManager.js').AudioManager} options.audio Audio manager
     * @param {import('../utils/AssetLoader.js').LoadedAssets} options.assets Loaded assets
     */
    constructor({ game, input, audio, assets }) {
        super({ overlay: true }); // This is an overlay scene
        
        this._game = game;
        this._input = input;
        this._audio = audio;
        this._assets = assets;
        
        // Menu sections
        this._sections = ['main', 'settings', 'audio', 'controls'];
        this._currentSection = 'main';
        
        // Menu items for each section
        this._menuItems = {
            main: [
                { id: 'resume', text: 'Resume Game', action: () => this._resumeGame() },
                { id: 'settings', text: 'Settings', action: () => this._openSettings() },
                { id: 'restart', text: 'Restart Level', action: () => this._restartLevel() },
                { id: 'quit', text: 'Quit to Menu', action: () => this._quitToMenu() }
            ],
            settings: [
                { id: 'audio', text: 'Audio Settings', action: () => this._openAudioSettings() },
                { id: 'controls', text: 'Controls', action: () => this._openControls() },
                { id: 'back', text: 'Back', action: () => this._backToMain() }
            ],
            audio: [
                { id: 'music_volume', text: 'Music Volume', type: 'slider', value: GameConfig.audio.musicVolume, min: 0, max: 1, step: 0.1 },
                { id: 'sfx_volume', text: 'SFX Volume', type: 'slider', value: GameConfig.audio.sfxVolume, min: 0, max: 1, step: 0.1 },
                { id: 'mute', text: 'Mute All', type: 'toggle', value: this._audio.isMuted },
                { id: 'back', text: 'Back', action: () => this._backToSettings() }
            ],
            controls: [
                { id: 'move', text: 'Move: WASD or Arrow Keys', type: 'info' },
                { id: 'attack', text: 'Attack: SPACE or K', type: 'info' },
                { id: 'pause', text: 'Pause: ESC', type: 'info' },
                { id: 'debug', text: 'Debug: F3', type: 'info' },
                { id: 'back', text: 'Back', action: () => this._backToSettings() }
            ]
        };
        
        this._selectedIndex = 0;
        this._animTime = 0;
        this._backgroundAlpha = 0;
        this._targetBackgroundAlpha = 0.8;
        
        // Input handling
        this._inputHandlers = new Map();
        this._sliderAdjustmentSpeed = 0.1;
        
        // Animation states
        this._sectionTransitionTime = 0;
        this._sectionTransitionDuration = 0.3;
        this._isTransitioning = false;
        
        // Background particles
        this._backgroundParticles = [];
        
        console.log('[PauseScene] Pause scene initialized');
    }
    
    /**
     * Scene enter lifecycle
     */
    async enter() {
        await super.enter();
        
        // Setup input handlers
        this._setupInputHandlers();
        
        // Initialize background particles
        this._initializeBackgroundParticles();
        
        // Reset to main menu
        this._currentSection = 'main';
        this._selectedIndex = 0;
        
        // Start background fade in
        this._targetBackgroundAlpha = 0.8;
        
        console.log('[PauseScene] Pause scene entered');
    }
    
    /**
     * Scene exit lifecycle
     */
    async exit() {
        await super.exit();
        
        // Clean up input handlers
        this._inputHandlers.forEach(unsubscribe => unsubscribe());
        this._inputHandlers.clear();
        
        // Clean up particles
        this._backgroundParticles.length = 0;
        
        console.log('[PauseScene] Pause scene exited');
    }
    
    /**
     * Update pause scene
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        super.update(dt);
        
        // Update animations
        this._animTime += dt;
        
        // Update background fade
        const alphaDiff = this._targetBackgroundAlpha - this._backgroundAlpha;
        this._backgroundAlpha += alphaDiff * dt * 5;
        
        // Update section transition
        if (this._isTransitioning) {
            this._sectionTransitionTime += dt;
            if (this._sectionTransitionTime >= this._sectionTransitionDuration) {
                this._isTransitioning = false;
                this._sectionTransitionTime = 0;
            }
        }
        
        // Update background particles
        this._updateBackgroundParticles(dt);
    }
    
    /**
     * Render pause scene
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        super.render(ctx);
        
        // Render background overlay
        this._renderBackgroundOverlay(ctx);
        
        // Render background particles
        this._renderBackgroundParticles(ctx);
        
        // Render current section
        this._renderCurrentSection(ctx);
        
        // Render section title
        this._renderSectionTitle(ctx);
        
        // Render navigation hint
        this._renderNavigationHint(ctx);
    }
    
    /**
     * Clean up pause scene
     */
    destroy() {
        super.destroy();
        
        // Clean up particles
        this._backgroundParticles.length = 0;
        
        console.log('[PauseScene] Pause scene destroyed');
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
        
        this._inputHandlers.set('left', this._input.onAction('left', (pressed) => {
            if (pressed) this._adjustSlider(-this._sliderAdjustmentSpeed);
        }));
        
        this._inputHandlers.set('right', this._input.onAction('right', (pressed) => {
            if (pressed) this._adjustSlider(this._sliderAdjustmentSpeed);
        }));
        
        // Selection
        this._inputHandlers.set('attack', this._input.onAction('attack', (pressed) => {
            if (pressed) this._selectMenuItem();
        }));
        
        // Quick resume
        this._inputHandlers.set('pause', this._input.onAction('pause', (pressed) => {
            if (pressed) this._resumeGame();
        }));
    }
    
    /**
     * Initialize background particles
     * @private
     */
    _initializeBackgroundParticles() {
        this._backgroundParticles = [];
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            this._backgroundParticles.push({
                x: Math.random() * this._game._canvas.width,
                y: Math.random() * this._game._canvas.height,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 4 + 2,
                alpha: Math.random() * 0.3 + 0.1,
                color: `rgba(135, 206, 235, ${Math.random() * 0.5 + 0.2})`
            });
        }
    }
    
    // =============================================================================
    // NAVIGATION METHODS
    // =============================================================================
    
    /**
     * Navigate menu up or down
     * @param {number} direction Direction (-1 for up, 1 for down)
     * @private
     */
    _navigateMenu(direction) {
        if (this._isTransitioning) return;
        
        const currentItems = this._menuItems[this._currentSection];
        const prevIndex = this._selectedIndex;
        
        this._selectedIndex = (this._selectedIndex + direction + currentItems.length) % currentItems.length;
        
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
        if (this._isTransitioning) return;
        
        const currentItems = this._menuItems[this._currentSection];
        const selectedItem = currentItems[this._selectedIndex];
        
        if (selectedItem.type === 'toggle') {
            this._toggleItem(selectedItem);
        } else if (selectedItem.action) {
            // Play selection sound
            if (this._assets.sounds && this._assets.sounds.menu_select) {
                this._audio.playSfx(this._assets.sounds.menu_select.src, { volume: 0.5 });
            }
            
            selectedItem.action();
        }
    }
    
    /**
     * Adjust slider value
     * @param {number} delta Change in value
     * @private
     */
    _adjustSlider(delta) {
        if (this._isTransitioning) return;
        
        const currentItems = this._menuItems[this._currentSection];
        const selectedItem = currentItems[this._selectedIndex];
        
        if (selectedItem.type === 'slider') {
            const oldValue = selectedItem.value;
            selectedItem.value = Math.max(selectedItem.min, Math.min(selectedItem.max, selectedItem.value + delta));
            
            if (oldValue !== selectedItem.value) {
                this._applySliderChange(selectedItem);
                
                // Play adjustment sound
                if (this._assets.sounds && this._assets.sounds.menu_navigate) {
                    this._audio.playSfx(this._assets.sounds.menu_navigate.src, { volume: 0.2 });
                }
            }
        }
    }
    
    /**
     * Toggle item value
     * @param {Object} item Item to toggle
     * @private
     */
    _toggleItem(item) {
        item.value = !item.value;
        this._applyToggleChange(item);
        
        // Play toggle sound
        if (this._assets.sounds && this._assets.sounds.menu_select) {
            this._audio.playSfx(this._assets.sounds.menu_select.src, { volume: 0.4 });
        }
    }
    
    // =============================================================================
    // MENU ACTIONS
    // =============================================================================
    
    /**
     * Resume the game
     * @private
     */
    async _resumeGame() {
        console.log('[PauseScene] Resuming game...');
        await this._game.sceneManager.popScene(SceneTransitions.FADE_FAST);
    }
    
    /**
     * Open settings section
     * @private
     */
    _openSettings() {
        this._transitionToSection('settings');
    }
    
    /**
     * Open audio settings
     * @private
     */
    _openAudioSettings() {
        this._transitionToSection('audio');
    }
    
    /**
     * Open controls section
     * @private
     */
    _openControls() {
        this._transitionToSection('controls');
    }
    
    /**
     * Back to main menu
     * @private
     */
    _backToMain() {
        this._transitionToSection('main');
    }
    
    /**
     * Back to settings
     * @private
     */
    _backToSettings() {
        this._transitionToSection('settings');
    }
    
    /**
     * Restart current level
     * @private
     */
    async _restartLevel() {
        console.log('[PauseScene] Restarting level...');
        
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
            
            // Replace current scene stack with new game
            await this._game.sceneManager.changeScene(playScene, SceneTransitions.FADE_NORMAL);
            
        } catch (error) {
            console.error('[PauseScene] Error restarting level:', error);
        }
    }
    
    /**
     * Quit to main menu
     * @private
     */
    async _quitToMenu() {
        console.log('[PauseScene] Quitting to main menu...');
        
        try {
            // Create title scene
            const titleScene = new TitleScene({
                game: this._game,
                input: this._input,
                audio: this._audio,
                assets: this._assets
            });
            
            // Replace current scene stack with title
            await this._game.sceneManager.changeScene(titleScene, SceneTransitions.FADE_NORMAL);
            
        } catch (error) {
            console.error('[PauseScene] Error quitting to menu:', error);
        }
    }
    
    // =============================================================================
    // SETTINGS METHODS
    // =============================================================================
    
    /**
     * Apply slider change
     * @param {Object} item Slider item
     * @private
     */
    _applySliderChange(item) {
        switch (item.id) {
            case 'music_volume':
                this._audio.setMusicVolume(item.value);
                break;
            case 'sfx_volume':
                this._audio.setSfxVolume(item.value);
                break;
        }
    }
    
    /**
     * Apply toggle change
     * @param {Object} item Toggle item
     * @private
     */
    _applyToggleChange(item) {
        switch (item.id) {
            case 'mute':
                this._audio.setMuted(item.value);
                break;
        }
    }
    
    // =============================================================================
    // ANIMATION METHODS
    // =============================================================================
    
    /**
     * Transition to new section
     * @param {string} sectionName Section name
     * @private
     */
    _transitionToSection(sectionName) {
        if (this._isTransitioning || this._currentSection === sectionName) return;
        
        this._isTransitioning = true;
        this._sectionTransitionTime = 0;
        this._currentSection = sectionName;
        this._selectedIndex = 0;
        
        console.log(`[PauseScene] Transitioning to section: ${sectionName}`);
    }
    
    /**
     * Update background particles
     * @param {number} dt Delta time
     * @private
     */
    _updateBackgroundParticles(dt) {
        this._backgroundParticles.forEach(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this._game._canvas.width;
            if (particle.x > this._game._canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this._game._canvas.height;
            if (particle.y > this._game._canvas.height) particle.y = 0;
        });
    }
    
    // =============================================================================
    // RENDER METHODS
    // =============================================================================
    
    /**
     * Render background overlay
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBackgroundOverlay(ctx) {
        ctx.save();
        
        // Semi-transparent background
        ctx.fillStyle = `rgba(0, 20, 40, ${this._backgroundAlpha})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Subtle pattern
        ctx.globalAlpha = this._backgroundAlpha * 0.1;
        for (let x = 0; x < ctx.canvas.width; x += 50) {
            for (let y = 0; y < ctx.canvas.height; y += 50) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Render background particles
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBackgroundParticles(ctx) {
        ctx.save();
        
        this._backgroundParticles.forEach(particle => {
            ctx.globalAlpha = particle.alpha * this._backgroundAlpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    /**
     * Render current section
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderCurrentSection(ctx) {
        const currentItems = this._menuItems[this._currentSection];
        const centerX = ctx.canvas.width / 2;
        const startY = ctx.canvas.height * 0.4;
        const itemHeight = 50;
        
        ctx.save();
        
        // Section transition effect
        if (this._isTransitioning) {
            const progress = this._sectionTransitionTime / this._sectionTransitionDuration;
            ctx.globalAlpha = Math.sin(progress * Math.PI);
        }
        
        currentItems.forEach((item, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this._selectedIndex;
            
            // Item background
            if (isSelected) {
                ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
                ctx.fillRect(centerX - 150, y - 20, 300, 40);
            }
            
            // Render based on item type
            switch (item.type) {
                case 'slider':
                    this._renderSliderItem(ctx, item, centerX, y, isSelected);
                    break;
                case 'toggle':
                    this._renderToggleItem(ctx, item, centerX, y, isSelected);
                    break;
                case 'info':
                    this._renderInfoItem(ctx, item, centerX, y, isSelected);
                    break;
                default:
                    this._renderButtonItem(ctx, item, centerX, y, isSelected);
            }
        });
        
        ctx.restore();
    }
    
    /**
     * Render slider item
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {Object} item Item to render
     * @param {number} x X position
     * @param {number} y Y position
     * @param {boolean} isSelected Whether item is selected
     * @private
     */
    _renderSliderItem(ctx, item, x, y, isSelected) {
        // Label
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, x - 140, y);
        
        // Slider track
        const sliderX = x - 140;
        const sliderY = y + 20;
        const sliderWidth = 280;
        const sliderHeight = 4;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);
        
        // Slider fill
        const fillWidth = ((item.value - item.min) / (item.max - item.min)) * sliderWidth;
        ctx.fillStyle = isSelected ? '#4A90E2' : '#87CEEB';
        ctx.fillRect(sliderX, sliderY, fillWidth, sliderHeight);
        
        // Slider handle
        const handleX = sliderX + fillWidth;
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
        ctx.beginPath();
        ctx.arc(handleX, sliderY + sliderHeight/2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Value display
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(item.value * 100) + '%', x + 140, y);
    }
    
    /**
     * Render toggle item
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {Object} item Item to render
     * @param {number} x X position
     * @param {number} y Y position
     * @param {boolean} isSelected Whether item is selected
     * @private
     */
    _renderToggleItem(ctx, item, x, y, isSelected) {
        // Label
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, x - 140, y);
        
        // Toggle switch
        const switchX = x + 80;
        const switchY = y - 10;
        const switchWidth = 50;
        const switchHeight = 20;
        
        // Track
        ctx.fillStyle = item.value ? '#4A90E2' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(switchX, switchY, switchWidth, switchHeight);
        
        // Handle
        const handleX = item.value ? switchX + switchWidth - 20 : switchX;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(handleX, switchY, 20, switchHeight);
        
        // Status text
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#B0C4DE';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(item.value ? 'ON' : 'OFF', x + 140, y);
    }
    
    /**
     * Render info item
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {Object} item Item to render
     * @param {number} x X position
     * @param {number} y Y position
     * @param {boolean} isSelected Whether item is selected
     * @private
     */
    _renderInfoItem(ctx, item, x, y, isSelected) {
        ctx.fillStyle = isSelected ? '#FFD700' : '#B0C4DE';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, x, y);
    }
    
    /**
     * Render button item
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {Object} item Item to render
     * @param {number} x X position
     * @param {number} y Y position
     * @param {boolean} isSelected Whether item is selected
     * @private
     */
    _renderButtonItem(ctx, item, x, y, isSelected) {
        ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
        ctx.font = isSelected ? 'bold 24px Arial' : '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, x, y);
    }
    
    /**
     * Render section title
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderSectionTitle(ctx) {
        const titles = {
            main: 'PAUSED',
            settings: 'SETTINGS',
            audio: 'AUDIO SETTINGS',
            controls: 'CONTROLS'
        };
        
        ctx.save();
        
        ctx.fillStyle = '#4A90E2';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(titles[this._currentSection] || 'MENU', ctx.canvas.width / 2, ctx.canvas.height * 0.2);
        
        ctx.restore();
    }
    
    /**
     * Render navigation hint
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderNavigationHint(ctx) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const hints = {
            main: '↑↓ Navigate • SPACE/K Select • ESC Resume',
            settings: '↑↓ Navigate • SPACE/K Select • ESC Resume',
            audio: '↑↓ Navigate • ←→ Adjust • SPACE/K Select/Toggle',
            controls: '↑↓ Navigate • SPACE/K Back'
        };
        
        ctx.fillText(hints[this._currentSection] || '', ctx.canvas.width / 2, ctx.canvas.height - 20);
        
        ctx.restore();
    }
}