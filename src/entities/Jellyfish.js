/**
 * @file Jellyfish enemy entity – swims vertically in a sinus pattern.
 */

import { GameConfig } from '../config/GameConfig.js';

export class Jellyfish {
    /**
     * @param {{ x:number; y:number; img?:CanvasImageSource; amplitude?:number; phase?:number }} opts
     */
    constructor({ x, y, img = null, amplitude = GameConfig.jellyfish.amplitude, phase = 0 }) {
        this.x = x;
        this._baseY = y;
        this.y = y;
        this.width = GameConfig.jellyfish.size;
        this.height = GameConfig.jellyfish.size;
        /** @private */ this._img = img;
        /** @private */ this._t = phase; // internal timer
    }

    /**
     * @param {number} dt
     * @returns {boolean} true if removed/dead
     */
    /** Returns bounding circle radius */
    get radius() {
        return Math.max(this.width, this.height) * 0.4;
    }

    /**
     * Update jellyfish position.
     * @param {number} dt
     * @param {{x:number,y:number}} [_player] Ignored for now but kept for signature parity
     * @returns {boolean} always false (alive)
     */
    update(dt, _player) {
        this._t += dt * GameConfig.jellyfish.speed;
        // Sinusoidal vertical motion
        this.y = this._baseY + Math.sin(this._t) * GameConfig.jellyfish.amplitude;
        return false; // stays alive until killed externally
    }

    /**
     * Axis-aligned bounding box collision with rectangle.
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

    /**
     * @param {{x:number,y:number,r:number}} circle
     */
    intersectsCircle(circle) {
        const cx = circle.x;
        const cy = circle.y;
        const closestX = Math.max(this.x, Math.min(cx, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(cy, this.y + this.height));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return dx * dx + dy * dy < circle.r * circle.r;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (this._img) {
            ctx.drawImage(this._img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#0ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
