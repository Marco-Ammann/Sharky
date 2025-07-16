/**
 * @file End Boss entity with complete state machine implementation.
 * Features multiple attack patterns, phase-based difficulty, and proper cleanup.
 * 
 * IMPROVEMENTS:
 * - Full state machine (Idle, Patrol, Attack phases)
 * - Multiple attack patterns (Charge, Projectile Volley, Slam)
 * - Phase-based difficulty scaling
 * - Memory leak prevention with proper cleanup
 * - Smooth animations and state transitions
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Boss states enum for clear state management
 */
const BossState = {
    SPAWNING: 'spawning',
    IDLE: 'idle', 
    PATROL: 'patrol',
    PREPARING_ATTACK: 'preparing_attack',
    ATTACKING: 'attacking',
    HURT: 'hurt',
    DEATH: 'death'
};

/**
 * Attack types for varied boss behavior
 */
const AttackType = {
    CHARGE: 'charge',
    PROJECTILE_VOLLEY: 'projectile_volley',
    SLAM: 'slam'
};

/**
 * Complete End Boss implementation with state machine
 */
export class EndBoss {
    /**
     * @param {Object} options Configuration object
     * @param {number} options.x Starting X position
     * @param {number} options.y Starting Y position  
     * @param {import('../managers/AudioManager.js').AudioManager} options.audio Audio manager reference
     */
    constructor({ x, y, audio }) {
        // Position & Movement
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.vx = 0;
        this.vy = 0;
        
        // Dimensions from config
        this.width = GameConfig.endBoss.width;
        this.height = GameConfig.endBoss.height;
        
        // Health system
        this.hpMax = GameConfig.endBoss.hp;
        this.hp = this.hpMax;
        
        // State machine
        this.state = BossState.SPAWNING;
        this.stateTime = 0;
        this.lastAttackTime = 0;
        
        // Movement patterns
        this.patrolLeft = GameConfig.endBoss.bounds.left;
        this.patrolRight = GameConfig.endBoss.bounds.right;
        this.patrolDirection = 1; // 1 = right, -1 = left
        
        // Attack system
        this.attackPattern = null;
        this.attackTimer = 0;
        this.projectileSpawnCallback = null;
        this.lastPlayerPos = { x: 0, y: 0 };
        
        // Phase system (gets harder as HP decreases)
        this.currentPhase = 1;
        this.phaseTransitionPlayed = false;
        
        // Animation system
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.1; // seconds per frame
        
        // Visual effects
        this.hurtFlashTimer = 0;
        this.screenShakeIntensity = 0;
        
        // Audio
        this.audio = audio;
        
        // Cleanup tracking
        this.isDestroyed = false;
        
        // Spawn animation
        this.spawnAnimProgress = 0;
        this.spawnDuration = 2.0; // seconds
        
        console.log('[EndBoss] Boss spawned at', { x, y, phase: this.currentPhase });
    }
    
    /**
     * Main update loop with state machine logic
     * @param {number} dt Delta time in seconds
     * @param {Object} playerPos Player position {x, y}
     * @param {Function} spawnProjectile Callback to spawn projectiles
     * @returns {boolean} True if boss should be removed
     */
    update(dt, playerPos, spawnProjectile) {
        if (this.isDestroyed) return true;
        
        // Store references
        this.lastPlayerPos = { ...playerPos };
        this.projectileSpawnCallback = spawnProjectile;
        
        // Update timers
        this.stateTime += dt;
        this.animTimer += dt;
        this.hurtFlashTimer = Math.max(0, this.hurtFlashTimer - dt);
        this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 2);
        
        // Update animation frame
        if (this.animTimer >= this.animSpeed) {
            this.animFrame = (this.animFrame + 1) % 8; // 8 frames total
            this.animTimer = 0;
        }
        
        // Check phase transitions
        this._updatePhase();
        
        // State machine
        switch (this.state) {
            case BossState.SPAWNING:
                this._updateSpawning(dt);
                break;
            case BossState.IDLE:
                this._updateIdle(dt);
                break;
            case BossState.PATROL:
                this._updatePatrol(dt);
                break;
            case BossState.PREPARING_ATTACK:
                this._updatePreparingAttack(dt);
                break;
            case BossState.ATTACKING:
                this._updateAttacking(dt);
                break;
            case BossState.HURT:
                this._updateHurt(dt);
                break;
            case BossState.DEATH:
                this._updateDeath(dt);
                break;
        }
        
