/**
 * @file High-performance particle system for visual effects.
 * 
 * FEATURES:
 * - Object pooling for zero-allocation particle spawning
 * - Multiple particle types (bubbles, sparks, explosions)
 * - Batch rendering for performance
 * - Configurable emitters and one-shot effects
 * - Memory-efficient lifecycle management
 * - Integration with boss fights and game events
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Individual particle data structure
 */
class Particle {
    constructor() {
        this.reset();
    }
    
    /**
     * Reset particle to initial state for reuse
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0; // acceleration
        this.ay = 0;
        this.life = 0;
        this.maxLife = 1;
        this.size = 1;
        this.color = '#ffffff';
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.type = 'basic';
        this.active = false;
        this.gravity = 0;
        this.drag = 0;
        this.bounce = 0;
        this.fadeOut = true;
        this.scaleWithLife = false;
        this.customData = null;
    }
    
    /**
     * Update particle physics and lifecycle
     * @param {number} dt Delta time in seconds
     * @returns {boolean} True if particle should be removed
     */
    update(dt) {
        if (!this.active) return true;
        
        // Update lifetime
        this.life += dt;
        if (this.life >= this.maxLife) {
            this.active = false;
            return true;
        }
        
        // Apply acceleration
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        
        // Apply gravity
        this.vy += this.gravity * dt;
        
        // Apply drag
        this.vx *= (1 - this.drag * dt);
        this.vy *= (1 - this.drag * dt);
        
        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Update rotation
        this.rotation += this.rotationSpeed * dt;
        
        // Update visual properties based on life
        const lifeRatio = this.life / this.maxLife;
        
        if (this.fadeOut) {
            this.alpha = 1 - lifeRatio;
        }
        
        if (this.scaleWithLife) {
            this.size *= (1 - lifeRatio * 0.5);
        }
        
        return false;
    }
    
    /**
     * Render particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        if (!this.active || this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Render based on type
        switch (this.type) {
            case 'bubble':
                this._renderBubble(ctx);
                break;
            case 'spark':
                this._renderSpark(ctx);
                break;
            case 'explosion':
                this._renderExplosion(ctx);
                break;
            case 'coin_sparkle':
                this._renderCoinSparkle(ctx);
                break;
            case 'water_drop':
                this._renderWaterDrop(ctx);
                break;
            default:
                this._renderBasic(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Render basic circular particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBasic(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render bubble particle with shine effect
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBubble(ctx) {
        // Main bubble
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Render spark particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderSpark(ctx) {
        const length = this.size * 3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-length/2, 0);
        ctx.lineTo(length/2, 0);
        ctx.stroke();
    }
    
    /**
     * Render explosion particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderExplosion(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Draw irregular explosion fragment
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = this.size * (0.5 + Math.random() * 0.5);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Render coin sparkle particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderCoinSparkle(ctx) {
        // Draw star shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = (i % 2 === 0) ? this.size : this.size * 0.4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Render water drop particle
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderWaterDrop(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * High-performance particle system with object pooling
 */
export class ParticleSystem {
    /**
     * Initialize particle system
     * @param {number} maxParticles Maximum concurrent particles
     */
    constructor(maxParticles = 1000) {
        this._maxParticles = maxParticles;
        
        // Object pool for particles
        this._particlePool = [];
        this._activeParticles = [];
        
        // Pre-allocate particle pool
        for (let i = 0; i < maxParticles; i++) {
            this._particlePool.push(new Particle());
        }
        
        // Performance tracking
        this._lastCleanup = 0;
        this._frameCount = 0;
        
        // Emitter configurations
        this._emitters = new Map();
        
        console.log(`[ParticleSystem] Initialized with ${maxParticles} particles`);
    }
    
    /**
     * Update all particles
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        this._frameCount++;
        
        // Update active particles
        for (let i = this._activeParticles.length - 1; i >= 0; i--) {
            const particle = this._activeParticles[i];
            
            if (particle.update(dt)) {
                // Return particle to pool
                this._returnToPool(particle);
                this._activeParticles.splice(i, 1);
            }
        }
        
        // Update emitters
        this._emitters.forEach(emitter => {
            emitter.update(dt);
        });
        
        // Periodic cleanup
        if (this._frameCount % 300 === 0) { // Every 5 seconds at 60fps
            this._performCleanup();
        }
    }
    
    /**
     * Render all particles with batching
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} camX Camera X offset
     */
    render(ctx, camX = 0) {
        if (this._activeParticles.length === 0) return;
        
        ctx.save();
        ctx.translate(-camX, 0);
        
        // Batch render particles by type for performance
        const particlesByType = new Map();
        
        this._activeParticles.forEach(particle => {
            if (!particlesByType.has(particle.type)) {
                particlesByType.set(particle.type, []);
            }
            particlesByType.get(particle.type).push(particle);
        });
        
        // Render each type in batch
        particlesByType.forEach((particles, type) => {
            if (type === 'bubble' || type === 'spark') {
                // These types need individual rendering
                particles.forEach(particle => particle.render(ctx));
            } else {
                // Basic particles can be batch rendered
                this._batchRenderBasic(ctx, particles);
            }
        });
        
        ctx.restore();
    }
    
