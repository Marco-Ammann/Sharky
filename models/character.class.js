class Character extends MovableObject {
   height = 200;
   width = this.height * 1.227;
   x = 80;
   y = 200;
   world;
   speed = 8;
   collisionBoxWidth = this.width * 0.55;
   collisionBoxHeight = this.height * 0.2;
   collisionBoxOffsetX = 55;
   collisionBoxOffsetY = 108;

   bubbleCooldown = false;


   IMAGES_IDLE = [
      'img/1.Sharkie/1.IDLE/1.png',
      'img/1.Sharkie/1.IDLE/2.png',
      'img/1.Sharkie/1.IDLE/3.png',
      'img/1.Sharkie/1.IDLE/4.png',
      'img/1.Sharkie/1.IDLE/5.png',
      'img/1.Sharkie/1.IDLE/6.png',
      'img/1.Sharkie/1.IDLE/7.png',
      'img/1.Sharkie/1.IDLE/8.png',
      'img/1.Sharkie/1.IDLE/9.png',
      'img/1.Sharkie/1.IDLE/10.png',
      'img/1.Sharkie/1.IDLE/11.png',
      'img/1.Sharkie/1.IDLE/12.png',
      'img/1.Sharkie/1.IDLE/13.png',
      'img/1.Sharkie/1.IDLE/14.png',
      'img/1.Sharkie/1.IDLE/15.png',
      'img/1.Sharkie/1.IDLE/16.png',
      'img/1.Sharkie/1.IDLE/17.png',
      'img/1.Sharkie/1.IDLE/18.png',
   ];

   IMAGES_SWIM = [
      'img/1.Sharkie/3.Swim/1.png',
      'img/1.Sharkie/3.Swim/2.png',
      'img/1.Sharkie/3.Swim/3.png',
      'img/1.Sharkie/3.Swim/4.png',
      'img/1.Sharkie/3.Swim/5.png',
      'img/1.Sharkie/3.Swim/6.png',
   ];

   IMAGES_DEAD = [
      'img/1.Sharkie/6.dead/1.Poisoned/1.png', // 0
      'img/1.Sharkie/6.dead/1.Poisoned/2.png',
      'img/1.Sharkie/6.dead/1.Poisoned/3.png',
      'img/1.Sharkie/6.dead/1.Poisoned/4.png',
      'img/1.Sharkie/6.dead/1.Poisoned/5.png',
      'img/1.Sharkie/6.dead/1.Poisoned/6.png',
      'img/1.Sharkie/6.dead/1.Poisoned/7.png',
      'img/1.Sharkie/6.dead/1.Poisoned/8.png',
      'img/1.Sharkie/6.dead/1.Poisoned/9.png',
      'img/1.Sharkie/6.dead/1.Poisoned/10.png',
      'img/1.Sharkie/6.dead/1.Poisoned/11.png',
      'img/1.Sharkie/6.dead/1.Poisoned/12.png', //11
   ];

   IMAGES_HURT = [
      'img/1.Sharkie/5.Hurt/1.Poisoned/1.png',
      'img/1.Sharkie/5.Hurt/1.Poisoned/2.png',
      'img/1.Sharkie/5.Hurt/1.Poisoned/3.png',
      'img/1.Sharkie/5.Hurt/1.Poisoned/4.png',
      'img/1.Sharkie/5.Hurt/1.Poisoned/5.png',
   ];

   swim_sound = new Audio('audio/swim_sound.mp3');

   constructor() {
      super().loadImage('img/1.Sharkie/1.IDLE/1.png');
      this.loadImages(this.IMAGES_IDLE);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_DEAD);
      this.loadImages(this.IMAGES_HURT);
      this.animate();
   }

   animate() {
      this.movementInterval = setInterval(() => {
         const { RIGHT, LEFT, UP, DOWN, SPACE } = this.world.keyboard;

         if (RIGHT && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
            this.world.camera_x = -this.x + 80;
            this.playSwimSound();
         }
         if (UP && this.y > 0 - this.height / 2.5) {
            this.moveUp();
            this.playSwimSound();
         }
         if (DOWN && this.y < 480 - this.height * 0.85) {
            this.moveDown();
            this.playSwimSound();
         }
         if (LEFT && this.x > 80) {
            this.moveLeft();
            this.otherDirection = true;
            this.world.camera_x = -this.x + 80;
            this.playSwimSound();
         }

         if (SPACE) {
            this.shootBubble();
        }
      }, 1000 / 60);

      this.animationInterval = setInterval(() => {
         const { RIGHT, LEFT, UP, DOWN } = this.world.keyboard;
         let isMoving = false;

         if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
         } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
         } else {
            this.deathAnimationPlayed = false;

            if (RIGHT || UP || DOWN || LEFT) {
               this.playAnimation(this.IMAGES_SWIM);
               isMoving = true;
            } else {
               this.playAnimation(this.IMAGES_IDLE);
            }

            if (!isMoving) {
               this.swim_sound.pause();
               this.swim_sound.currentTime = 0;
            }
         }
      }, 1000 / 8);
   }

   shootBubble() {
      if (!this.isDead() && !this.bubbleCooldown) {
          console.log('Shooting bubble');
          let bubble = new ThrowableObject(this.x, this.y, this.otherDirection);
          this.world.throwables.push(bubble);

          setTimeout(() => {
              bubble.removeBubble();
          }, 2000);

          this.bubbleCooldown = true;
          setTimeout(() => {
              this.bubbleCooldown = false;
          }, 1000);
      }
  }
  
}
