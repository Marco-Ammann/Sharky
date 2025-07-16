// Central place for gameplay-tuning variables.
// Adjust here instead of hunting magic numbers in code.

/**
 * Centralized gameplay configuration.
 * 
 * IMPROVEMENTS:
 * - Enhanced boss configuration with state machine settings
 * - Projectile type configurations
 * - Performance optimization settings
 * - Extended tunable parameters for settings overlay
 * - Memory management configurations
 */
export const GameConfig = {
    /** Character (Sharky) settings */
    character: {
        speed: 160, // pixels / s
        invulnTime: 1.5, // seconds of invulnerability after taking damage
        maxHealth: 3, // maximum health/lives
        attackDamage: 1, // damage dealt by melee attacks
        knockbackForce: 50, // knockback strength when hit
    },

    /** Bubble projectile settings */
    bubble: {
        cooldown: 1.8, // seconds between shots
        formationDuration: 0.48, // seconds mouth-blowing animation
        spawnOffsetY: 0.6, // % down sprite (0 top, 1 bottom)
        projSpawnDelay: 0.08, // seconds until projectile object appears
        speed: 230,
        lifespan: 2,
        radius: 20,
        damage: 1, // damage to enemies
        maxConcurrent: 20, // maximum bubbles on screen
    },

    /** Puffer fish enemy settings */
    puffer: {
        speed: 80,
        inflateProximity: 120, // px distance to inflate
        inflateDuration: 2, // seconds inflated
        frameDuration: 0.12, // seconds per animation frame
        health: 1,
        damage: 1,
        scoreValue: 10,
    },

    /** Jellyfish enemy settings */
    jellyfish: {
        size: 48,
        speed: 2, // radians per second for sine wave
        amplitude: 40, // pixels up/down from base Y
        health: 1,
        damage: 1,
        scoreValue: 15,
    },

    /** Background layers */
    background: {
        far: { speed: 10 },
        mid: { speed: 20 },
        near: { speed: 40 },
        dayNightTransitionSpeed: 0.25, // blend speed per second
    },

    /** Coin collectible */
    coin: {
        size: 28,
        color: '#ff0',
        scoreValue: 10,
        bounceHeight: 5, // pixels for bounce animation
        bounceSpeed: 3, // Hz for bounce animation
    },

    /** Obstacle settings */
    obstacle: {
        defaultWidth: 60,
        defaultHeight: 60,
        damageColor: 'purple',
        nonDamageColor: 'gray',
    },

    /** Hazard settings */
    hazard: {
        color: 'rgba(150,0,150,0.6)',
        cycle: 3, // seconds total cycle (active half)
        warningTime: 0.5, // seconds before becoming active
        damage: 1,
    },

    /** Enhanced End Boss settings */
    endBoss: {
        // Basic properties
        width: 120,
        height: 120,
        hp: 10,
        speed: 40,
        
        // Movement and positioning
        bounds: { left: 300, right: 2200 }, // patrol area
        
        // State machine timings
        spawnDuration: 2.0, // seconds for spawn animation
        idleDuration: 0.5, // seconds in idle state
        attackDelay: 2.4, // base seconds between attacks
        hurtStunDuration: 0.5, // seconds stunned when hurt
        deathDuration: 3.0, // seconds in death state
        
        // Attack system
        attackPreparationTime: 0.8, // seconds to prepare attack
        
        // Charge attack
        chargePreparationTime: 0.3, // seconds before charging
        chargeDuration: 1.5, // seconds of charging
        chargeSpeedMultiplier: 2.5, // speed multiplier during charge
        
        // Projectile system
        projectileSpeed: 160,
        projectileLifetime: 5.0, // seconds before projectile expires
        maxProjectiles: 15, // maximum concurrent projectiles
        
        // Projectile volley attack
        volleyProjectileCount: 3, // base projectiles in volley
        volleyProjectileCountPhase3: 5, // projectiles in phase 3+
        volleyFireInterval: 0.3, // seconds between projectiles
        
        // Slam attack
        slamRiseSpeed: -30, // pixels per second upward
        slamDownSpeed: 150, // pixels per second downward
        slamPreparationTime: 0.5, // seconds to rise
        slamDuration: 0.5, // seconds to slam down
        
        // Phase system
        phases: {
            1: { // 100% - 76% HP
                speedMultiplier: 1.0,
                attackDelayMultiplier: 1.0,
                availableAttacks: ['charge', 'projectile_volley']
            },
            2: { // 75% - 51% HP
                speedMultiplier: 1.3,
                attackDelayMultiplier: 0.8,
                availableAttacks: ['charge', 'projectile_volley', 'slam']
            },
            3: { // 50% - 26% HP
                speedMultiplier: 1.6,
                attackDelayMultiplier: 0.6,
                availableAttacks: ['charge', 'projectile_volley', 'slam']
            },
            4: { // 25% - 0% HP
                speedMultiplier: 1.9,
                attackDelayMultiplier: 0.4,
                availableAttacks: ['charge', 'projectile_volley', 'slam']
            }
        },
        
        // Visual effects
        hurtFlashDuration: 0.2, // seconds
        screenShakeIntensity: 0.5, // intensity multiplier
        screenShakeDecay: 2.0, // decay per second
        
        // Audio
        attackSounds: true,
        hurtSounds: true,
        deathSounds: true,
        
        // Score values
        scorePerHit: 50,
        scoreOnDeath: 200,
    },

    /** Boss Projectile settings */
    bossProjectile: {
        // Base projectile types
        types: {
            normal: {
                radius: 16,
                color: '#FF6B6B',
                damage: 1,
                speed: 160,
                trail: true,
                glow: true,
            },
            heavy: {
                radius: 25,
                color: '#8B4513',
                damage: 2,
                speed: 120,
                trail: true,
                glow: true,
            },
            explosive: {
                radius: 20,
                color: '#FF4500',
                damage: 3,
                speed: 140,
                trail: true,
                glow: true,
                explodeRadius: 40,
            },
            fast: {
                radius: 12,
                color: '#00FFFF',
                damage: 1,
                speed: 220,
                trail: true,
                glow: true,
            }
        },
        
        // Trail system
        trailLength: 8, // number of trail points
        trailLifetime: 0.5, // seconds
        trailUpdateInterval: 0.05, // seconds between trail points
        
        // Visual effects
        rotationSpeed: 2, // radians per second
        pulseSpeed: 4, // Hz
        glowIntensity: 0.3, // glow alpha multiplier
        
        // Performance
        maxLifetime: 5.0, // seconds
        screenBounds: { // pixels beyond screen edge
            margin: 100
        }
    },

    /** Heads-Up Display - Enhanced Layout */
    hud: {
        // Layout configuration
        layout: {
            margin: 12,
            lineHeight: 25,
            iconSize: 20,
            iconGap: 6,
        },
        
        // Component positions (will be used by HUD class)
        positions: {
            score: { x: 12, y: 12 },
            coins: { x: 200, y: 12 },
            coinBar: { x: 340, y: 16 },
            bubble: { x: 520, y: 8 },
            hearts: { x: 12, y: 40 },
            bossHp: { x: 210, y: 6, w: 300, h: 12 }
        },
        
        /** Graphical coin bar HUD */
        coinBar: {
            segmentWidth: 20,
            segmentHeight: 8,
            gap: 2,
            segments: 5, // number of bar segments
            coinsPerSegment: 5, // coins required to fill one segment
            fillColor: '#ffd700',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(0,0,0,0.5)',
        },
        
        // Visual styling
        textShadow: {
            color: 'rgba(0,0,0,0.7)',
            blur: 3,
            offsetX: 1,
            offsetY: 1,
        },
        
        // Animation settings
        heartPulseSpeed: 2, // Hz when low health
        bubbleCooldownPieSpeed: 1, // rotation speed
        bossHpBarFlashSpeed: 3, // Hz when boss is low health
    },

    /** Performance and optimization settings */
    performance: {
        // Entity limits
        maxEntities: {
            bubbles: 20,
            enemies: 10,
            obstacles: 50,
            hazards: 30,
            coins: 100,
            bossProjectiles: 15,
            particles: 100, // for future particle system
        },
        
        // Update frequency optimizations
        backgroundUpdateInterval: 0.016, // 60 FPS
        entityUpdateInterval: 0.016, // 60 FPS
        hudUpdateInterval: 0.033, // 30 FPS (UI doesn't need 60)
        
        // Memory management
        objectPooling: true,
        garbageCollectionInterval: 10.0, // seconds
        
        // Debug settings
        showPerformanceStats: false,
        logEntityCounts: false,
        showCollisionBoxes: false,
        showFPS: false,
    },

    /** Audio system configuration */
    audio: {
        // Volume levels (0.0 to 1.0)
        masterVolume: 1.0,
        musicVolume: 0.6,
        sfxVolume: 1.0,
        
        // Audio context settings
        sampleRate: 44100,
        bufferSize: 4096,
        
        // Sound effect settings
        sfx: {
            bubbleShoot: { volume: 0.9, offset: 0.2 },
            bubblePop: { volume: 0.8, offset: 0.1 },
            coinPickup: { volume: 1.0, offset: 0.1 },
            pufferInflate: { volume: 0.7, offset: 0.0 },
            playerHurt: { volume: 0.8, offset: 0.0 },
            bossHurt: { volume: 0.9, offset: 0.0 },
            bossAttack: { volume: 0.7, offset: 0.0 },
            enemyDeath: { volume: 0.6, offset: 0.0 },
        },
        
        // Music settings
        music: {
            fadeInDuration: 1.0, // seconds
            fadeOutDuration: 1.0, // seconds
            loopGapTolerance: 0.1, // seconds
        }
    },

    /** Level configuration */
    level: {
        // Default level dimensions
        defaultWidth: 2400,
        defaultHeight: 480,
        
        // Camera settings
        camera: {
            followSpeed: 5.0, // pixels per second catch-up
            deadZoneWidth: 200, // pixels before camera moves
            smoothing: true,
            bounds: true, // clamp to level bounds
        },
        
        // Spawn system
        spawning: {
            enemySpawnDelay: 2.0, // seconds between enemy spawns
            maxEnemiesPerType: 3,
            coinRespawnTime: 30.0, // seconds to respawn coins
        }
    },

    /** Particle system configuration (for future use) */
    particles: {
        // Water bubbles
        waterBubbles: {
            count: 50,
            speed: 20,
            lifetime: 3.0,
            size: 3,
            color: '#87CEEB',
        },
        
        // Coin sparkles
        coinSparkles: {
            count: 5,
            speed: 30,
            lifetime: 0.5,
            size: 2,
            color: '#FFD700',
        },
        
        // Explosion effects
        explosions: {
            count: 20,
            speed: 100,
            lifetime: 1.0,
            size: 4,
            color: '#FF6B35',
        }
    },

    /** Tunable settings whitelist for SettingsOverlay */
    tunables: {
        character: {
            speed: { min: 80, max: 260, step: 10, label: 'Speed', desc: 'Player movement speed' },
            invulnTime: { min: 0.5, max: 3.0, step: 0.1, label: 'Invuln Time', desc: 'Invulnerability duration after hit' },
        },
        
        bubble: {
            cooldown: { min: 0.4, max: 3.0, step: 0.1, label: 'Cooldown', desc: 'Time between bubble shots' },
            speed: { min: 150, max: 300, step: 10, label: 'Speed', desc: 'Bubble projectile speed' },
            lifespan: { min: 1.0, max: 5.0, step: 0.1, label: 'Lifespan', desc: 'Bubble lifetime in seconds' },
        },
        
        puffer: {
            speed: { min: 40, max: 120, step: 10, label: 'Speed', desc: 'Puffer fish movement speed' },
            inflateProximity: { min: 60, max: 240, step: 10, label: 'Inflate Dist.', desc: 'Distance to inflate near player' },
            inflateDuration: { min: 1.0, max: 4.0, step: 0.1, label: 'Inflate Time', desc: 'Inflation duration' },
        },
        
        endBoss: {
            hp: { min: 5, max: 20, step: 1, label: 'Health', desc: 'Boss health points' },
            speed: { min: 20, max: 80, step: 5, label: 'Speed', desc: 'Boss movement speed' },
            attackDelay: { min: 1.0, max: 5.0, step: 0.1, label: 'Attack Delay', desc: 'Time between boss attacks' },
            projectileSpeed: { min: 100, max: 250, step: 10, label: 'Projectile Speed', desc: 'Boss projectile speed' },
        },
        
        hud: {
            coinBarSegments: { min: 3, max: 10, step: 1, label: 'Coin Bar Segments', desc: 'Number of coin bar segments' },
            coinsPerSegment: { min: 1, max: 10, step: 1, label: 'Coins Per Segment', desc: 'Coins needed per segment' },
        },
        
        performance: {
            maxBubbles: { min: 10, max: 50, step: 5, label: 'Max Bubbles', desc: 'Maximum concurrent bubbles' },
            maxEnemies: { min: 5, max: 20, step: 1, label: 'Max Enemies', desc: 'Maximum concurrent enemies' },
            maxBossProjectiles: { min: 5, max: 30, step: 1, label: 'Max Boss Projectiles', desc: 'Maximum boss projectiles' },
        },
        
        audio: {
            musicVolume: { min: 0.0, max: 1.0, step: 0.1, label: 'Music Volume', desc: 'Background music volume' },
            sfxVolume: { min: 0.0, max: 1.0, step: 0.1, label: 'SFX Volume', desc: 'Sound effects volume' },
        }
    },

    /** Development and debugging settings */
    debug: {
        // Visual debug options
        showCollisionBoxes: false,
        showEntityCounts: false,
        showPerformanceStats: false,
        showStateInfo: false,
        showCameraInfo: false,
        
        // Console logging
        logEntityCreation: true,
        logStateTransitions: true,
        logCollisions: false,
        logPerformance: true,
        
        // Cheat codes (for development)
        godMode: false,
        infiniteAmmo: false,
        killAllEnemies: false,
        skipToNextLevel: false,
        
        // Performance monitoring
        trackMemoryUsage: true,
        warnOnHighEntityCount: true,
        profileFrameTime: false,
    }
};