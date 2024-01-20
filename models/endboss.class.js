class Endboss extends MovableObject {
   height = 600;
   width = this.height * 1.168;
   x = 6450;
   y = -100;
   collisionBoxWidth = this.width * 0.85;
   collisionBoxHeight = this.height * 0.35; 
   collisionBoxOffsetX = 40;
   collisionBoxOffsetY = 280;

   IMAGES_SWIM = [
      'img/2.Enemy/3.Final_Enemy/2.floating/1.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/2.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/3.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/4.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/5.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/6.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/7.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/8.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/9.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/10.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/11.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/12.png',
      'img/2.Enemy/3.Final_Enemy/2.floating/13.png',
   ];

   constructor() {
      super().loadImage('img/2.Enemy/3.Final_Enemy/2.floating/1.png');
      this.loadImages(this.IMAGES_SWIM);
      this.animate();
   }

   animate() {
      setInterval(() => {
         this.playAnimation(this.IMAGES_SWIM);
      }, 1000 / 8);
   }
}
