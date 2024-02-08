/**
 * Represents a coin in the game, inheriting from MovableObject
 * Coins can be collected by the player to increase their score
 */
class Coin extends MovableObject {
   height = 40;
   width = this.height * 0.939;
   x = 350 + Math.random() * 5400;
   y = 10 + Math.random() * 400;

   collisionBoxWidth = this.width * 0.85;
   collisionBoxHeight = this.height * 0.85;
   collisionBoxOffsetX = 3;
   collisionBoxOffsetY = 3;

   world;

   IMAGES_COIN = [
      'img/4.Markers/1. Coins/1.png',
      'img/4.Markers/1. Coins/2.png',
      'img/4.Markers/1. Coins/3.png',
      'img/4.Markers/1. Coins/4.png',
   ];

   pickup_sound = new Audio('audio/coin_pickup_sound.mp3');

   
   constructor() {
      super().loadImage('img/4.Markers/1. Coins/1.png');
      this.loadImages(this.IMAGES_COIN);
      this.animate();
   }


   /**
    * Plays the coin pickup sound effect
    */
   playPickupSound() {
      this.pickup_sound.play();
      this.pickup_sound.volume = 0.15;
      setTimeout(() => {
         this.pickup_sound.pause();
         this.pickup_sound.currentTime = 0;
      }, 370);
   }


   /**
    * Animates the coin by cycling through its images
    */
   animate() {
      this.animationInterval = setInterval(() => {
         this.playAnimation(this.IMAGES_COIN);
      }, 1000 / 6);
   }


   /**
    * Clears the animation interval to stop the coin's animation
    */
   clearIntervals() {
      clearInterval(this.animationInterval);
   }
}
