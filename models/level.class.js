/**
 * Represents a game level, including enemies, barriers, background layers, music, and collectables.
 */
class Level {
   enemies;
   barriers;
   backgroundLayers;
   music;
   collectables;
   level_end_x = 6130;
   

   /**
    * Initializes a new instance of the Level class with specified elements.
    * @param {MovableObject[]} enemies - An array of enemy objects in the level.
    * @param {MovableObject[]} barriers - An array of barrier objects that can block or damage the player.
    * @param {DrawableObject[]} backgroundLayers - An array of background layer objects for the level's visual backdrop.
    * @param {Audio} music - The background music track for the level.
    * @param {MovableObject[]} collectables - An array of collectable objects that the player can gather for benefits.
    */
   constructor(enemies, barriers, backgroundLayers, music, collectables) {
      this.enemies = enemies;
      this.barriers = barriers;
      this.backgroundLayers = backgroundLayers;
      this.music = music;
      this.collectables = collectables;
   }
}