    /**
     * Spawn a single particle
     * @param {Object} config Particle configuration
     * @returns {Particle|null} Spawned particle or null if pool exhausted
     */
    spawn(config) {
        const particle = this._getFromPool();
        if (!particle) return null;
        
        // Configure particle
        particle.x = config.x || 0;
        particle.y = config.y || 0;
        particle.vx = config.vx || 0;
        particle.vy = config.vy || 0;
        particle.ax = config.ax || 0;
        particle.ay = config.ay || 0;
        particle.life = 0;
        particle.maxLife = config.maxLife || 1;
        particle.size = config.size || 3;
        particle.color = config.color || '#ffffff';
        particle.alpha = config.alpha || 1;
        particle.rotation = config.rotation || 0;
        particle.rotationSpeed = config.rotationSpeed || 0;
        particle.type = config.type || 'basic';
        particle.active = true;
        particle.gravity = config.gravity || 0;
        particle.drag = config.drag || 0;
        particle.bounce = config.bounce || 0;
        particle.fadeOut = config.fadeOut !== false;
        particle.scaleWithLife = config.scaleWithLife || false;
        particle.customData = config.customData || null;
        
        this._activeParticles.push(particle);
        return particle;
    }
    
    /**
     * Spawn multiple particles in a burst
     * @param {Object} config Burst configuration
     * @param {number} count Number of particles to spawn
     */
    spawnBurst(config, count) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particleConfig = { ...config };
            
            // Add random variation
            if (config.randomVelocity) {
                const angle = Math.random() * Math.PI * 2;
                const speed = config.randomVelocity * (0.5 + Math.random() * 0.5);
                particleConfig.vx = Math.cos(angle) * speed;
                particleConfig.vy = Math.sin(angle) * speed;
            }
            
            if (config.randomSize) {
                particleConfig.size = config.size * (0.5 + Math.random() * 0.5);
            }
            
            if (config.randomLife) {
                particleConfig.maxLife = config.maxLife * (0.5 + Math.random() * 0.5);
            }
            
            const particle = this.spawn(particleConfig);
            if (particle) {
                particles.push(particle);
            }
        }
        
