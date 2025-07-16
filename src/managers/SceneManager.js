/**
 * @file Scene management system for handling different game states.
 * 
 * FEATURES:
 * - Scene stack with push/pop functionality
 * - Smooth transitions between scenes
 * - Scene lifecycle management (enter, exit, pause, resume)
 * - Memory management with proper cleanup
 * - Event system for scene communication
 * - Overlay scenes for pause menus, settings, etc.
 */

/**
 * Scene manager handles scene transitions and lifecycle
 */
export class SceneManager {
    /**
     * Initialize scene manager
     * @param {import('../game/Game.js').Game} game Game instance
     */
    constructor(game) {
        this._game = game;
        this._sceneStack = [];
        this._transitions = new Map();
        this._isTransitioning = false;
        this._transitionDuration = 0.5; // seconds
        this._currentTransition = null;
        
        // Event system for scene communication
        this._eventListeners = new Map();
        
        console.log('[SceneManager] Scene manager initialized');
    }
    
    /**
     * Push a new scene onto the stack
     * @param {Object} scene Scene instance
     * @param {Object} options Transition options
     * @param {string} options.transition Transition type ('fade', 'slide', 'instant')
     * @param {number} options.duration Transition duration in seconds
     * @param {boolean} options.overlay Whether scene is an overlay (doesn't pause previous)
     */
    async pushScene(scene, options = {}) {
        const opts = {
            transition: 'fade',
            duration: this._transitionDuration,
            overlay: false,
            ...options
        };
        
        console.log(`[SceneManager] Pushing scene: ${scene.constructor.name}`);
        
        // Pause current scene if not an overlay
        if (!opts.overlay && this._sceneStack.length > 0) {
            const currentScene = this._getCurrentScene();
            if (currentScene && typeof currentScene.pause === 'function') {
                currentScene.pause();
            }
        }
        
        // Add to stack
        this._sceneStack.push({
            scene,
            overlay: opts.overlay,
            enterTime: Date.now()
        });
        
        // Initialize new scene
        if (typeof scene.enter === 'function') {
            await scene.enter();
        }
        
        // Start transition
        if (opts.transition !== 'instant') {
            await this._startTransition(opts.transition, opts.duration, true);
        }
        
        this._emitEvent('sceneChanged', scene);
    }
    
    /**
     * Pop the current scene from the stack
     * @param {Object} options Transition options
     * @param {string} options.transition Transition type
     * @param {number} options.duration Transition duration in seconds
     */
    async popScene(options = {}) {
        if (this._sceneStack.length === 0) {
            console.warn('[SceneManager] Cannot pop scene: stack is empty');
            return;
        }
        
        const opts = {
            transition: 'fade',
            duration: this._transitionDuration,
            ...options
        };
        
        const currentSceneData = this._sceneStack.pop();
        const currentScene = currentSceneData.scene;
        
        console.log(`[SceneManager] Popping scene: ${currentScene.constructor.name}`);
        
        // Start transition
        if (opts.transition !== 'instant') {
            await this._startTransition(opts.transition, opts.duration, false);
        }
        
        // Exit current scene
        if (typeof currentScene.exit === 'function') {
            await currentScene.exit();
        }
        
        // Clean up current scene
        if (typeof currentScene.destroy === 'function') {
            currentScene.destroy();
        }
        
        // Resume previous scene if it wasn't an overlay
        if (!currentSceneData.overlay && this._sceneStack.length > 0) {
            const previousScene = this._getCurrentScene();
            if (previousScene && typeof previousScene.resume === 'function') {
                previousScene.resume();
            }
        }
        
        this._emitEvent('sceneChanged', this._getCurrentScene());
    }
    
    /**
     * Replace the current scene with a new one
     * @param {Object} scene New scene instance
     * @param {Object} options Transition options
     */
    async replaceScene(scene, options = {}) {
        if (this._sceneStack.length > 0) {
            await this.popScene({ transition: 'instant' });
        }
        await this.pushScene(scene, options);
    }
    
    /**
     * Clear all scenes and push a new one
     * @param {Object} scene New scene instance
     * @param {Object} options Transition options
     */
    async changeScene(scene, options = {}) {
        // Clear all scenes
        while (this._sceneStack.length > 0) {
            await this.popScene({ transition: 'instant' });
        }
        
        // Push new scene
        await this.pushScene(scene, options);
    }
    
    /**
     * Get the current active scene
     * @returns {Object|null} Current scene or null if stack is empty
     */
    getCurrentScene() {
        return this._getCurrentScene();
    }
    
