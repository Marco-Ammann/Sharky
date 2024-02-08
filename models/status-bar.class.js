/**
 * Represents a status bar in the game, used to display the player's health
 * Inherits from DrawableObject to handle displaying images corresponding to different status levels
 */
class StatusBar extends DrawableObject {
   IMAGES = [
      'img/4.Markers/green/Life/0.png',
      'img/4.Markers/green/Life/20.png',
      'img/4.Markers/green/Life/40.png',
      'img/4.Markers/green/Life/60.png',
      'img/4.Markers/green/Life/80.png',
      'img/4.Markers/green/Life/100.png',
   ];
   percentage = 100;


   constructor() {
      super();
      this.loadImages(this.IMAGES);
      this.x = 10;
      this.y = 0;
      this.height = 50;
      this.width = this.height * 3.766;
      this.setPercentage(100);
   }


   /**
    * Updates the status bar to reflect the current percentage, changing the displayed image accordingly.
    * @param {number} percentage - The current percentage value to display on the status bar.
    */
   setPercentage(percentage) {
      this.percentage = percentage;
      let path = this.IMAGES[this.resolveImageIndex()];
      this.img = this.imageCache[path];
   }


   /**
    * Determines the index of the image to use based on the current percentage.
    * @returns {number} The index of the image that best represents the current status level.
    */
   resolveImageIndex() {
      if (this.percentage === 100) return 5;
      else if (this.percentage >= 80) return 4;
      else if (this.percentage >= 60) return 3;
      else if (this.percentage >= 40) return 2;
      else if (this.percentage >= 20) return 1;
      else return 0;
   }


   /**
    * Resets the status bar to its maximum value (100%).
    */
   reset() {
      this.setPercentage(100);
   }
}
