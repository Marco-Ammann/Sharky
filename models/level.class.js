class Level {
    enemies;
    barriers;
    backgroundLayers;
    music;
    collectables;
    level_end_x = 6130;

    constructor(enemies, barriers, backgroundLayers, music, collectables) {
        this.enemies = enemies;
        this.barriers = barriers;
        this.backgroundLayers = backgroundLayers;
        this.music = music;
        this.collectables = collectables;
    }
}