    /**
     * Update all scenes in stack
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        // Update transition if active
        if (this._currentTransition) {
            this._updateTransition(dt);
        }
        
        // Update scenes from bottom to top
        for (let i = 0; i < this._sceneStack.length; i++) {
            const sceneData = this._sceneStack[i];
            const scene = sceneData.scene;
            
            // Only update if scene is active (not paused by overlay)
            const isActive = i === this._sceneStack.length - 1 || 
                           this._sceneStack.slice(i + 1).every(s => s.overlay);
            
            if (isActive && typeof scene.update === 'function') {
                scene.update(dt);
            }
        }
    }
    
    /**
     * Render all scenes in stack
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        // Render scenes from bottom to top
        for (let i = 0; i < this._sceneStack.length; i++) {
            const sceneData = this._sceneStack[i];
            const scene = sceneData.scene;
            
            if (typeof scene.render === 'function') {
                scene.render(ctx);
            }
        }
        
        // Render transition overlay if active
        if (this._currentTransition) {
            this._renderTransition(ctx);
        }
    }
    
    /**
     * Add event listener for scene events
     * @param {string} eventType Event type
     * @param {Function} callback Callback function
     * @returns {Function} Unsubscribe function
     */
    addEventListener(eventType, callback) {
        if (!this._eventListeners.has(eventType)) {
            this._eventListeners.set(eventType, new Set());
        }
        
        const listeners = this._eventListeners.get(eventType);
        listeners.add(callback);
        
        return () => listeners.delete(callback);
    }
    
    /**
     * Check if a specific scene type is in the stack
     * @param {Function} SceneClass Scene class constructor
     * @returns {boolean} True if scene is in stack
     */
    hasScene(SceneClass) {
        return this._sceneStack.some(sceneData => 
            sceneData.scene instanceof SceneClass
        );
    }
    
    /**
     * Get scene by class from stack
     * @param {Function} SceneClass Scene class constructor
     * @returns {Object|null} Scene instance or null if not found
     */
    getScene(SceneClass) {
        const sceneData = this._sceneStack.find(sceneData => 
            sceneData.scene instanceof SceneClass
        );
        return sceneData ? sceneData.scene : null;
    }
    
    /**
     * Get the number of scenes in stack
     * @returns {number} Scene count
     */
    getSceneCount() {
        return this._sceneStack.length;
    }
    
    /**
     * Check if currently transitioning
     * @returns {boolean} True if transitioning
     */
    isTransitioning() {
        return this._isTransitioning;
    }
    
    /**
     * Clean up scene manager
     */
    destroy() {
        // Clear all scenes
        while (this._sceneStack.length > 0) {
            this.popScene({ transition: 'instant' });
        }
        
        // Clear transitions
        this._transitions.clear();
        this._currentTransition = null;
        
        // Clear event listeners
        this._eventListeners.clear();
        
        console.log('[SceneManager] Scene manager destroyed');
    }
    
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    
    /**
     * Get current scene from stack
     * @returns {Object|null} Current scene
     * @private
     */
    _getCurrentScene() {
        if (this._sceneStack.length === 0) return null;
        return this._sceneStack[this._sceneStack.length - 1].scene;
    }
    
    /**
     * Start a transition
     * @param {string} type Transition type
     * @param {number} duration Duration in seconds
     * @param {boolean} entering Whether entering or exiting
     * @private
     */
    async _startTransition(type, duration, entering) {
        this._isTransitioning = true;
        this._currentTransition = {
            type,
            duration,
            elapsed: 0,
            entering,
            progress: 0
        };
        
        return new Promise(resolve => {
            this._currentTransition.resolve = resolve;
        });
    }
    
    /**
     * Update transition animation
     * @param {number} dt Delta time in seconds
     * @private
     */
    _updateTransition(dt) {
        if (!this._currentTransition) return;
        
        this._currentTransition.elapsed += dt;
        this._currentTransition.progress = Math.min(1, 
            this._currentTransition.elapsed / this._currentTransition.duration
        );
        
        // Check if transition is complete
        if (this._currentTransition.progress >= 1) {
            this._currentTransition.resolve();
            this._currentTransition = null;
            this._isTransitioning = false;
        }
    }
    
