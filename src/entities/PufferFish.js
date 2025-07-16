/**
 * @file Simple Puffer Fish enemy that swims horizontally and bounces
 * off screen edges. When hit by a bubble it is removed (placeholder death).
 */

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets['images']} ImageAssets
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 *
 */
export class PufferFish {
    /**
     * @param {{ x:number; y:number; directionLeft:boolean; assets: ImageAssets }} opts
     */
    constructor({ x, y, directionLeft, assets, sounds = {}, audio = null }) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 60;

        /** @private */ this._audio = audio;
        /** @private */ this._sounds = sounds;

        // Animation frames (swim)
        /** @private */ this._frames = [
            assets['puffer_swim1'],
            assets['puffer_swim2'],
            assets['puffer_swim3'],
            assets['puffer_swim4'],
            assets['puffer_swim5'],
        ];
        /** @private */ this._currentFrame = 0;
        /** @private */ this._frameTimer = 0;
        /** @private */ this._frameDuration = GameConfig.puffer.frameDuration;

        // Movement
        /** @private */ this._speed = GameConfig.puffer.speed * (directionLeft ? -1 : 1);

        /** @private */ this._inflated = false;
        /** @private */ this._inflateTimer = 0; // seconds
    }

    /** Returns bounding circle radius */
    get radius() {
        return Math.max(this.width, this.height) * 0.4;
    }

    /**
     * Update position & animation
     * @param {number} dt
     * @param {{x:number,y:number}} [player] Optional player position for proximity detection
     * @returns {boolean} true if should be removed (dead)
     */
    update(dt, player) {
        this.x += this._speed * dt;

        // Proximity check for inflate
        if (player) {
            const dx = this.x + this.width / 2 - player.x;
            const dy = this.y + this.height / 2 - player.y;
            const distSq = dx * dx + dy * dy;
            if (
                !this._inflated &&
                distSq < GameConfig.puffer.inflateProximity * GameConfig.puffer.inflateProximity
            ) {
                this._inflated = true;
                if (this._audio && this._sounds?.puffer_inflate) {
                    this._audio.playSfx(this._sounds.puffer_inflate.src, 0.6);
                }
                this._inflateTimer = GameConfig.puffer.inflateDuration; // stay inflated
            }
        }

        // Inflate/deflate behaviour
        if (this._inflated) {
            this._inflateTimer -= dt;
            if (this._inflateTimer <= 0) {
                this._inflated = false;
            }
        }

        // Bounce at screen edges (assuming 720x480 gameplay area like Character bounds)
        if (this.x < 0) {
            this.x = 0;
            this._speed *= -1;
        } else if (this.x + this.width > 720) {
            this.x = 720 - this.width;
            this._speed *= -1;
        }

        this._frameTimer += dt;
        if (this._frameTimer >= this._frameDuration) {
            this._frameTimer -= this._frameDuration;
            this._currentFrame = (this._currentFrame + 1) % this._frames.length;
        }

        return false; // alive by default
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const img = this._frames[this._currentFrame];
        const scale = this._inflated ? 1.6 : 1;
        const drawW = this.width * scale;
        const drawH = this.height * scale;
        const drawX = this.x + (this.width - drawW) / 2;
        const drawY = this.y + (this.height - drawH) / 2;

        if (img) {
            ctx.save();
            if (this._speed > 0) {
                // Flip horizontally around image center
                ctx.translate(drawX + drawW, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, drawY, drawW, drawH);
            } else {
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(drawX + drawW / 2, drawY + drawH / 2, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
