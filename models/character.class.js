class Character extends MovableObject {
   height = 200;
   width = this.height * 1.227;
   x = 80;
   y = 200;
   world;
   speed = 5;
   collisionBoxWidth = this.width * 0.55;
   collisionBoxHeight = this.height * 0.2;
   collisionBoxOffsetX = 55;
   collisionBoxOffsetY = 108;
   floorY = 380;

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

   IMAGES_ATTACK = [
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/1.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/2.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/3.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/4.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/5.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/6.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/7.png',
      'img/1.Sharkie/4.Attack/Bubble trap/op1 (with bubble formation)/8.png',
   ];

   swim_sound = new Audio('audio/swim_sound.mp3');
   attack_sound = new Audio('audio/bubble_attack_sound.mp3');

   constructor() {
      super().loadImage('img/1.Sharkie/1.IDLE/1.png');
      this.loadImages(this.IMAGES_IDLE);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_DEAD);
      this.loadImages(this.IMAGES_HURT);
      this.loadImages(this.IMAGES_ATTACK);
      this.animate();
   }


   playAttackAnimation() {
      if (this.attackAnimationFrame < this.IMAGES_ATTACK.length) {
         let path = this.IMAGES_ATTACK[this.attackAnimationFrame];
         this.img = this.imageCache[path];
         this.attackAnimationFrame++;
      } else {
         this.isAttacking = false;
         this.attackAnimationFrame = 0;
      }
   }


   playSwimSound() {
      this.swim_sound.play();
      this.swim_sound.volume = 0.15;
   }
   

   animate() {
      this.movementInterval = setInterval(() => {
         const { RIGHT, LEFT, UP, DOWN } = this.world.keyboard;

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
         if (this.world.keyboard.SPACE && !this.isAttacking && !this.bubbleCooldown) {
            this.isAttacking = true;
            setTimeout(() => {
               this.shootBubble();
            }, 600);
         }
      }, 1000 / 60);

      let attackFrameRate = 1000 / 100;
      let lastAttackFrameTime = 0;

      this.animationInterval = setInterval(() => {
         const { RIGHT, LEFT, UP, DOWN } = this.world.keyboard;
         let isMoving = false;
         let now = Date.now();

         if (this.isAttacking) {
            if (now - lastAttackFrameTime > attackFrameRate) {
               this.playAttackAnimation();
               this.playAttackSound();
               lastAttackFrameTime = now;
            }
         } else {
            if (this.isDead()) {
               this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
               this.playAnimation(this.IMAGES_HURT);
            } else if (!this.isAttacking) {
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
         }
      }, 1000 / 10);
   }


   clearIntervals() {
      clearInterval(this.movementInterval);
      clearInterval(this.animationInterval);
   }


   shootBubble() {
      if (!this.isDead() && !this.bubbleCooldown) {
          let bubble = new ThrowableObject(
              this.x,
              this.y,
              this.y,
              this.otherDirection,
              this.world.inventory.poisonBottles
          );
          this.world.throwables.push(bubble);
          if (this.world.inventory.poisonBottles > 0) {
              this.world.inventory.poisonBottles -= 1;
              this.world.poisonBar.setPercentage(this.world.inventory.poisonBottles * 20);
          } else if (this.world.inventory.poisonBottles <= 0) {
              this.world.inventory.poisonBottles = 0;
              this.world.poisonBar.setPercentage(0);
          }

          let removeBubbleTimeout = setTimeout(() => {
              bubble.removeBubble();
          }, 2500);
          globalTimeouts.push(removeBubbleTimeout);

          this.bubbleCooldown = true;
          let cooldownTimeout = setTimeout(() => {
              this.bubbleCooldown = false;
          }, 1000);
          globalTimeouts.push(cooldownTimeout);
      }
  }


}
