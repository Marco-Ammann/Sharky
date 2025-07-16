/**
 * @file Main gameplay scene with improved organization and memory management.
 * 
 * IMPROVEMENTS:
 * - Separated collision detection into cleaner methods
 * - Better memory management with object pooling considerations
 * - Cleaner entity management with proper lifecycle
 * - Improved boss integration with new state machine
 * - Better debug logging and error handling
 * - Performance optimizations for entity updates
 */

import { InputManager } from '../managers/InputManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { Character } from '../entities/Character.js';
import { Bubble } from '../entities/Bubble.js';
import { PufferFish } from '../entities/PufferFish.js';
import { Jellyfish } from '../entities/Jellyfish.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Hazard } from '../entities/Hazard.js';
import { Coin } from '../entities/Coin.js';
import { EndBoss } from '../entities/EndBoss.js';
import { BossProjectile } from '../entities/BossProjectile.js';
import { HUD } from '../ui/HUD.js';
import { GameConfig } from '../config/GameConfig.js';
import { BackgroundLayer } from '../ui/BackgroundLayer.js';

/**
 * @typedef {import('../utils/AssetLoader.js').LoadedAssets} LoadedAssets
 */

/**
 * Enhanced PlayScene with better organization and performance
 */
export class PlayScene {
    /**
     * @param {{ game: import('../game/Game.js').Game;
     *          input: InputManager;
     *          audio: AudioManager;
     *          assets: LoadedAssets;
     *          levelData: Object }} deps
     */
    constructor({ game, input, audio, assets, levelData = null }) {
        // Core references
        this._game = game;
        this._input = input;
        this._audio = audio;
        this._assets = assets;
        
        // Camera and level
        this._camX = 0;
        this._levelWidth = 2400;
        
        // Performance tracking
        this._frameCount = 0;
        this._lastPerformanceLog = 0;
        
        // Initialize background system
        this._initializeBackgroundLayers();
        
        // Initialize entity collections
        this._initializeEntityCollections();
        
        // Initialize player
        this._initializePlayer();
        
        // Initialize HUD
        this._initializeHUD();
        
        // Load level data if provided
        if (levelData) {
            this._loadLevel(levelData);
        }
        
        // Add some default entities for testing
        this._addDefaultEntities();
        
        console.log('[PlayScene] Scene initialized with', {
            enemies: this._enemies.length,
            obstacles: this._obstacles.length,
            hazards: this._hazards.length,
            coins: this._coins.length,
            hasBoss: !!this._boss
        });
    }
    
    /**
     * Main update loop with performance optimization
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        // Performance logging
        this._frameCount++;
        if (this._frameCount % 300 === 0) { // Every 5 seconds at 60fps
            this._logPerformanceStats();
        }
        
        // Update background effects
        this._updateBackgroundEffects(dt);
        
        // Update all entities
        this._updateEntities(dt);
        
        // Handle all collision detection
        this._handleCollisions();
        
        // Update player (after collisions for proper response)
        this._player.update(dt);
        
        // Clamp player to level bounds
        this._clampPlayerToLevel();
        
        // Check win/lose conditions
        this._checkGameStateConditions();
    }
    
    /**
     * Main render loop with proper layering
     * @param {CanvasRenderingContext2D} ctx Canvas context
     */
    render(ctx) {
        // Update camera position
        this._updateCamera();
        
        // Render background layers
        this._renderBackgrounds(ctx);
        
        // Render world entities (with camera translation)
        ctx.save();
        ctx.translate(-this._camX, 0);
        
        this._renderWorldEntities(ctx);
        
        ctx.restore();
        
        // Render UI (no camera translation)
        this._renderUI(ctx);
        
        // Debug rendering
        if (process.env.NODE_ENV === 'development') {
            this._renderDebugInfo(ctx);
        }
    }
    
