class Level {
    enemies;
    barriers;
    backgroundLayers;
    level_end_x = 6175;

    constructor(enemies, barriers, backgroundLayers) {
        this.enemies = enemies;
        this.barriers = barriers;
        this.backgroundLayers = backgroundLayers;
    }
}