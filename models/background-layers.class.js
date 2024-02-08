/**
 * Represents a layer of the background in the game, extending the MovableObject class to include movement capabilities
 */
class BackgroundLayer extends MovableObject {
   height = 480;
   width = this.height * 3.55;

   /**
    * Initializes a new instance of the BackgroundLayer class with a specified image path and initial x-coordinate
    * @param {string} imagePath The path to the background image file
    * @param {number} x The initial x-coordinate position of the background layer
    */
   constructor(imagePath, x) {
       super().loadImage(imagePath);
       this.x = x;
       this.y = 480 - this.height;
   }
}
