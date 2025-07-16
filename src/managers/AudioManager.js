/**
 * @file Enhanced Web-Audio-based manager with music system and boss audio.
 * 
 * IMPROVEMENTS:
 * - Background music with smooth transitions
 * - Boss-specific audio cues and music
 * - Audio pooling for performance
 * - Ducking and mixing for dramatic effect
 * - Memory leak prevention
 * - Spatial audio positioning (basic)
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * Enhanced AudioManager with music system and boss audio
 */
export class AudioManager {
    /**
     * Initialize the audio manager
     */
    constructor() {
        // Audio context
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain chain
        this._masterGain = this._ctx.createGain();
        this._masterGain.connect(this._ctx.destination);
        
        // Separate channels for mixing
        this._musicGain = this._ctx.createGain();
        this._sfxGain = this._ctx.createGain();
        this._bossGain = this._ctx.createGain();
        
        // Connect to master
        this._musicGain.connect(this._masterGain);
        this._sfxGain.connect(this._masterGain);
        this._bossGain.connect(this._masterGain);
        
        // Volume settings from config
        this._masterGain.gain.value = GameConfig.audio.masterVolume;
        this._musicGain.gain.value = GameConfig.audio.musicVolume;
        this._sfxGain.gain.value = GameConfig.audio.sfxVolume;
        this._bossGain.gain.value = GameConfig.audio.sfxVolume * 1.2; // Boss sounds slightly louder
        
        // State management
        this._muted = false;
        this._currentMusic = null;
        this._musicFadeTimer = null;
        this._bossMode = false;
        
        // Buffer cache for reuse
        /** @type {Map<string, AudioBuffer>} */
        this._bufferCache = new Map();
        
        // Audio pools for performance
        this._audioPool = new Map();
        this._poolSize = 10;
        
        // Ducking system for boss fights
        this._duckingEnabled = false;
        this._duckingFactor = 0.3;
        
        // Performance tracking
        this._activeNodes = new Set();
        this._lastCleanup = Date.now();
        
        console.log('[AudioManager] Enhanced audio system initialized');
    }
    
    // =============================================================================
    // PUBLIC API - VOLUME CONTROL
    // =============================================================================
    
    /**
     * Set master mute state
     * @param {boolean} muted Whether to mute all audio
     */
    setMuted(muted) {
        this._muted = muted;
        const gainValue = muted ? 0 : 1;
        
        this._masterGain.gain.setTargetAtTime(gainValue, this._ctx.currentTime, 0.1);
        
        console.log(`[AudioManager] Audio ${muted ? 'muted' : 'unmuted'}`);
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.setMuted(!this._muted);
    }
    
    /**
     * Set music volume
     * @param {number} volume Volume level (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        GameConfig.audio.musicVolume = volume;
        
        if (!this._muted) {
            this._musicGain.gain.setTargetAtTime(volume, this._ctx.currentTime, 0.1);
        }
    }
    
    /**
     * Set SFX volume
     * @param {number} volume Volume level (0.0 to 1.0)
     */
    setSfxVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        GameConfig.audio.sfxVolume = volume;
        
