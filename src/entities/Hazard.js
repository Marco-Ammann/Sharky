/**
 * @file Timed environmental hazard such as a poison cloud or spike that periodically activates.
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets['images']} ImageAssets
 */

export class Hazard {
    /**
     * @param {{ x:number; y:number; width:number; height:number; img?:CanvasImageSource; cycle?:number }} opts
     *  cycle — total seconds for one active+inactive cycle. Active half deals damage.
     */
    constructor({ x, y, width, height, img = null, cycle = 3 }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        /** @private */ this._img = img;
        /** @private */ this._cycle = cycle;
        /** @private */ this._timer = 0;
    }

    /**
     * Whether the hazard is currently active (damaging).
     * @returns {boolean}
     */
    isActive() {
        return this._timer % this._cycle < this._cycle / 2;
    }

    /**
     * @param {number} dt
     * @returns {boolean} True if should be removed (never for static hazard)
     */
    update(dt) {
        this._timer += dt;
        return false;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const alpha = this.isActive() ? 1 : 0.4;
        ctx.globalAlpha = alpha;
        if (this._img) {
            ctx.drawImage(this._img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = GameConfig.hazard.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Axis-aligned bounding box helper
     */
    getAabb() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * Collision with rect
     * @param {{x:number,y:number,w:number,h:number}} rect
     */
    intersectsRect(rect) {
        return (
            rect.x < this.x + this.width &&
            rect.x + rect.w > this.x &&
            rect.y < this.y + this.height &&
            rect.y + rect.h > this.y
        );
    }
}
