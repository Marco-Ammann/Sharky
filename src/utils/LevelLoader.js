/**
 * @file Loads level data modules on demand.
 * Levels live in `src/levels/` and each default-export a plain object.
 */

/**
 * Dynamically import a level module by name (e.g. "level1").
 * @param {string} levelName
 * @returns {Promise<any>} Level data object
 */
export async function loadLevel(levelName) {
    try {
        const mod = await import(`../levels/${levelName}.js`);
        return mod.default ?? mod;
    } catch (err) {
        console.error('[LevelLoader] Failed to load', levelName, err);
        throw err;
    }
}
