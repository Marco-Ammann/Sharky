/**
 * @file Simple overlay UI that lets players tweak selected gameplay
 * variables at runtime. Values are defined in GameConfig.tunables. The overlay
 * is built with vanilla DOM elements so it works independently of the canvas.
 *
 * BUGS FIXED:
 * - ESC handler properly attached/detached
 * - Slider value synchronization improved
 * - Better error handling for localStorage
 * - Improved styling and responsiveness
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Settings overlay with improved event handling and styling
 */
export class SettingsOverlay {
    /**
     * Creates the settings overlay
     */
    constructor() {
        /** @private */ this._isVisible = false;
        /** @private */ this._root = document.createElement('div');
        this._root.id = 'settings-overlay';
        Object.assign(this._root.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            display: 'none',
            overflowY: 'auto',
            zIndex: '1000',
            fontFamily: 'Arial, sans-serif',
            padding: '0',
            boxSizing: 'border-box',
        });

        // Panel container for compact styling
        /** @private */ this._panel = document.createElement('div');
        Object.assign(this._panel.style, {
            maxWidth: '500px',
            margin: '60px auto',
            background: 'rgba(20, 20, 20, 0.95)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
            fontSize: '14px',
            border: '2px solid rgba(255,255,255,0.1)',
        });
        this._root.appendChild(this._panel);

        // Title
        const title = document.createElement('h2');
        title.textContent = 'Game Settings';
        Object.assign(title.style, {
            textAlign: 'center',
            margin: '0 0 20px 0',
            color: '#4af',
            fontSize: '20px',
            fontWeight: 'bold',
        });
        this._panel.appendChild(title);

        // Close hint
        const hint = document.createElement('p');
        hint.textContent = 'Press ESC to close';
        Object.assign(hint.style, {
            textAlign: 'center',
            fontSize: '12px',
            margin: '0 0 20px 0',
            opacity: '0.7',
            fontStyle: 'italic',
        });
        this._panel.appendChild(hint);

        // Build sliders from tunables
        this._buildControls();

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        Object.assign(closeBtn.style, {
            display: 'block',
            margin: '20px auto 0',
            padding: '8px 20px',
            backgroundColor: '#4af',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
        });
        closeBtn.addEventListener('click', () => this.hide());
        this._panel.appendChild(closeBtn);

        document.body.appendChild(this._root);

        // ESC handler - properly scoped
        /** @private */ this._handleKeyDown = (e) => {
            if (e.key === 'Escape' && this._isVisible) {
                this.hide();
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Click outside to close
        this._root.addEventListener('click', (e) => {
            if (e.target === this._root) {
                this.hide();
            }
        });
    }

    /**
     * Builds slider controls based on GameConfig.tunables structure.
     * IMPROVED: Better synchronization and error handling
     * @private
     */
    _buildControls() {
        const tunables = GameConfig.tunables;
        if (!tunables) {
            console.warn('No tunables found in GameConfig');
            return;
        }

        Object.entries(tunables).forEach(([groupKey, group]) => {
            // Group header
            const groupHeader = document.createElement('h3');
            groupHeader.textContent = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
            Object.assign(groupHeader.style, {
                margin: '20px 0 12px 0',
                fontSize: '16px',
                color: '#ffd700',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '5px',
            });
            this._panel.appendChild(groupHeader);

            Object.entries(group).forEach(([propKey, meta]) => {
                const wrapper = document.createElement('div');
                Object.assign(wrapper.style, {
                    marginBottom: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                });
                this._panel.appendChild(wrapper);

                const label = document.createElement('label');
                Object.assign(label.style, {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fff',
                });
                wrapper.appendChild(label);

                const range = document.createElement('input');
                range.type = 'range';
                range.title = meta.desc ?? meta.label ?? propKey;
                range.min = meta.min ?? 0;
                range.max = meta.max ?? 100;
                range.step = meta.step ?? 1;
                
                // Get current value safely
                const currentValue = GameConfig[groupKey]?.[propKey] ?? meta.min ?? 0;
                range.value = currentValue;
                
                Object.assign(range.style, {
                    width: '100%',
                    height: '25px',
                    accentColor: '#4af',
                    cursor: 'pointer',
                });
                wrapper.appendChild(range);

                // Value display
                const valueDisplay = document.createElement('span');
                Object.assign(valueDisplay.style, {
                    fontSize: '12px',
                    color: '#aaa',
                    textAlign: 'center',
                });
                wrapper.appendChild(valueDisplay);

                // Update functions
                const updateLabel = (val) => {
                    label.textContent = `${meta.label ?? propKey}: ${val}`;
                };
                
                const updateValueDisplay = (val) => {
                    valueDisplay.textContent = `${meta.min} ——— ${val} ——— ${meta.max}`;
                };

                // Initialize display
                updateLabel(currentValue);
                updateValueDisplay(currentValue);

                // Sync function with error handling
                const syncValue = (val) => {
                    try {
                        const numVal = parseFloat(val);
                        if (isNaN(numVal)) {
                            console.warn(`Invalid value for ${groupKey}.${propKey}:`, val);
                            return;
                        }
                        
                        // Update GameConfig
                        if (GameConfig[groupKey]) {
                            GameConfig[groupKey][propKey] = numVal;
                        }
                        
                        // Update UI
                        updateLabel(numVal);
                        updateValueDisplay(numVal);
                        
                        // Persist to localStorage
                        this._persist(groupKey, propKey, numVal);
                    } catch (error) {
                        console.error('Error syncing value:', error);
                    }
                };

                // Event listeners
                range.addEventListener('input', (e) => syncValue(e.target.value));
                range.addEventListener('change', (e) => syncValue(e.target.value));
            });
        });
    }

    /**
     * Save updated setting to localStorage with better error handling.
     * @param {string} group
     * @param {string} key
     * @param {number} value
     * @private
     */
    _persist(group, key, value) {
        try {
            const storageKey = 'sharkySettings';
            const existing = localStorage.getItem(storageKey);
            const data = existing ? JSON.parse(existing) : {};
            
            if (!data[group]) {
                data[group] = {};
            }
            data[group][key] = value;
            
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    /** 
     * Loads settings from localStorage and applies to GameConfig 
     * IMPROVED: Better error handling and validation
     */
    loadPersisted() {
        try {
            const storageKey = 'sharkySettings';
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;
            
            const data = JSON.parse(stored);
            
            Object.entries(data).forEach(([group, settings]) => {
                if (!GameConfig[group]) {
                    console.warn(`Unknown settings group: ${group}`);
                    return;
                }
                
                Object.entries(settings).forEach(([key, value]) => {
                    if (key in GameConfig[group]) {
                        GameConfig[group][key] = value;
                    } else {
                        console.warn(`Unknown setting: ${group}.${key}`);
                    }
                });
            });
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
    }

    /** Show overlay with proper event handling */
    show() {
        if (this._isVisible) return;
        
        this._isVisible = true;
        this._root.style.display = 'block';
        
        // Attach ESC handler
        document.addEventListener('keydown', this._handleKeyDown, true);
        
        // Focus management
        this._panel.focus();
    }

    /** Hide overlay with proper cleanup */
    hide() {
        if (!this._isVisible) return;
        
        this._isVisible = false;
        this._root.style.display = 'none';
        
        // Remove ESC handler
        document.removeEventListener('keydown', this._handleKeyDown, true);
    }

    /** Toggle visibility */
    toggle() {
        if (this._isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}