        return particles;
    }
    
    // =============================================================================
    // PRESET EFFECTS
    // =============================================================================
    
    /**
     * Create bubble trail effect
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} vx X velocity
     * @param {number} vy Y velocity
     */
    createBubbleTrail(x, y, vx, vy) {
        const config = GameConfig.particles.waterBubbles;
        
        this.spawn({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: vx * 0.1 + (Math.random() - 0.5) * 20,
            vy: vy * 0.1 + (Math.random() - 0.5) * 20 - 30,
            maxLife: config.lifetime,
            size: config.size + Math.random() * 2,
            color: config.color,
            type: 'bubble',
            gravity: -20,
            drag: 0.5,
            alpha: 0.7
        });
    }
    
    /**
     * Create coin collection sparkle effect
     * @param {number} x X position
     * @param {number} y Y position
     */
    createCoinSparkles(x, y) {
        const config = GameConfig.particles.coinSparkles;
        
        this.spawnBurst({
            x,
            y,
            maxLife: config.lifetime,
            size: config.size,
            color: config.color,
            type: 'coin_sparkle',
            gravity: 50,
            drag: 0.3,
            randomVelocity: config.speed,
            randomSize: true,
            randomLife: true,
            rotationSpeed: Math.PI * 2
        }, config.count);
    }
    
    /**
     * Create explosion effect
     * @param {number} x X position
     * @param {number} y Y position
     * @param {string} color Explosion color
     * @param {number} intensity Explosion intensity (0-1)
     */
    createExplosion(x, y, color = '#FF6B35', intensity = 1.0) {
        const config = GameConfig.particles.explosions;
        const count = Math.floor(config.count * intensity);
        
        this.spawnBurst({
            x,
            y,
            maxLife: config.lifetime,
            size: config.size * intensity,
            color: color,
            type: 'explosion',
            gravity: 100,
            drag: 0.8,
            randomVelocity: config.speed * intensity,
            randomSize: true,
            randomLife: true,
            scaleWithLife: true,
            rotationSpeed: Math.PI
        }, count);
    }
    
    /**
     * Create boss hit effect
     * @param {number} x X position
     * @param {number} y Y position
     */
    createBossHitEffect(x, y) {
        // Red sparks
        this.spawnBurst({
            x,
            y,
            maxLife: 0.8,
            size: 4,
            color: '#FF3333',
            type: 'spark',
            gravity: 200,
            drag: 0.5,
            randomVelocity: 120,
            randomSize: true,
            randomLife: true,
            rotationSpeed: Math.PI * 4
        }, 8);
        
        // White flash particles
        this.spawnBurst({
            x,
            y,
            maxLife: 0.3,
            size: 6,
            color: '#FFFFFF',
            type: 'basic',
            gravity: 50,
            drag: 0.9,
            randomVelocity: 60,
            fadeOut: true,
            scaleWithLife: true
        }, 4);
    }
    
    /**
     * Create water splash effect
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} intensity Splash intensity
     */
    createWaterSplash(x, y, intensity = 1.0) {
        const count = Math.floor(15 * intensity);
        
        this.spawnBurst({
            x,
            y,
            maxLife: 1.5,
            size: 3,
            color: '#87CEEB',
            type: 'water_drop',
            gravity: 150,
            drag: 0.3,
            randomVelocity: 80 * intensity,
            randomSize: true,
            randomLife: true,
            bounce: 0.3
        }, count);
    }
    
    /**
     * Create continuous bubble stream
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} rate Particles per second
     * @param {number} duration Duration in seconds (0 for infinite)
     * @returns {string} Emitter ID for stopping
     */
    createBubbleStream(x, y, rate = 5, duration = 0) {
        const emitterId = `bubble_stream_${Date.now()}_${Math.random()}`;
        
        this._emitters.set(emitterId, {
            x, y, rate, duration,
            timer: 0,
            interval: 1 / rate,
            active: true,
            update: (dt) => {
                const emitter = this._emitters.get(emitterId);
                if (!emitter.active) return;
                
                emitter.timer += dt;
                
                if (emitter.timer >= emitter.interval) {
                    this.createBubbleTrail(
                        emitter.x + (Math.random() - 0.5) * 20,
                        emitter.y,
                        0,
                        -50
                    );
                    emitter.timer = 0;
                }
                
                if (duration > 0) {
                    emitter.duration -= dt;
                    if (emitter.duration <= 0) {
                        this.stopEmitter(emitterId);
                    }
                }
            }
        });
        
        return emitterId;
    }
    
    /**
     * Stop an emitter
     * @param {string} emitterId Emitter ID
     */
    stopEmitter(emitterId) {
        if (this._emitters.has(emitterId)) {
            this._emitters.get(emitterId).active = false;
            this._emitters.delete(emitterId);
        }
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this._activeParticles.forEach(particle => {
            this._returnToPool(particle);
        });
        this._activeParticles.length = 0;
        
        this._emitters.forEach(emitter => {
            emitter.active = false;
        });
        this._emitters.clear();
        
        console.log('[ParticleSystem] All particles cleared');
    }
    
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    
    /**
     * Get particle from pool
     * @returns {Particle|null} Particle or null if pool empty
     * @private
     */
    _getFromPool() {
        if (this._particlePool.length === 0) {
            console.warn('[ParticleSystem] Particle pool exhausted');
            return null;
        }
        
        return this._particlePool.pop();
    }
    
    /**
     * Return particle to pool
     * @param {Particle} particle Particle to return
     * @private
     */
    _returnToPool(particle) {
        particle.reset();
        this._particlePool.push(particle);
    }
    
    /**
     * Batch render basic particles for performance
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {Particle[]} particles Particles to render
     * @private
     */
    _batchRenderBasic(ctx, particles) {
        particles.forEach(particle => {
            if (particle.alpha > 0) {
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }
    
    /**
     * Perform cleanup and optimization
     * @private
     */
    _performCleanup() {
        const poolSize = this._particlePool.length;
        const activeCount = this._activeParticles.length;
        const totalParticles = poolSize + activeCount;
        
        console.log(`[ParticleSystem] Stats: ${activeCount} active, ${poolSize} pooled, ${totalParticles} total`);
        
        // Warn if pool is getting low
        if (poolSize < this._maxParticles * 0.2) {
            console.warn(`[ParticleSystem] Pool running low: ${poolSize} available`);
        }
        
        // Clean up inactive emitters
        let cleanedEmitters = 0;
        this._emitters.forEach((emitter, id) => {
            if (!emitter.active) {
                this._emitters.delete(id);
                cleanedEmitters++;
            }
        });
        
        if (cleanedEmitters > 0) {
            console.log(`[ParticleSystem] Cleaned up ${cleanedEmitters} inactive emitters`);
        }
    }
    
    // =============================================================================
    // GETTERS
    // =============================================================================
    
    /**
     * Get number of active particles
     * @returns {number} Active particle count
     */
    get activeParticleCount() {
        return this._activeParticles.length;
    }
    
    /**
     * Get number of available particles in pool
     * @returns {number} Available particle count
     */
    get availableParticleCount() {
        return this._particlePool.length;
    }
    
    /**
     * Get number of active emitters
     * @returns {number} Active emitter count
     */
    get activeEmitterCount() {
        return this._emitters.size;
    }
    
    /**
     * Check if particle system is at capacity
     * @returns {boolean} True if at capacity
     */
    get isAtCapacity() {
        return this._particlePool.length === 0;
    }
}