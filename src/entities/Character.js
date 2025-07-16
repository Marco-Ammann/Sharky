/**
 * @file Lightweight Character entity extracted from the legacy game.
 * Only handles horizontal/vertical movement, basic animation swapping and draw.
 * Driven entirely by the main PlayScene's update loop – no internal timers.
 */

import { InputManager } from '../managers/InputManager.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets} LoadedAssets
 */

/**
 *
 */
export class Character {
    /**
     * @param {{ x?: number; y?: number; width?: number; height?: number;
     *           assets: LoadedAssets['images'];
     *           input: InputManager }} opts
     */
    constructor({ x = 100, y = 200, width = 120, height = 100, assets, input, onBubble = null }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        /** @private */
        this._input = input;

        // Prepare frame sets – keys are defined in the manifest
        /** @private */ this._swimFrames = [
            assets['shark_swim1'],
            assets['shark_swim2'],
            assets['shark_swim3'],
            assets['shark_swim4'],
            assets['shark_swim5'],
            assets['shark_swim6'],
        ];
        /** @private */ this._idleFrames = [
            assets['shark_idle1'],
            assets['shark_idle2'],
            assets['shark_idle3'],
            assets['shark_idle4'],
            assets['shark_idle5'],
            assets['shark_idle6'],
        ];

        /** @private */ this._bubbleFrames = [
            assets['shark_bubble1'],
            assets['shark_bubble2'],
            assets['shark_bubble3'],
            assets['shark_bubble4'],
            assets['shark_bubble5'],
            assets['shark_bubble6'],
            assets['shark_bubble7'],
            assets['shark_bubble8'],
        ];

        /** @private */ this._attackFrames = [
            assets['shark_attack1'],
            assets['shark_attack2'],
            assets['shark_attack3'],
            assets['shark_attack4'],
            assets['shark_attack5'],
            assets['shark_attack6'],
            assets['shark_attack7'],
            assets['shark_attack8'],
        ];

        /** @private */ this._frames = this._idleFrames;

        /** @private */ this._currentFrame = 0;
        /** @private */ this._frameTimer = 0;
        /** @private */ this._frameDuration = 0.1; // seconds per frame

        /** @private */ this._speed = GameConfig.character.speed; // pixels per second
        /** @private */ this._facingLeft = false;

        /** @private */ this._onBubble = onBubble;
        /** @private */ this._bubbleCooldown = 0; // seconds

        /** @private */ this._isAttacking = false;
        /** @private */ this._attackTimer = 0; // seconds
        /** @private */ this._attackDuration = 0.5;
        /** @private */ this._prevAttack = false;

        /** @private */ this._invulnTimer = 0; // seconds of invulnerability after hit

        /** @private */ this._bubbleAnim = false;
        /** @private */ this._bubbleTimer = 0; // seconds
        /** @private */ this._bubbleDuration = GameConfig.bubble.formationDuration;
        /** @private */ this._pendingBubble = false;
    }

