/**
 * @file Collectible coin entity.
 * IMPROVED: Better debugging and rendering
 */

import { GameConfig } from '../config/GameConfig.js';

export class Coin {
    /**
     * @param {{ x:number; y:number; img?:CanvasImageSource }} opts
     */
    constructor({ x, y, img = null }) {
        this.x = x;
        this.y = y;
        this.width = GameConfig.coin.size;
        this.height = GameConfig.coin.size;
        
        /** @private */ this._img = img;
        /** @private */ this._collected = false;
        
        // Debug: log coin creation
        console.log(`[Coin] Created at (${x}, ${y}) with size ${this.width}x${this.height}`);
    }

    /**
     * Collision check with player rect.
     * IMPROVED: Better debugging
     * @param {{x:number,y:number,w:number,h:number}} rect
     */
    intersectsRect(rect) {
        const intersects = (
            rect.x < this.x + this.width &&
            rect.x + rect.w > this.x &&
            rect.y < this.y + this.height &&
            rect.y + rect.h > this.y
        );
        
        // Debug collision detection
        if (intersects) {
            console.log(`[Coin] Collision detected! Coin(${this.x}, ${this.y}) vs Player(${rect.x}, ${rect.y})`);
        }
        
        return intersects;
    }

    /**
     * Update coin (currently static)
     * @returns {boolean} true if should be removed
     */
    update() {
        return this._collected;
    }

    /**
     * Mark coin as collected
     */
    collect() {
        this._collected = true;
        console.log(`[Coin] Collected at (${this.x}, ${this.y})`);
    }

    /**
     * Check if coin is collected
     * @returns {boolean}
     */
    isCollected() {
        return this._collected;
    }

    /**
     * Render coin with improved fallback
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (this._collected) {
            return; // Don't render collected coins
        }

        if (this._img) {
            // Draw coin image
            ctx.drawImage(this._img, this.x, this.y, this.width, this.height);
        } else {
            // Fallback: draw golden circle with shine effect
            ctx.save();
            
            // Main gold circle
            ctx.fillStyle = GameConfig.coin.color;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Inner shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2 - 3,
                this.y + this.height / 2 - 3,
                this.width / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Border
            ctx.strokeStyle = '#B8860B'; // Dark goldenrod
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            ctx.restore();
        }
    }
}