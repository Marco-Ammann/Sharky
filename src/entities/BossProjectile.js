/**
 * @file Boss projectile system with particle effects and proper cleanup.
 * Optimized for performance with object pooling considerations.
 * 
 * IMPROVEMENTS:
 * - Particle trail effects
 * - Proper lifecycle management
 * - Screen boundary checking
 * - Visual feedback for different projectile types
 * - Memory efficient cleanup
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Boss projectile with enhanced visuals and proper cleanup
 */
export class BossProjectile {
    /**
     * @param {Object} options Configuration object
     * @param {number} options.x Starting X position
     * @param {number} options.y Starting Y position
     * @param {Object} options.dir Direction vector {x, y} (normalized)
     * @param {number} options.speed Projectile speed in pixels/second
     * @param {string} [options.type='normal'] Projectile type for visual variety
     */
    constructor({ x, y, dir, speed, type = 'normal' }) {
        // Position and movement
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        
        // Direction (normalized)
        this.dir = { ...dir };
        this.speed = speed;
        
        // Visual properties
        this.type = type;
        this.radius = this._getRadiusForType(type);
        this.color = this._getColorForType(type);
        
        // Lifecycle
        this._lifetime = 0;
        this._maxLifetime = 5.0; // seconds
        this._destroyed = false;
        
        // Animation
        this._animTime = 0;
        this._rotationSpeed = 2; // radians per second
        this._pulseSpeed = 4; // Hz
        
        // Trail effect
        this._trailPoints = [];
        this._maxTrailPoints = 8;
        this._trailTimer = 0;
        this._trailInterval = 0.05; // seconds between trail points
        
        // Screen bounds (will be set by screen dimensions)
        this._screenBounds = {
            left: -100,
            right: 820,
            top: -100,
            bottom: 580
        };
        
        console.log(`[BossProjectile] Created ${type} projectile at (${x}, ${y})`);
    }
    
    /**
     * Update projectile position and effects
     * @param {number} dt Delta time in seconds
     * @returns {boolean} True if projectile should be removed
     */
    update(dt) {
        if (this._destroyed) return true;
        
        // Update timers
        this._lifetime += dt;
        this._animTime += dt;
        this._trailTimer += dt;
        
        // Move projectile
        this.x += this.dir.x * this.speed * dt;
        this.y += this.dir.y * this.speed * dt;
        
        // Update trail effect
        if (this._trailTimer >= this._trailInterval) {
            this._addTrailPoint();
            this._trailTimer = 0;
        }
        
        // Age trail points
        this._trailPoints = this._trailPoints.filter(point => {
            point.age += dt;
            return point.age < 0.5; // trail points live for 0.5 seconds
        });
        
        // Check if projectile should be removed
        const shouldRemove = this._lifetime >= this._maxLifetime ||
                           this._isOutOfBounds() ||
                           this._destroyed;
        
        if (shouldRemove) {
            this._cleanup();
            return true;
        }
        
        return false;
    }
    
    /**
     * Render projectile with trail effects
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        if (this._destroyed) return;
        
        ctx.save();
        
        // Render trail first (behind projectile)
        this._renderTrail(ctx);
        
        // Render main projectile
        this._renderProjectile(ctx);
        
        // Render glow effect
        this._renderGlow(ctx);
        
        ctx.restore();
    }
    
    /**
     * Mark projectile for destruction (e.g., when hitting player)
     */
    destroy() {
        this._destroyed = true;
        this._cleanup();
    }
    
    /**
     * Get damage value for this projectile type
     * @returns {number} Damage amount
     */
    getDamage() {
        switch (this.type) {
            case 'heavy': return 2;
            case 'explosive': return 3;
            default: return 1;
        }
    }
    
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    
    /**
     * Get radius based on projectile type
     * @param {string} type Projectile type
     * @returns {number} Radius in pixels
     * @private
     */
    _getRadiusForType(type) {
        switch (type) {
            case 'heavy': return 25;
            case 'explosive': return 20;
            case 'fast': return 12;
            default: return 16;
        }
    }
    
