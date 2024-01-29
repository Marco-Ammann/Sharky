class Endboss extends MovableObject {
   height = 600;
   width = this.height * 1.168;
   x = 5800;
   y = -100;
   collisionBoxWidth = this.width * 0.75;
   collisionBoxHeight = this.height * 0.3;
   collisionBoxOffsetX = 50;
   collisionBoxOffsetY = 295;

   isAttacking = false;

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

   IMAGES_ATTACK = [
      'img/2.Enemy/3.Final_Enemy/Attack/1.png',
      'img/2.Enemy/3.Final_Enemy/Attack/2.png',
      'img/2.Enemy/3.Final_Enemy/Attack/3.png',
      'img/2.Enemy/3.Final_Enemy/Attack/4.png',
      'img/2.Enemy/3.Final_Enemy/Attack/5.png',
      'img/2.Enemy/3.Final_Enemy/Attack/6.png',
   ];

   constructor() {
      super().loadImage('img/2.Enemy/3.Final_Enemy/2.floating/1.png');
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_ATTACK);
      this.animate();
   }

   animate() {

      
      this.animationInterval = setInterval(() => {
         this.playAnimation(this.IMAGES_SWIM);
      }, 1000 / 8);

      this.attackIntervall = setInterval(() => {
         this.isAttacking = true;
         this.playAnimation(this.IMAGES_ATTACK);
         setTimeout(() => {
            this.isAttacking = false;
         }, 300);
      }, 1500);
      
   }
}
