/**
 * @file Simple projectile bubble fired by Sharky.
 * Travels horizontally, pops after `lifespan` seconds.
 */

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets['images']} ImageAssets
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Bubble projectile entity fired by Sharky.
 * Handles horizontal motion, lifespan countdown, pop animation and sound.
 */
export class Bubble {
    /**
     * @param {{ x:number; y:number; directionLeft:boolean; assets: ImageAssets }} opts Bubble creation options.
     */
    constructor({ x, y, directionLeft, assets, audio = null, sounds = {} }) {
        this.x = x;
        this.y = y;
        this.radius = GameConfig.bubble.radius;
        this._speed = GameConfig.bubble.speed * (directionLeft ? -1 : 1);
        this._lifespan = GameConfig.bubble.lifespan; // seconds

        /** @private */ this._audio = audio;
        /** @private */ this._sounds = sounds;
        /** @private */ this._popping = false;
        /** @private */ this._popTimer = 0; // seconds

        // Use bubble sprite if provided
        this._img = assets?.bubble ?? null;
        if (this._img) {
            this._drawSize = GameConfig.bubble.radius * 2 * 1.5; // scale sprite relative to radius
            this.radius = this._drawSize / 2;
        }
    }

    /**
     * @returns {boolean} true if bubble should be removed
     */
    /**
     * Force the bubble to start its pop animation immediately.
     * Typically used when a collision occurs.
     */
    startPop() {
        if (!this._popping) {
            if (this._audio && this._sounds?.bubble_pop) {
                this._audio.playSfx(this._sounds.bubble_pop.src, 0.9);
            }
            this._lifespan = 0;
        }
    }

    /**
     * Update bubble state for the current frame.
     * @param {number} dt Delta time in seconds.
     * @returns {boolean} True if the bubble should be removed.
     */
    update(dt) {
        if (this._popping) {
            this._popTimer -= dt;
            const progress = Math.max(0, this._popTimer) / 0.4;
            this.radius = (this._drawSize / 2) * progress;
            return this._popTimer <= 0;
        }

        this.x += this._speed * dt;
        this._lifespan -= dt;
        if (this._lifespan <= 0) {
            // Start popping effect (0.4 s)
            if (this._audio && this._sounds?.bubble_pop) {
                this._audio.playSfx(this._sounds.bubble_pop.src, 0.9);
            }
            this._popping = true;
            this._popTimer = 0.4;
            // Stop horizontal movement
            this._speed = 0;
        }
        return false;
    }

    /**
     * Render the bubble to the canvas.
     * @param {CanvasRenderingContext2D} ctx 2D rendering context.
     */
    render(ctx) {
        // Fade alpha during pop
        const alpha = this._popping ? Math.max(0, this._popTimer / 0.4) : 1;
        ctx.globalAlpha = alpha;

        if (this._img) {
            ctx.drawImage(
                this._img,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        } else {
            ctx.fillStyle = `rgba(173, 216, 230, ${0.6 * alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.9 * alpha})`;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}