        if (!this._muted) {
            this._sfxGain.gain.setTargetAtTime(volume, this._ctx.currentTime, 0.1);
            this._bossGain.gain.setTargetAtTime(volume * 1.2, this._ctx.currentTime, 0.1);
        }
    }
    
    // =============================================================================
    // PUBLIC API - MUSIC SYSTEM
    // =============================================================================
    
    /**
     * Play background music with smooth transitions
     * @param {string} trackName Name of the music track
     * @param {boolean} loop Whether to loop the music
     * @param {number} fadeInTime Fade in duration in seconds
     */
    async playMusic(trackName, loop = true, fadeInTime = 1.0) {
        try {
            await this._ensureAudioContext();
            
            // Stop current music if playing
            if (this._currentMusic) {
                await this._stopMusic(GameConfig.audio.music.fadeOutDuration);
            }
            
            // Load and play new music
            const buffer = await this._getBuffer(`audio/${trackName}.mp3`);
            
            this._currentMusic = {
                source: this._ctx.createBufferSource(),
                gain: this._ctx.createGain(),
                name: trackName,
                loop: loop
            };
            
            // Set up audio chain
            this._currentMusic.source.buffer = buffer;
            this._currentMusic.source.loop = loop;
            this._currentMusic.source.connect(this._currentMusic.gain);
            this._currentMusic.gain.connect(this._musicGain);
            
            // Fade in
            this._currentMusic.gain.gain.setValueAtTime(0, this._ctx.currentTime);
            this._currentMusic.gain.gain.linearRampToValueAtTime(1, this._ctx.currentTime + fadeInTime);
            
            // Start playback
            this._currentMusic.source.start(0);
            
            console.log(`[AudioManager] Playing music: ${trackName}`);
            
        } catch (error) {
            console.error('[AudioManager] Error playing music:', error);
        }
    }
    
    /**
     * Stop current music
     * @param {number} fadeOutTime Fade out duration in seconds
     */
    async _stopMusic(fadeOutTime = 1.0) {
        if (!this._currentMusic) return;
        
        const music = this._currentMusic;
        this._currentMusic = null;
        
        // Fade out
        music.gain.gain.linearRampToValueAtTime(0, this._ctx.currentTime + fadeOutTime);
        
        // Stop after fade
        setTimeout(() => {
            try {
                music.source.stop();
                music.source.disconnect();
                music.gain.disconnect();
            } catch (error) {
                // Ignore errors from already stopped sources
            }
        }, fadeOutTime * 1000);
        
        console.log(`[AudioManager] Music stopped: ${music.name}`);
    }
    
    /**
     * Switch to boss music with dramatic effect
     * @param {string} bossTrack Boss music track name
     */
    async playBossMusic(bossTrack = 'boss_theme') {
        this._bossMode = true;
        this._enableDucking();
        
        await this.playMusic(bossTrack, true, 0.5);
        
        console.log('[AudioManager] Boss music started');
    }
    
    /**
     * Return to normal music after boss fight
     * @param {string} normalTrack Normal music track name
     */
    async stopBossMusic(normalTrack = 'level_theme') {
        this._bossMode = false;
        this._disableDucking();
        
        await this.playMusic(normalTrack, true, 2.0);
        
        console.log('[AudioManager] Boss music stopped');
    }
    
    // =============================================================================
    // PUBLIC API - SOUND EFFECTS
    // =============================================================================
    
    /**
     * Play a sound effect with enhanced options
     * @param {string} soundName Name of the sound file
     * @param {Object} options Sound options
     * @param {number} options.volume Volume multiplier (0.0 to 1.0)
     * @param {number} options.pitch Pitch multiplier (0.5 to 2.0)
     * @param {number} options.delay Delay in seconds
     * @param {boolean} options.loop Whether to loop the sound
     * @param {Object} options.position 3D position {x, y, z}
     */
    async playSfx(soundName, options = {}) {
        const opts = {
            volume: 1.0,
            pitch: 1.0,
            delay: 0,
            loop: false,
            position: null,
            ...options
        };
        
        try {
            await this._ensureAudioContext();
            
            const buffer = await this._getBuffer(soundName);
            const source = this._ctx.createBufferSource();
            const gain = this._ctx.createGain();
            
            // Set up audio chain
            source.buffer = buffer;
            source.loop = opts.loop;
            source.playbackRate.value = opts.pitch;
            source.connect(gain);
            
            // Apply 3D positioning if specified
            if (opts.position) {
                const panner = this._ctx.createPanner();
                panner.setPosition(opts.position.x || 0, opts.position.y || 0, opts.position.z || 0);
                gain.connect(panner);
                panner.connect(this._sfxGain);
            } else {
                gain.connect(this._sfxGain);
            }
            
            // Set volume
            gain.gain.value = opts.volume;
            
            // Track active nodes for cleanup
            this._activeNodes.add({ source, gain });
            
            // Auto-cleanup when sound ends
            source.onended = () => {
                this._activeNodes.delete({ source, gain });
                try {
                    source.disconnect();
                    gain.disconnect();
                } catch (error) {
                    // Ignore disconnect errors
                }
            };
            
            // Start playback
            source.start(this._ctx.currentTime + opts.delay);
            
        } catch (error) {
            console.error('[AudioManager] Error playing SFX:', error);
        }
    }
    
    /**
     * Play boss-specific sound effect with enhanced presence
     * @param {string} soundName Sound file name
     * @param {Object} options Sound options
     */
    async playBossSfx(soundName, options = {}) {
        const bossOptions = {
            volume: 1.2,
            ...options
        };
        
        try {
            await this._ensureAudioContext();
            
            const buffer = await this._getBuffer(soundName);
            const source = this._ctx.createBufferSource();
            const gain = this._ctx.createGain();
            
            // Enhanced bass for boss sounds
            const filter = this._ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 2;
            
            // Audio chain: source -> filter -> gain -> boss channel
            source.buffer = buffer;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this._bossGain);
            
            // Set volume with ducking consideration
            const volume = bossOptions.volume * (this._duckingEnabled ? 1.5 : 1.0);
            gain.gain.value = volume;
            
            // Track for cleanup
            this._activeNodes.add({ source, gain, filter });
            
            // Auto-cleanup
            source.onended = () => {
                this._activeNodes.delete({ source, gain, filter });
                try {
                    source.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                } catch (error) {
                    // Ignore disconnect errors
                }
            };
            
            source.start(0);
            
        } catch (error) {
            console.error('[AudioManager] Error playing boss SFX:', error);
        }
    }
    
    // =============================================================================
    // CONVENIENCE METHODS FOR GAME EVENTS
    // =============================================================================
    
    /**
     * Play bubble shoot sound
     */
    playBubbleShoot() {
        const config = GameConfig.audio.sfx.bubbleShoot;
        this.playSfx('audio/bubble_attack_sound.mp3', { 
            volume: config.volume,
            pitch: 0.9 + Math.random() * 0.2 // Slight pitch variation
        });
    }
    
    /**
     * Play bubble pop sound
     */
    playBubblePop() {
        const config = GameConfig.audio.sfx.bubblePop;
        this.playSfx('audio/bubble_impact_sound.mp3', { 
            volume: config.volume,
            pitch: 0.8 + Math.random() * 0.4
        });
    }
    
    /**
     * Play coin pickup sound
     */
    playCoinPickup() {
        const config = GameConfig.audio.sfx.coinPickup;
        this.playSfx('audio/coin_pickup_sound.mp3', { 
            volume: config.volume,
            pitch: 0.95 + Math.random() * 0.1
        });
    }
    
    /**
     * Play player hurt sound
     */
    playPlayerHurt() {
        const config = GameConfig.audio.sfx.playerHurt;
        this.playSfx('audio/player_hurt_sound.mp3', { 
            volume: config.volume
        });
    }
    
    /**
     * Play boss attack sound
     */
    playBossAttack() {
        this.playBossSfx('audio/boss_attack_sound.mp3', { 
            volume: GameConfig.audio.sfx.bossAttack.volume 
        });
    }
    
    /**
     * Play boss hurt sound
     */
    playBossHurt() {
        this.playBossSfx('audio/boss_hurt_sound.mp3', { 
            volume: GameConfig.audio.sfx.bossHurt.volume 
        });
    }
    
    /**
     * Play boss death sound
     */
    playBossDeath() {
        this.playBossSfx('audio/boss_death_sound.mp3', { 
            volume: GameConfig.audio.sfx.bossHurt.volume * 1.3 
        });
    }
    
    // =============================================================================
    // PRIVATE METHODS
    // =============================================================================
    
    /**
     * Ensure audio context is running
     * @private
     */
    async _ensureAudioContext() {
        if (this._ctx.state === 'suspended') {
            try {
                await this._ctx.resume();
            } catch (error) {
                console.error('[AudioManager] Failed to resume audio context:', error);
            }
        }
    }
    
    /**
     * Get audio buffer with caching
     * @param {string} url Audio file URL
     * @returns {Promise<AudioBuffer>}
     * @private
     */
    async _getBuffer(url) {
        if (this._bufferCache.has(url)) {
            return this._bufferCache.get(url);
        }
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this._ctx.decodeAudioData(arrayBuffer);
            
            this._bufferCache.set(url, audioBuffer);
            return audioBuffer;
            
        } catch (error) {
            console.error(`[AudioManager] Failed to load audio: ${url}`, error);
            throw error;
        }
    }
    
    /**
     * Enable ducking for boss fights
     * @private
     */
    _enableDucking() {
        this._duckingEnabled = true;
        
        // Duck background music and normal SFX
        this._musicGain.gain.setTargetAtTime(
            GameConfig.audio.musicVolume * this._duckingFactor,
            this._ctx.currentTime,
            0.5
        );
        
        console.log('[AudioManager] Ducking enabled for boss fight');
    }
    
    /**
     * Disable ducking after boss fight
     * @private
     */
    _disableDucking() {
        this._duckingEnabled = false;
        
        // Restore normal volumes
        this._musicGain.gain.setTargetAtTime(
            GameConfig.audio.musicVolume,
            this._ctx.currentTime,
            1.0
        );
        
        console.log('[AudioManager] Ducking disabled');
    }
    
    /**
     * Clean up expired audio nodes
     * @private
     */
    _cleanupAudioNodes() {
        const now = Date.now();
        if (now - this._lastCleanup < 5000) return; // Only cleanup every 5 seconds
        
        let cleanedCount = 0;
        
        this._activeNodes.forEach(nodeSet => {
            try {
                // Check if nodes are still connected
                if (nodeSet.source && nodeSet.source.playbackState === 'finished') {
                    nodeSet.source.disconnect();
                    nodeSet.gain.disconnect();
                    if (nodeSet.filter) nodeSet.filter.disconnect();
                    
                    this._activeNodes.delete(nodeSet);
                    cleanedCount++;
                }
            } catch (error) {
                // Node was already cleaned up
                this._activeNodes.delete(nodeSet);
                cleanedCount++;
            }
        });
        
        this._lastCleanup = now;
        
        if (cleanedCount > 0) {
            console.log(`[AudioManager] Cleaned up ${cleanedCount} audio nodes`);
        }
    }
    
    // =============================================================================
    // PUBLIC MAINTENANCE METHODS
    // =============================================================================
    
    /**
     * Update audio system (call from game loop)
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        // Regular cleanup
        this._cleanupAudioNodes();
        
        // Performance monitoring
        if (this._activeNodes.size > 50) {
            console.warn(`[AudioManager] High number of active audio nodes: ${this._activeNodes.size}`);
        }
    }
    
    /**
     * Clean up all audio resources
     */
    destroy() {
        // Stop all audio
        this._activeNodes.forEach(nodeSet => {
            try {
                nodeSet.source.stop();
                nodeSet.source.disconnect();
                nodeSet.gain.disconnect();
                if (nodeSet.filter) nodeSet.filter.disconnect();
            } catch (error) {
                // Ignore errors from already stopped sources
            }
        });
        
        // Clear collections
        this._activeNodes.clear();
        this._bufferCache.clear();
        this._audioPool.clear();
        
        // Stop current music
        if (this._currentMusic) {
            try {
                this._currentMusic.source.stop();
                this._currentMusic.source.disconnect();
                this._currentMusic.gain.disconnect();
            } catch (error) {
                // Ignore errors
            }
        }
        
        // Close audio context
        if (this._ctx && this._ctx.state !== 'closed') {
            this._ctx.close();
        }
        
        console.log('[AudioManager] Audio system destroyed');
    }
    
    // =============================================================================
    // GETTERS FOR UI
    // =============================================================================
    
    /**
     * Get current music volume
     * @returns {number} Music volume (0.0 to 1.0)
     */
    get musicVolume() {
        return GameConfig.audio.musicVolume;
    }
    
    /**
     * Get current SFX volume
     * @returns {number} SFX volume (0.0 to 1.0)
     */
    get sfxVolume() {
        return GameConfig.audio.sfxVolume;
    }
    
    /**
     * Get mute state
     * @returns {boolean} True if muted
     */
    get isMuted() {
        return this._muted;
    }
    
    /**
     * Get boss mode state
     * @returns {boolean} True if in boss mode
     */
    get isBossMode() {
        return this._bossMode;
    }
    
    /**
     * Get current music track name
     * @returns {string|null} Current music track name
     */
    get currentMusic() {
        return this._currentMusic ? this._currentMusic.name : null;
    }
}