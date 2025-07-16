/**
 * @file Static obstacle or hazard that the player and projectiles can collide with.
 * Can optionally deal damage on contact (e.g. poisonous coral).
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets['images']} ImageAssets
 */

export class Obstacle {
    /**
     * @param {{ x:number; y:number; width:number; height:number; img?:CanvasImageSource; damage?:boolean }} opts
     *  x, y               — world-space top-left corner.
     *  width, height      — size in pixels.
     *  img                — optional sprite to draw; falls back to filled rect.
     *  damage             — true if it should hurt the player on contact.
     */
    constructor({ x, y, width, height, img = null, damage = false }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        /** @private */ this._img = img;
        /** @private */ this._damage = damage;
        /** @private */ this._dead = false; // allows removal if needed in future
    }

    /**
     * @returns {{x:number,y:number,w:number,h:number}} Axis-aligned bounding box.
     */
    getAabb() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * @param {number} dt Delta time (seconds). Currently static; returns false to keep alive.
     * @returns {boolean} True if the obstacle should be removed from the scene.
     */
    update(dt) {
        return this._dead;
    }

    /**
     * Draw obstacle sprite or placeholder.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (this._img) {
            ctx.drawImage(this._img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this._damage ? 'purple' : 'slategray';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Check AABB collision with the specified rectangle.
     * @param {{x:number,y:number,w:number,h:number}} rect
     * @returns {boolean}
     */
    intersectsRect(rect) {
        return (
            rect.x < this.x + this.width &&
            rect.x + rect.w > this.x &&
            rect.y < this.y + this.height &&
            rect.y + rect.h > this.y
        );
    }

    /**
     * Check circle collision (for bubble).
     * @param {{x:number,y:number,r:number}} circle centre/ radius
     * @returns {boolean}
     */
    intersectsCircle(circle) {
        // Clamp point to AABB
        const cx = Math.max(this.x, Math.min(circle.x, this.x + this.width));
        const cy = Math.max(this.y, Math.min(circle.y, this.y + this.height));
        const dx = circle.x - cx;
        const dy = circle.y - cy;
        return dx * dx + dy * dy < circle.r * circle.r;
    }

    /**
     * Whether this obstacle should damage the player on contact.
     * @returns {boolean}
     */
    isDamaging() {
        return this._damage;
    }
}
