/**
 * @file Simple Heads-Up Display: score text and heart icons.
 * Improved positioning and cleaned up duplicate code.
 */

import { GameConfig } from '../config/GameConfig.js';

/**
 * HUD with improved layout and consistent positioning
 */
export class HUD {
    /**
     * @param {HTMLImageElement} bubbleImg Bubble sprite to use for HUD icon
     * @param {HTMLImageElement} coinImg Coin sprite to use for HUD icon
     */
    constructor(bubbleImg, coinImg) {
        /** @private */ this._score = 0;
        /** @private */ this._coins = 0;
        /** @private */ this._bubbleImg = bubbleImg;
        /** @private */ this._coinImg = coinImg;
        /** @private */ this._lives = 3;
        
        // Improved HUD layout constants
        /** @private */ this._layout = {
            margin: 12,
            lineHeight: 25,
            iconSize: 20,
            iconGap: 6,
            
            // Top row positions (y = 12)
            score: { x: 12, y: 12 },
            coins: { x: 200, y: 12 },
            coinBar: { x: 340, y: 16 },
            bubble: { x: 520, y: 8 },
            
            // Second row positions (y = 40)
            hearts: { x: 12, y: 40 },
            
            // Boss HP bar (centered, top)
            bossHp: { x: 210, y: 6, w: 300, h: 12 }
        };
    }

    /**
     * Add points to score
     * @param {number} points
     */
    addScore(points = 1) {
        this._score += points;
    }

    /**
     * Increment coin counter (used for HUD bar).
     * @param {number} c
     */
    addCoin(c = 1) {
        this._coins += c;
    }

    /**
     * Remove a life from player
     */
    loseLife() {
        this._lives = Math.max(0, this._lives - 1);
    }

    /**
     * Draws HUD elements with improved positioning.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} bubbleCd Remaining cooldown seconds
     * @param {number} bubbleCdMax Max cooldown seconds
     * @param {number|null} bossHp Boss HP (null if no boss)
     * @param {number} bossHpMax Max boss HP
     */
    render(ctx, bubbleCd = 0, bubbleCdMax = 1, bossHp = null, bossHpMax = 1) {
        ctx.save();
        
        // Common text styling
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.textBaseline = 'top';

        /* ---------- SCORE (Top Left) ---------- */
        const scorePos = this._layout.score;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`Score: ${this._score}`, scorePos.x, scorePos.y);

        /* ---------- COINS (Top, after score) ---------- */
        const coinPos = this._layout.coins;
        const iconSize = this._layout.iconSize;
        const iconGap = this._layout.iconGap;
        
        // Coin icon
        if (this._coinImg) {
            ctx.drawImage(this._coinImg, coinPos.x, coinPos.y, iconSize, iconSize);
        } else {
            // Fallback yellow circle
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(coinPos.x + iconSize/2, coinPos.y + iconSize/2, iconSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Coin count text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`x ${this._coins}`, coinPos.x + iconSize + iconGap, coinPos.y + 2);

        /* ---------- COIN BAR (Progress Bar) ---------- */
        const barCfg = GameConfig.hud.coinBar;
        if (barCfg) {
            const barPos = this._layout.coinBar;
            const {
                segmentWidth: segW,
                segmentHeight: segH,
                gap,
                segments,
                coinsPerSegment,
            } = barCfg;

            const filledSegments = Math.min(segments, Math.floor(this._coins / coinsPerSegment));
            const partial = (this._coins % coinsPerSegment) / coinsPerSegment;

            for (let i = 0; i < segments; i++) {
                const segX = barPos.x + i * (segW + gap);
                
                // Background with subtle border
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(segX, barPos.y, segW, segH);
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(segX, barPos.y, segW, segH);

                // Fill progress
                if (i < filledSegments) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(segX, barPos.y, segW, segH);
                } else if (i === filledSegments && partial > 0) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(segX, barPos.y, segW * partial, segH);
                }
            }
        }

        /* ---------- BUBBLE COOLDOWN (Top Right) ---------- */
        const bubblePos = this._layout.bubble;
        const bubbleSize = 32;
        
        // Bubble icon
        if (this._bubbleImg) {
            ctx.drawImage(this._bubbleImg, bubblePos.x, bubblePos.y, bubbleSize, bubbleSize);
        } else {
            // Fallback circle
            ctx.fillStyle = '#4af';
            ctx.beginPath();
            ctx.arc(bubblePos.x + bubbleSize/2, bubblePos.y + bubbleSize/2, bubbleSize/2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cooldown pie overlay
        const cdFraction = Math.max(0, Math.min(1, bubbleCd / bubbleCdMax));
        if (cdFraction > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            const centerX = bubblePos.x + bubbleSize/2;
            const centerY = bubblePos.y + bubbleSize/2;
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, bubbleSize/2, -Math.PI/2, -Math.PI/2 + cdFraction * Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        // Cooldown text below icon
        if (bubbleCd > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${bubbleCd.toFixed(1)}s`, 
                bubblePos.x + bubbleSize/2, 
                bubblePos.y + bubbleSize + 4
            );
            ctx.textAlign = 'left'; // Reset
        }

        /* ---------- PLAYER LIVES (Second Row) ---------- */
        const heartPos = this._layout.hearts;
        const heartSize = 18;
        ctx.font = `${heartSize}px Arial`;
        ctx.fillStyle = '#ff4444';
        
        for (let i = 0; i < this._lives; i++) {
            const heartX = heartPos.x + i * (heartSize + 4);
            ctx.fillText('❤', heartX, heartPos.y);
        }

        /* ---------- BOSS HP BAR (Bottom Center) ---------- */
        if (bossHp !== null && bossHpMax > 0) {
                        const layoutBar = this._layout.bossHp;
            const barW = layoutBar.w;
            const barH = layoutBar.h;
            const margin = this._layout.margin;
            // Center horizontally, bottom offset by margin
            const barX = (ctx.canvas.width - barW) / 2;
            const barY = ctx.canvas.height - barH - margin;
            const hpFraction = Math.max(0, Math.min(1, bossHp / bossHpMax));

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);

            // HP fill
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(barX, barY, barW * hpFraction, barH);

            // Boss label above bar
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS', barX + barW / 2, barY - 14);
            ctx.textAlign = 'left'; // Reset
        }

        ctx.restore();
    }
}