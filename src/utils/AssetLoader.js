/**
 * @file Simple utility for pre-loading images and audio files with progress tracking.
 * All code is written as ES modules and fully documented with JSDoc.
 *
 * Usage example:
 * ```js
 * import { AssetLoader } from './utils/AssetLoader.js';
 *
 * const manifest = {
 *   images: {
 *     shark: 'img/shark.png',
 *     background: 'img/bg.png'
 *   },
 *   sounds: {
 *     bite: 'audio/bite.mp3'
 *   }
 * };
 *
 * const loader = new AssetLoader(manifest);
 * const assets = await loader.loadAll((p) => console.log(`Loading ${p}%`));
 * // assets.images.shark is an <img> element, assets.sounds.bite is an <audio> element
 * ```
 */

/**
 * @typedef {object} AssetManifest
 * @property {Record<string,string>} [images]  Mapping from asset key to image URL.
 * @property {Record<string,string>} [sounds]  Mapping from asset key to audio URL.
 */

/**
 * @typedef {object} LoadedAssets
 * @property {Record<string,HTMLImageElement>} images  Loaded <img> elements keyed by manifest key.
 * @property {Record<string,HTMLAudioElement>} sounds  Loaded <audio> elements keyed by manifest key.
 */

/**
 *
 */
export class AssetLoader {
    /**
     * Creates a new AssetLoader instance.
     * @param {AssetManifest} manifest  The asset manifest describing all assets to load.
     */
    constructor(manifest) {
        /** @private */
        this._manifest = manifest;
        /** @private */
        this._totalCount = this._countManifestEntries(manifest);
        /** @private */
        this._loadedCount = 0;
        /** @type {LoadedAssets} */
        this.assets = {
            images: {},
            sounds: {},
        };
    }

    /**
     * Loads every asset declared in the manifest.
     * @param {(progress:number)=>void} [onProgress] Optional callback invoked with percent complete (0-100).
     * @returns {Promise<LoadedAssets>} Resolves with the loaded asset objects.
     */
    async loadAll(onProgress) {
        /**
         * Helper to wrap each asset load promise so that failures don't abort the
         * entire loading process. We still count failed assets toward the total so
         * that progress reaches 100%.
         * @param {Promise<any>} p
         */
        const track = (p) =>
            p
                .then((res) => ({ ok: true, res }))
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.warn('[AssetLoader] Failed to load asset', err);
                    return { ok: false, err };
                })
                .finally(() => {
                    this._loadedCount++;
                    if (typeof onProgress === 'function') {
                        onProgress(Math.round((this._loadedCount / this._totalCount) * 100));
                    }
                });
        const promises = [];

        if (this._manifest.images) {
            for (const [key, url] of Object.entries(this._manifest.images)) {
                promises.push(
                    track(
                        this._loadImage(url).then((img) => {
                            this.assets.images[key] = img;
                        })
                    )
                );
            }
        }

        if (this._manifest.sounds) {
            for (const [key, url] of Object.entries(this._manifest.sounds)) {
                promises.push(
                    track(
                        this._loadAudio(url).then((audio) => {
                            this.assets.sounds[key] = audio;
                        })
                    )
                );
            }
        }

        // Wait for all (settled) asset promises.
        await Promise.all(promises);
        return this.assets;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /**
     * Counts total entries in the manifest.
     * @param {AssetManifest} manifest
     * @returns {number}
     * @private
     */
    _countManifestEntries(manifest) {
        let count = 0;
        if (manifest.images) count += Object.keys(manifest.images).length;
        if (manifest.sounds) count += Object.keys(manifest.sounds).length;
        return count;
    }

    /**
     * Loads a single image.
     * @param {string} url
     * @returns {Promise<HTMLImageElement>}
     * @private
     */
    _loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        });
    }

    /**
     * Loads a single audio file.
     * @param {string} url
     * @returns {Promise<HTMLAudioElement>}
     * @private
     */
    _loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = url;
            // Use canplaythrough for better reliability than onloadeddata
            const onReady = () => {
                audio.removeEventListener('canplaythrough', onReady);
                resolve(audio);
            };
            audio.addEventListener('canplaythrough', onReady);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
        });
    }
}
