/**
 * Manages the display of the poison bar in the game, showing how much poison the player has.
 */
class PoisonBar extends DrawableObject {
   IMAGES = [
      'img/4.Markers/green/poisoned bubbles/0.png',
      'img/4.Markers/green/poisoned bubbles/20.png',
      'img/4.Markers/green/poisoned bubbles/40.png',
      'img/4.Markers/green/poisoned bubbles/60.png',
      'img/4.Markers/green/poisoned bubbles/80.png',
      'img/4.Markers/green/poisoned bubbles/100.png',
   ];

   percentage;
   

   constructor() {
      super();
      this.loadImages(this.IMAGES);
      this.x = 250;
      this.y = 0;
      this.height = 50;
      this.width = this.height * 3.766;
      this.setPercentage(0);
   }


   /**
    * Updates the poison bar's appearance based on the current percentage of poison.
    * @param {number} percentage - The current percentage of poison to display.
    */
   setPercentage(percentage) {
      this.percentage = percentage;
      let path = this.IMAGES[this.resolveImageIndex()];
      this.img = this.imageCache[path];
   }


   /**
    * Determines which image index to use based on the current percentage.
    * @returns {number} The index of the image that corresponds to the current poison level.
    */
   resolveImageIndex() {
      if (this.percentage >= 100) return 5;
      else if (this.percentage >= 80) return 4;
      else if (this.percentage >= 60) return 3;
      else if (this.percentage >= 40) return 2;
      else if (this.percentage >= 20) return 1;
      else return 0;
   }


   /**
    * Resets the poison bar to show 0% poison.
    */
   reset() {
      this.setPercentage(0);
   }
}