        // Apply movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Clamp to patrol bounds
        this.x = Math.max(this.patrolLeft, Math.min(this.patrolRight - this.width, this.x));
        
        return this.state === BossState.DEATH && this.stateTime > 3.0;
    }
    
    /**
     * Render boss with current state animations
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        if (this.isDestroyed) return;
        
        ctx.save();
        
        // Hurt flash effect
        if (this.hurtFlashTimer > 0) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = 'red';
        }
        
        // Screen shake offset
        const shakeX = this.screenShakeIntensity * (Math.random() - 0.5) * 10;
        const shakeY = this.screenShakeIntensity * (Math.random() - 0.5) * 10;
        
        // Spawn animation scaling
        let scale = 1;
        if (this.state === BossState.SPAWNING) {
            scale = this.spawnAnimProgress * 0.8 + 0.2; // Scale from 0.2 to 1.0
        }
        
        // Death animation
        if (this.state === BossState.DEATH) {
            scale = Math.max(0.1, 1 - this.stateTime * 0.3);
            ctx.globalAlpha = Math.max(0.1, 1 - this.stateTime * 0.5);
        }
        
        // Apply transformations
        ctx.translate(this.x + this.width/2 + shakeX, this.y + this.height/2 + shakeY);
        ctx.scale(scale, scale);
        ctx.translate(-this.width/2, -this.height/2);
        
        // Boss body (placeholder - in real game would use sprite)
        this._renderBossSprite(ctx);
        
        // State-specific visual effects
        if (this.state === BossState.PREPARING_ATTACK) {
            this._renderChargeEffect(ctx);
        }
        
        // Phase indicator
        if (this.currentPhase > 1) {
            this._renderPhaseIndicator(ctx);
        }
        
        ctx.restore();
        
        // Debug info
        if (process.env.NODE_ENV === 'development') {
            ctx.fillStyle = 'yellow';
            ctx.font = '12px Arial';
            ctx.fillText(`State: ${this.state}`, this.x, this.y - 20);
            ctx.fillText(`Phase: ${this.currentPhase}`, this.x, this.y - 35);
            ctx.fillText(`HP: ${this.hp}/${this.hpMax}`, this.x, this.y - 50);
        }
    }
    
    /**
     * Handle taking damage with state transitions
     * @param {number} damage Damage amount
     * @returns {boolean} True if boss died
     */
    takeDamage(damage) {
        if (this.isDestroyed || this.state === BossState.DEATH) return false;
        
        this.hp = Math.max(0, this.hp - damage);
        this.hurtFlashTimer = 0.2;
        this.screenShakeIntensity = 0.5;
        
        console.log(`[EndBoss] Took ${damage} damage, HP: ${this.hp}/${this.hpMax}`);
        
        // Play hurt sound
        if (this.audio) {
            // Would play hurt sound here
        }
        
        if (this.hp <= 0) {
            this._transitionToState(BossState.DEATH);
            return true;
        } else {
            // Interrupt current action with hurt state
            if (this.state !== BossState.HURT) {
                this._transitionToState(BossState.HURT);
            }
            return false;
        }
    }
    
    /**
     * Check if boss is dead
     * @returns {boolean} True if dead
     */
    isDead() {
        return this.hp <= 0 || this.state === BossState.DEATH;
    }
    
    /**
     * Get collision circle for hit detection
     * @returns {Object} Circle with x, y, r properties
     */
    getCollisionCircle() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            r: Math.min(this.width, this.height) * 0.4
        };
    }
    
    /**
     * Clean up resources to prevent memory leaks
     */
    destroy() {
        this.isDestroyed = true;
        this.projectileSpawnCallback = null;
        this.audio = null;
        this.lastPlayerPos = null;
        console.log('[EndBoss] Boss destroyed and cleaned up');
    }
    
    // =============================================================================
    // STATE MACHINE METHODS
    // =============================================================================
    
    /**
     * Handle spawning animation state
     * @param {number} dt Delta time
     * @private
     */
    _updateSpawning(dt) {
        this.spawnAnimProgress = Math.min(1, this.stateTime / this.spawnDuration);
        
        if (this.spawnAnimProgress >= 1) {
            this._transitionToState(BossState.IDLE);
        }
    }
    
    /**
     * Handle idle state - brief pause between actions
     * @param {number} dt Delta time
     * @private
     */
    _updateIdle(dt) {
        this.vx = 0;
        this.vy = 0;
        
        if (this.stateTime > 0.5) {
            this._transitionToState(BossState.PATROL);
        }
    }
    
    /**
     * Handle patrol state - move back and forth
     * @param {number} dt Delta time
     * @private
     */
    _updatePatrol(dt) {
        const speed = GameConfig.endBoss.speed * this._getPhaseSpeedMultiplier();
        this.vx = speed * this.patrolDirection;
        
        // Change direction at bounds
        if (this.x <= this.patrolLeft) {
            this.patrolDirection = 1;
        } else if (this.x >= this.patrolRight - this.width) {
            this.patrolDirection = -1;
        }
        
        // Check if should attack
        const timeSinceLastAttack = this.stateTime - this.lastAttackTime;
        const attackDelay = GameConfig.endBoss.attackDelay * this._getPhaseAttackDelayMultiplier();
        
        if (timeSinceLastAttack > attackDelay) {
            this._transitionToState(BossState.PREPARING_ATTACK);
        }
    }
    
    /**
     * Handle preparing attack state
     * @param {number} dt Delta time
     * @private
     */
    _updatePreparingAttack(dt) {
        this.vx = 0;
        
        if (this.stateTime > 0.8) {
            this._selectAttackPattern();
            this._transitionToState(BossState.ATTACKING);
        }
    }
    
    /**
     * Handle attacking state with different patterns
     * @param {number} dt Delta time
     * @private
     */
    _updateAttacking(dt) {
        switch (this.attackPattern) {
            case AttackType.CHARGE:
                this._updateChargeAttack(dt);
                break;
            case AttackType.PROJECTILE_VOLLEY:
                this._updateProjectileVolley(dt);
                break;
            case AttackType.SLAM:
                this._updateSlamAttack(dt);
                break;
        }
    }
    
    /**
     * Handle hurt state - brief stun
     * @param {number} dt Delta time
     * @private
     */
    _updateHurt(dt) {
        this.vx = 0;
        
        if (this.stateTime > 0.5) {
            this._transitionToState(BossState.IDLE);
        }
    }
    
    /**
     * Handle death state
     * @param {number} dt Delta time
     * @private
     */
    _updateDeath(dt) {
        this.vx = 0;
        this.vy = 20; // Sink down
        
        if (this.stateTime > 1.0) {
            // Play death sound once
            if (this.audio && !this.deathSoundPlayed) {
                // Would play death sound here
                this.deathSoundPlayed = true;
            }
        }
    }
    
    // =============================================================================
    // ATTACK PATTERNS
    // =============================================================================
    
    /**
     * Select appropriate attack pattern based on phase and player position
     * @private
     */
    _selectAttackPattern() {
        const patterns = [AttackType.CHARGE, AttackType.PROJECTILE_VOLLEY];
        
        // Add slam attack in higher phases
        if (this.currentPhase >= 2) {
            patterns.push(AttackType.SLAM);
        }
        
        // Prefer charge if player is close
        const distToPlayer = Math.abs(this.lastPlayerPos.x - (this.x + this.width/2));
        if (distToPlayer < 200) {
            this.attackPattern = AttackType.CHARGE;
        } else {
            this.attackPattern = patterns[Math.floor(Math.random() * patterns.length)];
        }
        
        this.attackTimer = 0;
        console.log(`[EndBoss] Selected attack pattern: ${this.attackPattern}`);
    }
    
    /**
     * Handle charge attack pattern
     * @param {number} dt Delta time
     * @private
     */
    _updateChargeAttack(dt) {
        if (this.attackTimer < 0.3) {
            // Charge preparation
            this.vx = 0;
        } else if (this.attackTimer < 1.5) {
            // Charge towards player
            const targetX = this.lastPlayerPos.x;
            const direction = Math.sign(targetX - (this.x + this.width/2));
            this.vx = direction * GameConfig.endBoss.speed * 2.5;
        } else {
            // Attack finished
            this.vx = 0;
            this.lastAttackTime = this.stateTime;
            this._transitionToState(BossState.IDLE);
        }
        
        this.attackTimer += dt;
    }
    
    /**
     * Handle projectile volley attack
     * @param {number} dt Delta time
     * @private
     */
    _updateProjectileVolley(dt) {
        this.vx = 0;
        
        const volleyCount = this.currentPhase >= 3 ? 5 : 3;
        const fireInterval = 0.3;
        
        if (this.attackTimer < volleyCount * fireInterval) {
            const shotIndex = Math.floor(this.attackTimer / fireInterval);
            const lastShotTime = shotIndex * fireInterval;
            
            if (this.attackTimer >= lastShotTime && this.attackTimer < lastShotTime + 0.1) {
                this._fireProjectile();
            }
        } else {
            // Volley finished
            this.lastAttackTime = this.stateTime;
            this._transitionToState(BossState.IDLE);
        }
        
        this.attackTimer += dt;
    }
    
    /**
     * Handle slam attack pattern
     * @param {number} dt Delta time
     * @private
     */
    _updateSlamAttack(dt) {
        if (this.attackTimer < 0.5) {
            // Rise up
            this.vx = 0;
            this.vy = -30;
        } else if (this.attackTimer < 1.0) {
            // Slam down
            this.vx = 0;
            this.vy = 150;
        } else {
            // Return to normal
            this.vy = 0;
            this.y = this.startY; // Reset position
            this.lastAttackTime = this.stateTime;
            this._transitionToState(BossState.IDLE);
        }
        
        this.attackTimer += dt;
    }
    
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    
    /**
     * Fire a projectile towards the player
     * @private
     */
    _fireProjectile() {
        if (!this.projectileSpawnCallback) return;
        
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        
        // Calculate direction to player
        const dx = this.lastPlayerPos.x - startX;
        const dy = this.lastPlayerPos.y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            this.projectileSpawnCallback(startX, startY, { x: dirX, y: dirY });
        }
    }
    
    /**
     * Update current phase based on HP
     * @private
     */
    _updatePhase() {
        const hpPercent = this.hp / this.hpMax;
        let newPhase = 1;
        
        if (hpPercent <= 0.25) {
            newPhase = 4;
        } else if (hpPercent <= 0.5) {
            newPhase = 3;
        } else if (hpPercent <= 0.75) {
            newPhase = 2;
        }
        
        if (newPhase !== this.currentPhase) {
            this.currentPhase = newPhase;
            this.phaseTransitionPlayed = false;
            console.log(`[EndBoss] Phase transition to ${newPhase}`);
        }
    }
    
    /**
     * Get speed multiplier for current phase
     * @returns {number} Speed multiplier
     * @private
     */
    _getPhaseSpeedMultiplier() {
        return 1 + (this.currentPhase - 1) * 0.3;
    }
    
    /**
     * Get attack delay multiplier for current phase
     * @returns {number} Attack delay multiplier
     * @private
     */
    _getPhaseAttackDelayMultiplier() {
        return Math.max(0.3, 1 - (this.currentPhase - 1) * 0.2);
    }
    
    /**
     * Transition to new state with cleanup
     * @param {string} newState New state to transition to
     * @private
     */
    _transitionToState(newState) {
        console.log(`[EndBoss] State transition: ${this.state} -> ${newState}`);
        this.state = newState;
        this.stateTime = 0;
        
        // State-specific initialization
        if (newState === BossState.DEATH) {
            this.vx = 0;
            this.vy = 0;
        }
    }
    
    /**
     * Render boss sprite (placeholder implementation)
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBossSprite(ctx) {
        // Placeholder boss rendering - in real game would use sprite sheets
        const colors = {
            [BossState.SPAWNING]: '#6a4c93',
            [BossState.IDLE]: '#2e5c8a',
            [BossState.PATROL]: '#2e5c8a',
            [BossState.PREPARING_ATTACK]: '#ff6b35',
            [BossState.ATTACKING]: '#ff3333',
            [BossState.HURT]: '#ff6666',
            [BossState.DEATH]: '#666666'
        };
        
        ctx.fillStyle = colors[this.state] || '#2e5c8a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Phase indicator stripes
        if (this.currentPhase > 1) {
            ctx.fillStyle = '#ffff00';
            for (let i = 0; i < this.currentPhase - 1; i++) {
                ctx.fillRect(i * 10, 0, 5, this.height);
            }
        }
        
        // Eyes
        ctx.fillStyle = 'red';
        ctx.fillRect(this.width * 0.2, this.height * 0.3, 15, 15);
        ctx.fillRect(this.width * 0.6, this.height * 0.3, 15, 15);
    }
    
    /**
     * Render charge effect during attack preparation
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderChargeEffect(ctx) {
        const intensity = Math.sin(this.stateTime * 20) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(255, 255, 0, ${intensity})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(-5, -5, this.width + 10, this.height + 10);
    }
    
    /**
     * Render phase indicator
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderPhaseIndicator(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${this.currentPhase}`, this.width/2, -10);
    }
}