    /**
     * Get color based on projectile type
     * @param {string} type Projectile type
     * @returns {string} Color string
     * @private
     */
    _getColorForType(type) {
        switch (type) {
            case 'heavy': return '#8B4513';
            case 'explosive': return '#FF4500';
            case 'fast': return '#00FFFF';
            default: return '#FF6B6B';
        }
    }
    
    /**
     * Add new trail point
     * @private
     */
    _addTrailPoint() {
        this._trailPoints.push({
            x: this.x,
            y: this.y,
            age: 0,
            size: this.radius * 0.8
        });
        
        // Limit trail length
        if (this._trailPoints.length > this._maxTrailPoints) {
            this._trailPoints.shift();
        }
    }
    
    /**
     * Check if projectile is out of screen bounds
     * @returns {boolean} True if out of bounds
     * @private
     */
    _isOutOfBounds() {
        return this.x < this._screenBounds.left ||
               this.x > this._screenBounds.right ||
               this.y < this._screenBounds.top ||
               this.y > this._screenBounds.bottom;
    }
    
    /**
     * Render trail effect
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderTrail(ctx) {
        if (this._trailPoints.length < 2) return;
        
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < this._trailPoints.length; i++) {
            const point = this._trailPoints[i];
            const alpha = (1 - point.age / 0.5) * 0.6; // Fade out over 0.5 seconds
            const size = point.size * alpha;
            
            if (alpha > 0) {
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
    
    /**
     * Render main projectile body
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderProjectile(ctx) {
        ctx.save();
        
        // Move to projectile center
        ctx.translate(this.x, this.y);
        
        // Rotate for visual effect
        ctx.rotate(this._animTime * this._rotationSpeed);
        
        // Pulsing effect
        const pulseScale = 1 + Math.sin(this._animTime * this._pulseSpeed) * 0.1;
        ctx.scale(pulseScale, pulseScale);
        
        // Draw projectile based on type
        switch (this.type) {
            case 'heavy':
                this._drawHeavyProjectile(ctx);
                break;
            case 'explosive':
                this._drawExplosiveProjectile(ctx);
                break;
            case 'fast':
                this._drawFastProjectile(ctx);
                break;
            default:
                this._drawNormalProjectile(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Render glow effect around projectile
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderGlow(ctx) {
        const glowIntensity = Math.sin(this._animTime * 3) * 0.3 + 0.7;
        const glowRadius = this.radius * 1.5;
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = glowIntensity * 0.3;
        
        // Create radial gradient for glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowRadius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
    
    /**
     * Draw normal projectile
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _drawNormalProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw heavy projectile with angular design
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _drawHeavyProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Draw octagon
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x = Math.cos(angle) * this.radius;
            const y = Math.sin(angle) * this.radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Dark center
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw explosive projectile with spiky design
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _drawExplosiveProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Draw spiky circle
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const radius = this.radius * (i % 2 === 0 ? 1 : 0.6);
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
        
        // Bright center
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw fast projectile with streamlined design
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _drawFastProjectile(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Draw elongated diamond
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(0, -this.radius * 0.5);
        ctx.lineTo(-this.radius * 0.7, 0);
        ctx.lineTo(0, this.radius * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Bright streak
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(this.radius * 0.5, 0);
        ctx.lineTo(0, -this.radius * 0.2);
        ctx.lineTo(-this.radius * 0.3, 0);
        ctx.lineTo(0, this.radius * 0.2);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Clean up resources to prevent memory leaks
     * @private
     */
    _cleanup() {
        // Clear trail points
        this._trailPoints.length = 0;
        
        // Clear references
        this.dir = null;
        
        console.log(`[BossProjectile] Cleaned up ${this.type} projectile`);
    }
}