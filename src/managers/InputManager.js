/**
 * @file Centralised keyboard + touch input manager.
 * Keeps track of which actions are currently active and provides
 * a simple subscription API for other systems (e.g. Character controller).
 *
 * All key / touch bindings map to logical **actions** ("left", "right", etc.)
 * so the rest of the game never deals with raw keycodes.
 */

/**
 * @typedef {('left'|'right'|'up'|'down'|'attack'|'pause')} InputAction
 */

/**
 *
 */
export class InputManager {
    /**
     * Creates the manager and sets up DOM listeners automatically.
     */
    constructor() {
        /** @private */
        this._active = new Set();

        /** @private */
        this._listeners = new Map();

        /** @private */
        this._keyBindings = this._createDefaultKeyBindings();

        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);

        window.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('keyup', this._handleKeyUp);

        // Touch bindings can be customised later. Look for any element with
        // `[data-action]` attribute.
        document.body.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        document.body.addEventListener('touchend', this._handleTouchEnd, { passive: false });
    }

    /**
     * Checks if the given action is currently active.
     * @param {InputAction} action
     * @returns {boolean}
     */
    isActive(action) {
        return this._active.has(action);
    }

    /**
     * Subscribe to action changes.
     * @param {InputAction} action  The action to observe.
     * @param {(active:boolean)=>void} callback  Invoked whenever the action is pressed/released.
     * @returns {()=>void} Unsubscribe function.
     */
    onAction(action, callback) {
        if (!this._listeners.has(action)) {
            this._listeners.set(action, new Set());
        }
        const set = this._listeners.get(action);
        set.add(callback);
        return () => set.delete(callback);
    }

    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------

    /** @typedef {{[code:string]: InputAction}} KeyBindings */

    /**
     * @returns {KeyBindings}
     * @private
     */
    _createDefaultKeyBindings() {
        return {
            ArrowLeft: 'left',
            KeyA: 'left',
            ArrowRight: 'right',
            KeyD: 'right',
            ArrowUp: 'up',
            KeyW: 'up',
            ArrowDown: 'down',
            KeyS: 'down',
            Space: 'attack',
            KeyK: 'attack',
            Escape: 'pause',
        };
    }

    /** @param {KeyboardEvent} e */
    _handleKeyDown(e) {
        const action = this._keyBindings[e.code];
        if (action) {
            if (!this._active.has(action)) {
                this._active.add(action);
                this._emit(action, true);
            }
        }
    }

    /** @param {KeyboardEvent} e */
    _handleKeyUp(e) {
        const action = this._keyBindings[e.code];
        if (action) {
            if (this._active.has(action)) {
                this._active.delete(action);
                this._emit(action, false);
            }
        }
    }

    /** @param {TouchEvent} e */
    _handleTouchStart(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const action = target?.dataset?.action;
        if (action) {
            e.preventDefault();
            if (!this._active.has(action)) {
                this._active.add(action);
                this._emit(/** @type {InputAction} */ (action), true);
            }
        }
    }

    /** @param {TouchEvent} e */
    _handleTouchEnd(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const action = target?.dataset?.action;
        if (action) {
            e.preventDefault();
            if (this._active.has(action)) {
                this._active.delete(action);
                this._emit(/** @type {InputAction} */ (action), false);
            }
        }
    }

    /**
     * Emits action change to subscribers.
     * @param {InputAction} action
     * @param {boolean} state
     * @private
     */
    _emit(action, state) {
        const set = this._listeners.get(action);
        if (!set) return;
        set.forEach((fn) => fn(state));
    }
}