    /**
     * Update position & animation.
     * @param {number} dt Delta time (seconds)
     */
    update(dt) {
        // Handle invulnerability timer
        if (this._invulnTimer > 0) {
            this._invulnTimer -= dt;
            if (this._invulnTimer < 0) this._invulnTimer = 0;
        }
        // Refresh speed from GameConfig in case settings changed
        this._speed = GameConfig.character.speed;

        // Cooldown timer
        if (this._bubbleCooldown > 0) {
            this._bubbleCooldown -= dt;
        }
        // Determine movement input
        const movingLeft = this._input.isActive('left');
        const movingRight = this._input.isActive('right');
        const movingUp = this._input.isActive('up');
        const movingDown = this._input.isActive('down');

        // Movement
        if (movingLeft) this.x -= this._speed * dt;
        if (movingRight) this.x += this._speed * dt;
        if (movingUp) this.y -= this._speed * dt;
        if (movingDown) this.y += this._speed * dt;

        // Update facing
        if (movingLeft) this._facingLeft = true;
        else if (movingRight) this._facingLeft = false;

        // Vertical clamp within canvas; horizontal clamp occurs in PlayScene based on level width.
        const padTop = 30; // allow sprite head room
        const padBottom = 15; // reduced bottom padding

        this.y = Math.max(-padTop, Math.min(480 - this.height + padBottom, this.y));

        // Determine movement state
        // Handle attack input
        const attackPressed = this._input.isActive('attack');
        if (attackPressed && !this._prevAttack) {
            if (this._bubbleCooldown <= 0 && !this._bubbleAnim && !this._isAttacking) {
                // Begin bubble formation animation; bubble spawns near the end
                this._bubbleAnim = true;
                this._bubbleTimer = this._bubbleDuration;
                this._pendingBubble = true;
                this._frames = this._bubbleFrames;
                this._currentFrame = 0;
                this._frameTimer = 0;
            } else if (!this._isAttacking && !this._bubbleAnim) {
                this._isAttacking = true;
                this._attackTimer = this._attackDuration;
                this._frames = this._attackFrames;
                this._currentFrame = 0;
                this._frameTimer = 0;
            }
        }
        this._prevAttack = attackPressed;

        const isMoving = movingLeft || movingRight || movingUp || movingDown;

        if (this._bubbleAnim) {
            this._bubbleTimer -= dt;
            if (this._pendingBubble && this._bubbleTimer <= GameConfig.bubble.projSpawnDelay) {
                const spawnX = this._facingLeft ? this.x : this.x + this.width;
                const spawnY = this.y + this.height * GameConfig.bubble.spawnOffsetY;
                if (this._onBubble) this._onBubble(spawnX, spawnY, this._facingLeft);
                this._bubbleCooldown = GameConfig.bubble.cooldown;
                this._pendingBubble = false;
            }
            if (this._bubbleTimer <= 0) {
                this._bubbleAnim = false;
            }
        }

        if (this._isAttacking) {
            this._attackTimer -= dt;
            if (this._attackTimer <= 0) {
                this._isAttacking = false;
            }
        }

        // Choose frame set priority: attack > bubble > movement/idle
        let targetSet;
        if (this._isAttacking) targetSet = this._attackFrames;
        else if (this._bubbleAnim) targetSet = this._bubbleFrames;
        else targetSet = isMoving ? this._swimFrames : this._idleFrames;
        if (this._frames !== targetSet) {
            this._frames = targetSet;
            this._currentFrame = 0;
            this._frameTimer = 0;
        }

        // Adapt animation speed.
        if (this._isAttacking || this._bubbleAnim) this._frameDuration = 0.06;
        else this._frameDuration = isMoving ? 0.08 : 0.18;

        // Animation frame step
        this._frameTimer += dt;
        if (this._frameTimer >= this._frameDuration) {
            this._frameTimer -= this._frameDuration;
            this._currentFrame = (this._currentFrame + 1) % this._frames.length;
        }
    }

    /**
     * Draw the character.
     * @param {CanvasRenderingContext2D} ctx
     */
    /** Whether a melee attack is active */
    isAttacking() {
        return this._isAttacking;
    }

    /** Returns attack hitbox {x,y,w,h} in world coords */
    getBubbleCdRemaining() {
        return this._bubbleCooldown;
    }

    /**
     *
     */
    getAttackBox() {
        if (!this._isAttacking) return null;
        const size = 40;
        const x = this._facingLeft ? this.x - size : this.x + this.width;
        const y = this.y + this.height * 0.3;
        return { x, y, w: size, h: size };
    }

    /** Returns true if character can take a hit */
    canBeHit() {
        return this._invulnTimer === 0;
    }

    /** Apply damage; returns true if hit was registered */
    takeHit() {
        if (!this.canBeHit()) return false;
        this._invulnTimer = GameConfig.character.invulnTime;
        return true;
    }

    /**
     *
     * @param ctx
     */
    render(ctx) {
        const img = this._frames[this._currentFrame];
        if (!img) return;

        ctx.save();
        if (this._invulnTimer > 0) {
            // Blink effect during invulnerability
            const blinkOn = Math.floor(this._invulnTimer * 10) % 2 === 0;
            ctx.globalAlpha = blinkOn ? 0.3 : 1;
        }
        if (this._facingLeft) {
            // Flip horizontally around character centre
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}
