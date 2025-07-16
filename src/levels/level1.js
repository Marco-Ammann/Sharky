/**
 * Example level definition for the modern engine.
 * Keep this purely data – NO DOM access. The PlayScene will interpret it.
 */

export default {
    // Array of enemy placements
    enemies: [
        { type: 'puffer', x: 800, y: 320 },
        { type: 'puffer', x: 1200, y: 320 },
        { type: 'boss', x: 600, y: 250 },
    ],

    // Static obstacles (stones / pillars etc.)
    obstacles: [{ type: 'stone', x: 600, y: 380 }],

    // Hazards like poison clouds/spikes
    hazards: [{ type: 'cloud', x: 1400, y: 320 }],

    // Collectibles (not yet implemented but reserved)
    collectibles: [
        { type: 'coin', x: 400, y: 250 },
        { type: 'coin', x: 600, y: 150 },
        { type: 'coin', x: 700, y: 280 },
    ],
};
