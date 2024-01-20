class Level {
    enemies;
    barriers;
    backgroundLayers;
    music;
    level_end_x = 6130;

    constructor(enemies, barriers, backgroundLayers, music) {
        this.enemies = enemies;
        this.barriers = barriers;
        this.backgroundLayers = backgroundLayers;
        this.music = music;
    }
}