    /**
     * Render transition overlay
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderTransition(ctx) {
        if (!this._currentTransition) return;
        
        const transition = this._currentTransition;
        const progress = transition.entering ? 
            1 - transition.progress : transition.progress;
        
        switch (transition.type) {
            case 'fade':
                this._renderFadeTransition(ctx, progress);
                break;
            case 'slide':
                this._renderSlideTransition(ctx, progress, transition.entering);
                break;
            case 'wipe':
                this._renderWipeTransition(ctx, progress);
                break;
            default:
                console.warn(`[SceneManager] Unknown transition type: ${transition.type}`);
        }
    }
    
    /**
     * Render fade transition
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} progress Transition progress (0-1)
     * @private
     */
    _renderFadeTransition(ctx, progress) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
    
    /**
     * Render slide transition
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} progress Transition progress (0-1)
     * @param {boolean} entering Whether entering or exiting
     * @private
     */
    _renderSlideTransition(ctx, progress, entering) {
        ctx.save();
        
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const offset = entering ? 
            width * (1 - progress) : -width * progress;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(offset, 0, width, height);
        
        ctx.restore();
    }
    
    /**
     * Render wipe transition
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} progress Transition progress (0-1)
     * @private
     */
    _renderWipeTransition(ctx, progress) {
        ctx.save();
        
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const wipeWidth = width * progress;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, wipeWidth, height);
        
        ctx.restore();
    }
    
    /**
     * Emit scene event
     * @param {string} eventType Event type
     * @param {*} data Event data
     * @private
     */
    _emitEvent(eventType, data) {
        if (!this._eventListeners.has(eventType)) return;
        
        const listeners = this._eventListeners.get(eventType);
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[SceneManager] Error in event listener for ${eventType}:`, error);
            }
        });
    }
}

// =============================================================================
// BASE SCENE CLASS
// =============================================================================

/**
 * Base scene class that all scenes should extend
 */
export class Scene {
    /**
     * Initialize scene
     * @param {Object} options Scene options
     */
    constructor(options = {}) {
        this.options = options;
        this._initialized = false;
        this._paused = false;
        this._destroyed = false;
        
        // Scene lifecycle state
        this._state = 'created';
    }
    
    /**
     * Called when scene is added to stack
     */
    async enter() {
        this._state = 'entering';
        this._initialized = true;
        console.log(`[Scene] ${this.constructor.name} entered`);
        this._state = 'active';
    }
    
    /**
     * Called when scene is removed from stack
     */
    async exit() {
        this._state = 'exiting';
        console.log(`[Scene] ${this.constructor.name} exited`);
    }
    
    /**
     * Called when scene is paused by overlay
     */
    pause() {
        this._paused = true;
        this._state = 'paused';
        console.log(`[Scene] ${this.constructor.name} paused`);
    }
    
    /**
     * Called when scene is resumed from pause
     */
    resume() {
        this._paused = false;
        this._state = 'active';
        console.log(`[Scene] ${this.constructor.name} resumed`);
    }
    
    /**
     * Update scene logic
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (this._paused || this._destroyed) return;
        // Override in subclasses
    }
    
    /**
     * Render scene
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        if (this._destroyed) return;
        // Override in subclasses
    }
    
    /**
     * Clean up scene resources
     */
    destroy() {
        if (this._destroyed) return;
        
        this._destroyed = true;
        this._state = 'destroyed';
        console.log(`[Scene] ${this.constructor.name} destroyed`);
    }
    
    /**
     * Check if scene is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this._initialized;
    }
    
    /**
     * Check if scene is paused
     * @returns {boolean} True if paused
     */
    isPaused() {
        return this._paused;
    }
    
    /**
     * Check if scene is destroyed
     * @returns {boolean} True if destroyed
     */
    isDestroyed() {
        return this._destroyed;
    }
    
    /**
     * Get scene state
     * @returns {string} Current scene state
     */
    getState() {
        return this._state;
    }
}

// =============================================================================
// SCENE TRANSITION UTILITIES
// =============================================================================

/**
 * Scene transition presets
 */
export const SceneTransitions = {
    INSTANT: { transition: 'instant', duration: 0 },
    FADE_FAST: { transition: 'fade', duration: 0.3 },
    FADE_NORMAL: { transition: 'fade', duration: 0.5 },
    FADE_SLOW: { transition: 'fade', duration: 1.0 },
    SLIDE_LEFT: { transition: 'slide', duration: 0.5, direction: 'left' },
    SLIDE_RIGHT: { transition: 'slide', duration: 0.5, direction: 'right' },
    WIPE: { transition: 'wipe', duration: 0.4 }
};

/**
 * Scene types for organization
 */
export const SceneTypes = {
    MENU: 'menu',
    GAMEPLAY: 'gameplay',
    OVERLAY: 'overlay',
    LOADING: 'loading',
    CUTSCENE: 'cutscene'
};