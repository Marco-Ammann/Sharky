class Endboss extends MovableObject {
   height = 600;
   width = this.height * 1.168;
   x = 5800 - 5300;
   y = -145;
   collisionBoxWidth = this.width * 0.75;
   collisionBoxHeight = this.height * 0.3;
   collisionBoxOffsetX = 50;
   collisionBoxOffsetY = 295;

   isAttacking = false;
   isHurt = false;
   isHurtAnimationPlaying = false;

   healthPoints = 40;

   verticalSpeed = 2;
   verticalRange = 140;
   verticalDirection = 1;
   horizontalSpeed = 0.4;
   originalY = -145;
   originalX = 5800;

   currentHurtImage = 0;

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

   IMAGES_HURT = [
      'img/2.Enemy/3.Final_Enemy/Hurt/1.png',
      'img/2.Enemy/3.Final_Enemy/Hurt/2.png',
      'img/2.Enemy/3.Final_Enemy/Hurt/3.png',
      'img/2.Enemy/3.Final_Enemy/Hurt/4.png',
   ];

   IMAGES_DEAD = [
      'img/2.Enemy/3.Final_Enemy/Dead/Mesa de trabajo 2 copia 6.png',
      'img/2.Enemy/3.Final_Enemy/Dead/Mesa de trabajo 2 copia 7.png',
      'img/2.Enemy/3.Final_Enemy/Dead/Mesa de trabajo 2 copia 8.png',
      'img/2.Enemy/3.Final_Enemy/Dead/Mesa de trabajo 2 copia 9.png',
      'img/2.Enemy/3.Final_Enemy/Dead/Mesa de trabajo 2 copia 10.png',
   ];

   constructor() {
      super().loadImage('img/2.Enemy/3.Final_Enemy/2.floating/1.png');
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_ATTACK);
      this.loadImages(this.IMAGES_HURT);
      this.loadImages(this.IMAGES_DEAD);

      this.animate();
      this.isHurt = false;
   }

   isDead() {
      if (this.healthPoints == 0) {
         return true;
      } else if (this.healthPoints > 0) {
         return false;
      }
   }

   getDamage() {
      if (!this.immunity && this.healthPoints > 0) {
         this.healthPoints -= this.damage;
         this.isHurt = true;
         this.isHurtAnimationPlaying = true;
         this.immunity = true;
         setTimeout(() => {
            this.immunity = false;
            this.isHurt = false;
            this.isHurtAnimationPlaying = false;
         }, 500);
      }
   }

   move() {
      this.y += this.verticalSpeed * this.verticalDirection;
      if (
         this.y > this.originalY + this.verticalRange ||
         this.y < this.originalY - this.verticalRange
      ) {
         this.verticalDirection *= -1;
      }

      this.x -= this.horizontalSpeed;

      if (this.x < 100) {
         this.x = this.originalX;
      }
   }

   animate() {
      if (!this.isDead()) {
         this.moveInterval = setInterval(() => {
            this.move();
         }, 1000 / 60);
      }

      if (this.isDead()) {
         setInterval(() => {
            if (this.y <= this.originalY + 300) {
               this.y += this.verticalSpeed;
               this.collisionBoxOffsetY = 3500;
            }            
         }, 1000 / 60);
      }

      this.animationInterval = setInterval(() => {
         if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
            console.log('boss is dead');
         } else if (!this.isDead() && this.isHurt) {
            this.playHurtAnimation();
         } else if (!this.isDead() && !this.isAttacking && !this.isHurtAnimationPlaying) {
            this.playAnimation(this.IMAGES_SWIM);
         }
      }, 1000 / 10);

      if (!this.isDead()) {
         this.attackInterval = setInterval(() => {
            if (!this.isAttacking && !this.isHurt && !this.isHurtAnimationPlaying) {
               this.isAttacking = true;
               this.playAttackAnimation();
               setTimeout(() => {
                  this.isAttacking = false;
               }, this.IMAGES_ATTACK.length * 100);
            }
         }, 2000);
      }
   }

   playHurtAnimation() {
      if (this.currentHurtImage < this.IMAGES_HURT.length) {
         let path = this.IMAGES_HURT[this.currentHurtImage];
         this.img = this.imageCache[path];
         this.currentHurtImage++;
      } else {
         this.currentHurtImage = 0;
         if (this.isAttacking) {
            this.playAttackAnimation();
         } else {
            this.playAnimation(this.IMAGES_SWIM);
         }
      }
   }

   playAttackAnimation() {
      let i = 0;
      const attackAnimation = setInterval(() => {
         if (i < this.IMAGES_ATTACK.length) {
            let path = this.IMAGES_ATTACK[i];
            this.img = this.imageCache[path];
            i++;
            this.collisionBoxOffsetX -= 10;
         } else {
            this.collisionBoxOffsetX = 50;
            clearInterval(attackAnimation);
         }
      }, 100);
   }
}
