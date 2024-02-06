class Poison extends MovableObject {
   height = 80;
   width = this.height * 0.732;
   x = 750 + Math.random() * 5000;
   y = 10 + Math.random() * 400;

   collisionBoxWidth = this.width * 0.6;
   collisionBoxHeight = this.height * 0.45;
   collisionBoxOffsetX = 10;
   collisionBoxOffsetY = 35;

   world;

   IMAGES_POISON = [
      'img/4.Markers/Poison/Animation/1.png',
      'img/4.Markers/Poison/Animation/2.png',
      'img/4.Markers/Poison/Animation/3.png',
      'img/4.Markers/Poison/Animation/4.png',
      'img/4.Markers/Poison/Animation/5.png',
      'img/4.Markers/Poison/Animation/6.png',
      'img/4.Markers/Poison/Animation/7.png',
      'img/4.Markers/Poison/Animation/8.png',
   ];

   pickup_sound = new Audio('audio/bottle_sound.mp3');


   constructor() {
      super().loadImage('img/4.Markers/Poison/Animation/1.png');
      this.loadImages(this.IMAGES_POISON);
      this.animate();
   }


   playPickupSound() {
      this.pickup_sound.play();
      this.pickup_sound.volume = 0.15;
      setTimeout(() => {
         this.pickup_sound.pause();
         this.pickup_sound.currentTime = 0;
      }, 370);
   }


   animate() {
      this.animationInterval = setInterval(() => {
         this.playAnimation(this.IMAGES_POISON);
      }, 1000 / 10);
   }
}