    /**
     * Clean up resources when scene is destroyed
     */
    destroy() {
        // Clean up boss
        if (this._boss) {
            this._boss.destroy();
            this._boss = null;
        }
        
        // Clean up all entity arrays
        this._bubbles.length = 0;
        this._enemies.length = 0;
        this._obstacles.length = 0;
        this._hazards.length = 0;
        this._coins.length = 0;
        this._bossProjectiles.length = 0;
        
        // Clear player reference
        this._player = null;
        
        // Clear background layers
        this._bgLayers.length = 0;
        
        console.log('[PlayScene] Scene destroyed and cleaned up');
    }
    
    // =============================================================================
    // INITIALIZATION METHODS
    // =============================================================================
    
    /**
     * Initialize background layer system
     * @private
     */
    _initializeBackgroundLayers() {
        this._bgLayers = [];
        this._nightFactor = 0;
        this._nightTarget = 0;
        
        // Day/night toggle with N key
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyN') {
                this._nightTarget = this._nightTarget === 1 ? 0 : 1;
                console.log(`[PlayScene] Day/Night toggle: ${this._nightTarget === 1 ? 'Night' : 'Day'}`);
            }
        });
        
        // Create background layers in correct order
        const layerConfigs = [
            { key: 'bg_water', keyNight: 'bg_water_dark', factor: 0 },
            { key: 'bg_far', keyNight: 'bg_far_dark', factor: 0.15 },
            { key: 'bg_mid', keyNight: 'bg_mid_dark', factor: 0.4 },
            { key: 'bg_near', keyNight: 'bg_near_dark', factor: 0.7 },
            { key: 'bg_godrays', keyNight: null, factor: 0 }
        ];
        
        layerConfigs.forEach(config => {
            if (this._assets.images[config.key]) {
                this._bgLayers.push(
                    new BackgroundLayer({
                        img: this._assets.images[config.key],
                        imgNight: config.keyNight ? this._assets.images[config.keyNight] : null,
                        factor: config.factor,
                        canvas: this._game._canvas,
                        stretch: true,
                    })
                );
            }
        });
    }
    
    /**
     * Initialize all entity collections
     * @private
     */
    _initializeEntityCollections() {
        this._bubbles = [];
        this._enemies = [];
        this._obstacles = [];
        this._hazards = [];
        this._coins = [];
        this._bossProjectiles = [];
        this._boss = null;
        
        // Performance tracking for entity counts
        this._maxEntities = {
            bubbles: 20,
            enemies: 10,
            obstacles: 50,
            hazards: 30,
            coins: 100,
            bossProjectiles: 15
        };
    }
    
    /**
     * Initialize player character
     * @private
     */
    _initializePlayer() {
        this._player = new Character({
            assets: this._assets.images,
            input: this._input,
            onBubble: (x, y, left) => this._spawnBubble(x, y, left),
        });
        
        console.log('[PlayScene] Player initialized');
    }
    
    /**
     * Initialize HUD system
     * @private
     */
    _initializeHUD() {
        this._hud = new HUD(
            this._assets.images['bubble'], 
            this._assets.images['coin']
        );
        
        console.log('[PlayScene] HUD initialized');
    }
    
    /**
     * Add default entities for testing
     * @private
     */
    _addDefaultEntities() {
        // Add a test obstacle
        this._obstacles.push(
            new Obstacle({
                x: 300,
                y: 330,
                width: GameConfig.obstacle.defaultWidth,
                height: GameConfig.obstacle.defaultHeight,
                img: this._assets.images['coral_danger'] ?? null,
                damage: true,
            })
        );
        
        // Add a test enemy
        this._enemies.push(
            new PufferFish({
                x: 500,
                y: 250,
                directionLeft: true,
                assets: this._assets.images,
                sounds: this._assets.sounds,
                audio: this._audio,
            })
        );
    }
    
    // =============================================================================
    // UPDATE METHODS
    // =============================================================================
    
    /**
     * Update background effects like day/night transition
     * @param {number} dt Delta time
     * @private
     */
    _updateBackgroundEffects(dt) {
        // Smooth day/night transition
        const blendSpeed = 0.25;
        if (Math.abs(this._nightTarget - this._nightFactor) > 0.001) {
            const dir = Math.sign(this._nightTarget - this._nightFactor);
            this._nightFactor = Math.max(0, Math.min(1, this._nightFactor + dir * blendSpeed * dt));
        }
    }
    
    /**
     * Update all entities with performance monitoring
     * @param {number} dt Delta time
     * @private
     */
    _updateEntities(dt) {
        const playerPos = {
            x: this._player.x + this._player.width / 2,
            y: this._player.y + this._player.height / 2,
        };
        
        // Update bubbles with cleanup
        this._bubbles = this._bubbles.filter(bubble => {
            if (bubble.update(dt)) {
                bubble.destroy?.(); // Clean up if method exists
                return false;
            }
            return true;
        });
        
        // Update enemies with cleanup
        this._enemies = this._enemies.filter(enemy => {
            if (enemy.update(dt, playerPos)) {
                enemy.destroy?.(); // Clean up if method exists
                return false;
            }
            return !enemy._dead;
        });
        
        // Update obstacles
        this._obstacles = this._obstacles.filter(obstacle => {
            if (obstacle.update(dt)) {
                obstacle.destroy?.(); // Clean up if method exists
                return false;
            }
            return true;
        });
        
        // Update hazards
        this._hazards = this._hazards.filter(hazard => {
            if (hazard.update(dt)) {
                hazard.destroy?.(); // Clean up if method exists
                return false;
            }
            return true;
        });
        
        // Update coins
        this._coins = this._coins.filter(coin => {
            if (coin.update(dt)) {
                coin.destroy?.(); // Clean up if method exists
                return false;
            }
            return !coin._collected;
        });
        
        // Update boss with enhanced projectile spawning
        if (this._boss) {
            const bossRemoved = this._boss.update(
                dt,
                playerPos,
                (x, y, dir) => this._spawnBossProjectile(x, y, dir)
            );
            
            if (bossRemoved) {
                this._boss.destroy();
                this._boss = null;
                this._onBossDefeated();
            }
        }
        
        // Update boss projectiles with cleanup
        this._bossProjectiles = this._bossProjectiles.filter(projectile => {
            if (projectile.update(dt)) {
                projectile.destroy?.(); // Clean up if method exists
                return false;
            }
            return true;
        });
        
        // Monitor entity counts for performance
        this._monitorEntityCounts();
    }
    
    /**
     * Handle all collision detection in organized manner
     * @private
     */
    _handleCollisions() {
        // Player collisions
        this._handlePlayerCollisions();
        
        // Bubble collisions
        this._handleBubbleCollisions();
        
        // Melee attack collisions
        this._handleMeleeCollisions();
    }
    
    /**
     * Handle player collision with various entities
     * @private
     */
    _handlePlayerCollisions() {
        const playerRect = {
            x: this._player.x,
            y: this._player.y,
            w: this._player.width,
            h: this._player.height,
        };
        
        const playerCenter = {
            x: this._player.x + this._player.width / 2,
            y: this._player.y + this._player.height / 2,
        };
        
        // Player vs hazards
        this._hazards.forEach(hazard => {
            if (hazard.isActive() && hazard.intersectsRect(playerRect)) {
                if (this._player.takeHit()) {
                    this._hud.loseLife();
                    this._onPlayerHit('hazard');
                }
            }
        });
        
        // Player vs damaging obstacles
        this._obstacles.forEach(obstacle => {
            if (obstacle.isDamaging() && obstacle.intersectsRect(playerRect)) {
                if (this._player.takeHit()) {
                    this._hud.loseLife();
                    this._onPlayerHit('obstacle');
                }
            }
        });
        
        // Player vs boss projectiles
        this._bossProjectiles.forEach(projectile => {
            const dx = projectile.x - playerCenter.x;
            const dy = projectile.y - playerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionRadius = projectile.radius + Math.max(this._player.width, this._player.height) * 0.3;
            
            if (distance < collisionRadius) {
                if (this._player.takeHit()) {
                    this._hud.loseLife();
                    this._onPlayerHit('boss_projectile');
                }
                projectile.destroy();
            }
        });
        
        // Player vs boss
        if (this._boss && !this._boss.isDead()) {
            const bossCollision = this._boss.getCollisionCircle();
            const dx = bossCollision.x - playerCenter.x;
            const dy = bossCollision.y - playerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionRadius = bossCollision.r + Math.max(this._player.width, this._player.height) * 0.3;
            
            if (distance < collisionRadius) {
                if (this._player.takeHit()) {
                    this._hud.loseLife();
                    this._onPlayerHit('boss');
                }
            }
        }
        
        // Player vs enemies
        this._enemies.forEach(enemy => {
            const dx = enemy.x + enemy.width / 2 - playerCenter.x;
            const dy = enemy.y + enemy.height / 2 - playerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionRadius = enemy.radius + Math.max(this._player.width, this._player.height) * 0.3;
            
            if (distance < collisionRadius) {
                if (this._player.takeHit()) {
                    this._hud.loseLife();
                    this._onPlayerHit('enemy');
                }
                enemy._dead = true;
            }
        });
        
        // Player vs coins
        this._coins.forEach(coin => {
            if (coin.intersectsRect(playerRect)) {
                this._collectCoin(coin);
            }
        });
    }
    
    /**
     * Handle bubble projectile collisions
     * @private
     */
    _handleBubbleCollisions() {
        this._bubbles.forEach(bubble => {
            const bubbleRect = {
                x: bubble.x - bubble.radius,
                y: bubble.y - bubble.radius,
                w: bubble.radius * 2,
                h: bubble.radius * 2,
            };
            
            // Bubble vs hazards
            this._hazards.forEach(hazard => {
                if (hazard.isActive() && hazard.intersectsRect(bubbleRect)) {
                    bubble.startPop();
                }
            });
            
            // Bubble vs obstacles
            this._obstacles.forEach(obstacle => {
                if (obstacle.intersectsCircle({ x: bubble.x, y: bubble.y, r: bubble.radius })) {
                    bubble.startPop();
                }
            });
            
            // Bubble vs boss
            if (this._boss && !this._boss.isDead()) {
                const bossCollision = this._boss.getCollisionCircle();
                const dx = bubble.x - bossCollision.x;
                const dy = bubble.y - bossCollision.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < bossCollision.r + bubble.radius) {
                    bubble.startPop();
                    if (this._boss.takeDamage(1)) {
                        this._hud.addScore(200);
                        this._onBossHit();
                    } else {
                        this._hud.addScore(50);
                    }
                }
            }
            
            // Bubble vs enemies
            this._enemies.forEach(enemy => {
                const dx = bubble.x - (enemy.x + enemy.width / 2);
                const dy = bubble.y - (enemy.y + enemy.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.radius + bubble.radius) {
                    bubble.startPop();
                    enemy._dead = true;
                    this._hud.addScore(10);
                    this._onEnemyKilled('bubble');
                }
            });
        });
    }
    
    /**
     * Handle melee attack collisions
     * @private
     */
    _handleMeleeCollisions() {
        if (!this._player.isAttacking()) return;
        
        const attackBox = this._player.getAttackBox();
        if (!attackBox) return;
        
        // Melee vs enemies
        this._enemies.forEach(enemy => {
            const enemyCenter = {
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2
            };
            
            if (this._pointInRect(enemyCenter, attackBox)) {
                enemy._dead = true;
                this._hud.addScore(15);
                this._onEnemyKilled('melee');
            }
        });
        
        // Melee vs boss
        if (this._boss && !this._boss.isDead()) {
            const bossCenter = this._boss.getCollisionCircle();
            
            if (this._pointInRect(bossCenter, attackBox)) {
                if (this._boss.takeDamage(1)) {
                    this._hud.addScore(200);
                    this._onBossHit();
                } else {
                    this._hud.addScore(50);
                }
            }
        }
    }
    
    // =============================================================================
    // RENDER METHODS
    // =============================================================================
    
    /**
     * Update camera position
     * @private
     */
    _updateCamera() {
        const canvasW = this._game._canvas.width;
        const desiredCam = this._player.x + this._player.width / 2 - canvasW / 2;
        this._camX = Math.max(0, Math.min(this._levelWidth - canvasW, desiredCam));
    }
    
    /**
     * Render background layers
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderBackgrounds(ctx) {
        this._bgLayers.forEach(layer => layer.render(ctx, this._camX, this._nightFactor));
    }
    
    /**
     * Render all world entities in correct order
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderWorldEntities(ctx) {
        // Background elements first
        this._hazards.forEach(hazard => hazard.render(ctx));
        this._obstacles.forEach(obstacle => obstacle.render(ctx));
        
        // Collectibles
        this._coins.forEach(coin => coin.render(ctx));
        
        // Enemies
        this._enemies.forEach(enemy => enemy.render(ctx));
        
        // Boss
        if (this._boss) {
            this._boss.render(ctx);
        }
        
        // Projectiles
        this._bossProjectiles.forEach(projectile => projectile.render(ctx));
        this._bubbles.forEach(bubble => bubble.render(ctx));
        
        // Player on top
        this._player.render(ctx);
    }
    
    /**
     * Render UI elements
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderUI(ctx) {
        this._hud.render(
            ctx,
            this._player.getBubbleCdRemaining(),
            GameConfig.bubble.cooldown,
            this._boss ? this._boss.hp : null,
            this._boss ? this._boss.hpMax : 1
        );
    }
    
    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @private
     */
    _renderDebugInfo(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.font = '12px Arial';
        
        let debugY = 10;
        const debugInfo = [
            `Coins: ${this._coins.length}`,
            `Enemies: ${this._enemies.length}`,
            `Bubbles: ${this._bubbles.length}`,
            `Boss Projectiles: ${this._bossProjectiles.length}`,
            `Camera X: ${Math.round(this._camX)}`,
            `Night Factor: ${this._nightFactor.toFixed(2)}`,
            `Boss State: ${this._boss ? this._boss.state : 'None'}`,
            `FPS: ${Math.round(60 / (performance.now() - this._lastFrameTime || 16) * 1000) || 60}`
        ];
        
        debugInfo.forEach(info => {
            ctx.fillText(info, 10, debugY);
            debugY += 15;
        });
        
        this._lastFrameTime = performance.now();
        
        // Debug collision boxes
        if (this._boss) {
            const circle = this._boss.getCollisionCircle();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    
    /**
     * Spawn a bubble projectile
     * @param {number} x X position
     * @param {number} y Y position
     * @param {boolean} left Direction
     * @private
     */
    _spawnBubble(x, y, left) {
        // Prevent too many bubbles
        if (this._bubbles.length >= this._maxEntities.bubbles) {
            console.warn('[PlayScene] Max bubbles reached, not spawning');
            return;
        }
        
        if (this._assets.sounds?.bubble_shoot) {
            this._audio.playSfx(this._assets.sounds.bubble_shoot.src, 0.9, 0.2);
        }
        
        this._bubbles.push(
            new Bubble({
                x,
                y,
                directionLeft: left,
                assets: this._assets.images,
                sounds: this._assets.sounds,
                audio: this._audio,
            })
        );
    }
    
    /**
     * Spawn a boss projectile with type variation
     * @param {number} x X position
     * @param {number} y Y position
     * @param {Object} dir Direction vector
     * @private
     */
    _spawnBossProjectile(x, y, dir) {
        // Prevent too many projectiles
        if (this._bossProjectiles.length >= this._maxEntities.bossProjectiles) {
            console.warn('[PlayScene] Max boss projectiles reached, not spawning');
            return;
        }
        
        // Vary projectile type based on boss phase
        let projectileType = 'normal';
        if (this._boss && this._boss.currentPhase >= 3) {
            const types = ['normal', 'heavy', 'explosive'];
            projectileType = types[Math.floor(Math.random() * types.length)];
        }
        
        this._bossProjectiles.push(
            new BossProjectile({
                x,
                y,
                dir,
                speed: GameConfig.endBoss.projectileSpeed,
                type: projectileType,
            })
        );
    }
    
    /**
     * Handle coin collection
     * @param {Coin} coin Coin to collect
     * @private
     */
    _collectCoin(coin) {
        console.log(`[PlayScene] Coin collected at (${coin.x}, ${coin.y})`);
        
        this._hud.addScore(10);
        this._hud.addCoin(1);
        coin._collected = true;
        
        if (this._assets.sounds?.coin_pickup) {
            this._audio.playSfx(this._assets.sounds.coin_pickup.src, 1, 0.1);
        }
    }
    
    /**
     * Clamp player to level boundaries
     * @private
     */
    _clampPlayerToLevel() {
        this._player.x = Math.max(
            0,
            Math.min(this._levelWidth - this._player.width, this._player.x)
        );
    }
    
    /**
     * Check for win/lose conditions
     * @private
     */
    _checkGameStateConditions() {
        // Check if player died
        if (this._player.isDead?.() || this._hud._lives <= 0) {
            this._onGameOver();
        }
        
        // Check if boss is defeated and no more enemies
        if (!this._boss && this._enemies.length === 0 && this._coins.length === 0) {
            this._onLevelComplete();
        }
    }
    
    /**
     * Monitor entity counts for performance
     * @private
     */
    _monitorEntityCounts() {
        const counts = {
            bubbles: this._bubbles.length,
            enemies: this._enemies.length,
            obstacles: this._obstacles.length,
            hazards: this._hazards.length,
            coins: this._coins.length,
            bossProjectiles: this._bossProjectiles.length
        };
        
        // Log warnings for high entity counts
        Object.entries(counts).forEach(([type, count]) => {
            if (count > this._maxEntities[type] * 0.8) {
                console.warn(`[PlayScene] High ${type} count: ${count}/${this._maxEntities[type]}`);
            }
        });
    }
    
    /**
     * Log performance statistics
     * @private
     */
    _logPerformanceStats() {
        const stats = {
            entities: {
                bubbles: this._bubbles.length,
                enemies: this._enemies.length,
                obstacles: this._obstacles.length,
                hazards: this._hazards.length,
                coins: this._coins.length,
                bossProjectiles: this._bossProjectiles.length
            },
            boss: this._boss ? {
                hp: this._boss.hp,
                state: this._boss.state,
                phase: this._boss.currentPhase
            } : null
        };
        
        console.log('[PlayScene] Performance Stats:', stats);
    }
    
    /**
     * Check if point is in rectangle
     * @param {Object} point Point with x, y
     * @param {Object} rect Rectangle with x, y, w, h
     * @returns {boolean} True if point is in rectangle
     * @private
     */
    _pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.w &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.h;
    }
    
    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================
    
    /**
     * Handle player taking damage
     * @param {string} source Source of damage
     * @private
     */
    _onPlayerHit(source) {
        console.log(`[PlayScene] Player hit by ${source}`);
        // Could add screen shake, sound effects, etc.
    }
    
    /**
     * Handle enemy being killed
     * @param {string} method Method of killing
     * @private
     */
    _onEnemyKilled(method) {
        console.log(`[PlayScene] Enemy killed by ${method}`);
        // Could add particle effects, sound effects, etc.
    }
    
    /**
     * Handle boss taking damage
     * @private
     */
    _onBossHit() {
        console.log('[PlayScene] Boss hit');
        // Could add screen shake, sound effects, etc.
    }
    
    /**
     * Handle boss being defeated
     * @private
     */
    _onBossDefeated() {
        console.log('[PlayScene] Boss defeated!');
        // Could trigger victory sequence, sound effects, etc.
    }
    
    /**
     * Handle game over
     * @private
     */
    _onGameOver() {
        console.log('[PlayScene] Game Over');
        // TODO: Transition to game over scene
    }
    
    /**
     * Handle level completion
     * @private
     */
    _onLevelComplete() {
        console.log('[PlayScene] Level Complete');
        // TODO: Transition to victory scene
    }
    
    // =============================================================================
    // LEVEL LOADING
    // =============================================================================
    
    /**
     * Load level data with improved error handling
     * @param {Object} level Level data
     * @private
     */
    _loadLevel(level) {
        let furthestX = 0;
        
        console.log('[PlayScene] Loading level:', level);
        
        // Load enemies
        if (level.enemies) {
            level.enemies.forEach(enemy => {
                furthestX = Math.max(furthestX, enemy.x);
                this._createEnemy(enemy);
            });
        }
        
        // Load obstacles
        if (level.obstacles) {
            level.obstacles.forEach(obstacle => {
                furthestX = Math.max(furthestX, obstacle.x);
                this._createObstacle(obstacle);
            });
        }
        
        // Load hazards
        if (level.hazards) {
            level.hazards.forEach(hazard => {
                furthestX = Math.max(furthestX, hazard.x);
                this._createHazard(hazard);
            });
        }
        
        // Load collectibles
        if (level.collectibles) {
            level.collectibles.forEach(collectible => {
                furthestX = Math.max(furthestX, collectible.x);
                this._createCollectible(collectible);
            });
        }
        
        // Update level width
        this._levelWidth = furthestX + 200;
        
        console.log(`[PlayScene] Level loaded: width=${this._levelWidth}, entities=${this._enemies.length + this._obstacles.length + this._hazards.length + this._coins.length}`);
    }
    
    /**
     * Create enemy from level data
     * @param {Object} enemyData Enemy configuration
     * @private
     */
    _createEnemy(enemyData) {
        try {
            switch (enemyData.type) {
                case 'puffer':
                    this._enemies.push(
                        new PufferFish({
                            x: enemyData.x,
                            y: enemyData.y,
                            assets: this._assets.images,
                            sounds: this._assets.sounds,
                            audio: this._audio,
                        })
                    );
                    break;
                case 'jellyfish':
                    this._enemies.push(
                        new Jellyfish({
                            x: enemyData.x,
                            y: enemyData.y,
                            img: this._assets.images['jellyfish']
                        })
                    );
                    break;
                case 'boss':
                    this._boss = new EndBoss({
                        x: enemyData.x,
                        y: enemyData.y,
                        audio: this._audio
                    });
                    console.log('[PlayScene] Boss created');
                    break;
                default:
                    console.warn(`[PlayScene] Unknown enemy type: ${enemyData.type}`);
            }
        } catch (error) {
            console.error(`[PlayScene] Error creating enemy ${enemyData.type}:`, error);
        }
    }
    
    /**
     * Create obstacle from level data
     * @param {Object} obstacleData Obstacle configuration
     * @private
     */
    _createObstacle(obstacleData) {
        try {
            this._obstacles.push(
                new Obstacle({
                    x: obstacleData.x,
                    y: obstacleData.y,
                    width: 60,
                    height: 60,
                    damage: false,
                    img: this._assets.images['stone'],
                })
            );
        } catch (error) {
            console.error('[PlayScene] Error creating obstacle:', error);
        }
    }
    
    /**
     * Create hazard from level data
     * @param {Object} hazardData Hazard configuration
     * @private
     */
    _createHazard(hazardData) {
        try {
            this._hazards.push(
                new Hazard({
                    x: hazardData.x,
                    y: hazardData.y,
                    width: 60,
                    height: 60,
                    img: this._assets.images['poison_cloud'],
                    cycle: GameConfig.hazard.cycle,
                })
            );
        } catch (error) {
            console.error('[PlayScene] Error creating hazard:', error);
        }
    }
    
    /**
     * Create collectible from level data
     * @param {Object} collectibleData Collectible configuration
     * @private
     */
    _createCollectible(collectibleData) {
        try {
            if (collectibleData.type === 'coin') {
                const coin = new Coin({
                    x: collectibleData.x,
                    y: collectibleData.y,
                    img: this._assets.images['coin']
                });
                this._coins.push(coin);
                console.log(`[PlayScene] Coin created at (${collectibleData.x}, ${collectibleData.y})`);
            }
        } catch (error) {
            console.error('[PlayScene] Error creating collectible:', error);
        }
    }
}