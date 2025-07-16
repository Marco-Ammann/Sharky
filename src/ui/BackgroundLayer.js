/**
 * @file Simple scrolling background layer for parallax effect.
 */

/**
 * Single parallax layer – draws the provided image repeating horizontally,
 * offset based on the camera X to create parallax.
 */
export class BackgroundLayer {
    /**
     * @param {{ img: CanvasImageSource; factor: number; canvas: HTMLCanvasElement }} opts
     *   img       Image asset for the layer (repeat-x).
     *   factor    Parallax factor (0 = static sky, 1 = foreground moves with world).
     *   canvas    Target canvas – used for width/height when tiling.
     */
    constructor({ img, imgNight = null, factor, canvas, stretch = true }) {
        this._img = img;
        this._imgNight = imgNight;
        this._factor = factor;
        this._canvas = canvas;
        this._stretch = stretch;
    }

    /**
     * Draw layer.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} camX World camera X (in px)
     */
    render(ctx, camX = 0, nightFactor = 0) {
        const { width, height } = this._canvas;
        const imgH = this._img.height;
        const originalW = this._img.width;
        const originalH = this._img.height;
        const scale = this._stretch ? height / originalH : 1;
        const imgW = originalW * scale;
        // Compute offset: move opposite to camera, scaled by parallax factor.
        let drawX = (-camX * this._factor) % imgW;
        // Ensure seamless tiling
        if (drawX > 0) drawX -= imgW;
        for (; drawX < width; drawX += imgW) {
            // Day image
            if (nightFactor < 1) {
                if (nightFactor > 0) ctx.globalAlpha = 1 - nightFactor;
                if (this._stretch) {
                    ctx.drawImage(
                        this._img,
                        0,
                        0,
                        originalW,
                        originalH,
                        drawX,
                        0,
                        imgW,
                        height
                    );
                } else {
                    ctx.drawImage(this._img, drawX, height - imgH);
                }
            }
            // Night overlay (fade in)
            if (this._imgNight && nightFactor > 0) {
                ctx.globalAlpha = nightFactor;
                if (this._stretch) {
                    ctx.drawImage(
                        this._imgNight,
                        0,
                        0,
                        originalW,
                        originalH,
                        drawX,
                        0,
                        imgW,
                        height
                    );
                } else {
                    ctx.drawImage(this._imgNight, drawX, height - imgH);
                }
            }
            ctx.globalAlpha = 1;
        }
    }
}
