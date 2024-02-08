class Endboss extends MovableObject {
   world;
   height = 500;
   width = this.height * 1.168;
   x = 5800 - 5000;
   y = -605;
   collisionBoxWidth = this.width * 0.75;
   collisionBoxHeight = this.height * 0.3;
   collisionBoxOffsetX = 50;
   collisionBoxOffsetY = 250;

   floorY = 150;

   isAttacking = false;
   isHurt = false;
   isHurtAnimationPlaying = false;

   healthPoints = 300;

   isIntroduced = false;

   verticalSpeed = 1;
   verticalRange = 180;
   verticalDirection = 1;
   horizontalSpeed = 0;
   originalY = -605;
   originalX = 5800;

   damage = 20;

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

   IMAGES_INTRODUCION = [
      'img/2.Enemy/3.Final_Enemy/1.Introduce/1.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/2.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/3.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/4.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/5.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/6.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/7.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/8.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/9.png',
      'img/2.Enemy/3.Final_Enemy/1.Introduce/10.png',
   ];

   introduce_sound = new Audio('audio/big_splash_sound.mp3');
   bite_sound = new Audio('audio/orca_bite.mp3');


   constructor() {
      super().loadImage('img/2.Enemy/3.Final_Enemy/2.floating/1.png');
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_ATTACK);
      this.loadImages(this.IMAGES_HURT);
      this.loadImages(this.IMAGES_DEAD);
      this.loadImages(this.IMAGES_INTRODUCION);
      this.checkForCharacter();
      if (this.isIntroduced) {
         this.animate();
      }
   }


   isDead() {
      return this.healthPoints === 0;
   }


   getDamage() {
      if (!this.immunity && this.healthPoints > 0) {
         this.healthPoints -= this.world.character.damage;
         this.setHurtState();
         setTimeout(() => this.unsetHurtState(), 600);
      }
   }


   setHurtState() {
      this.isHurt = true;
      this.isHurtAnimationPlaying = true;
      this.immunity = true;
   }


   unsetHurtState() {
      this.immunity = false;
      this.isHurt = false;
      this.isHurtAnimationPlaying = false;
   }


   move() {
      this.moveVertically();
      this.moveHorizontally();
   }


   moveVertically() {
      this.y += this.verticalSpeed * this.verticalDirection;
      if (this.hitVerticalMovementLimit()) {
         this.verticalDirection *= -1;
      }
   }


   moveHorizontally() {
      this.x -= this.horizontalSpeed;
      if (this.isHorizontalOutOfRange()) {
         this.resetHorizontalPosition();
      }
   }


   hitVerticalMovementLimit() {
      return (
         this.y > this.originalY + this.verticalRange ||
         this.y < this.originalY - this.verticalRange
      );
   }


   isHorizontalOutOfRange() {
      return this.x < 100;
   }


   resetHorizontalPosition() {
      this.x = this.originalX;
   }


   checkForCharacter() {
      if (!this.world || !this.world.character) {
         return;
      }

      if (this.isIntroduced) {
         this.animate();
         return;
      }

      this.checkInterval = setInterval(() => {
         if (Math.abs(this.x - this.world.character.x) < 450 && !this.isIntroduced) {
            this.introduceEndboss();
         }
      }, 1000 / 15);
   }


   playIntroduceSound() {
      this.introduce_sound.currentTime = 0.07;
      this.introduce_sound.volume = 0.7;
      this.introduce_sound.loop = false;
      this.introduce_sound.play();
   }


   playBiteSound() {
      this.bite_sound.currentTime = 0.3;
      this.bite_sound.volume = 0.15;
      this.bite_sound.loop = false;
      this.bite_sound.play();
   }


   introduceEndboss() {
      clearInterval(this.checkInterval);
      this.world.bossHasAppeared = true;
      if (this.world.bossHasAppeared) {
         this.world.switchToBossMusic();
         this.playIntroduceSound();
      }

      this.introduceInterval = setInterval(() => {
         this.y = -105;
         this.originalY = -105;

         if ((this, this.currentImage < this.IMAGES_INTRODUCION.length && !this.isIntroduced)) {
            this.playAnimation(this.IMAGES_INTRODUCION);
         } else {
            this.isIntroduced = true;
         }
         if (this.isIntroduced) {
            this.animate();
         }
      }, 1000 / 8);
   }


   animate() {
      if (this.isIntroduced) {
         clearInterval(this.introduceInterval);
         this.movementAnimation();
         this.attack();

         if (!this.isDead()) {
            this.moveInterval = setInterval(() => {
               this.move();
            }, 1000 / 60);
         }
      }
   }


   movementAnimation() {
      this.animationInterval = setInterval(() => {
         if (this.isDead()) {
            this.playAnimation(this.IMAGES_DEAD);
            this.world.endbossDefeated = true;
            this.clearIntervals();
         } else if (this.isHurt && !this.isAttacking) {
            this.playHurtAnimation();
         } else if (!this.isAttacking && !this.isHurtAnimationPlaying) {
            this.playAnimation(this.IMAGES_SWIM);
         }
      }, 1000 / 10);
   }


   attack() {
      if (!this.isDead()) {
         this.attackInterval = setInterval(() => {
            if (!this.isAttacking && !this.isHurt && !this.isHurtAnimationPlaying) {
               this.playAttackAnimation();
               this.playBiteSound();
            }
         }, 2500);
      }
   }


   playHurtAnimation() {
      this.playAnimationOnce(this.IMAGES_HURT, () => {
         this.currentHurtImage = 0;
         this.isHurtAnimationPlaying = false;
      });
   }


   playAnimationOnce(images, callback) {
      let i = 0;
      const interval = setInterval(() => {
         if (i < images.length) {
            this.img = this.imageCache[images[i++]];
         } else {
            clearInterval(interval);
            callback();
         }
      }, 100);
   }


   playAttackAnimation() {
      let i = 0;
      this.isAttacking = true;
      const attackAnimation = setInterval(() => {
         if (i < this.IMAGES_ATTACK.length) {
            let path = this.IMAGES_ATTACK[i];
            this.img = this.imageCache[path];
            i++;
            this.moveForwardWithAttack();
         } else {
            this.moveBackFromAttack();
            this.isAttacking = false;
            clearInterval(attackAnimation);
         }
      }, 100);
      globalIntervals.push(attackAnimation);
   }


   moveForwardWithAttack() {
      this.collisionBoxOffsetX -= 10;
      this.verticalSpeed = 7;
      this.x -= 25;
   }

   moveBackFromAttack() {
      this.collisionBoxOffsetX = 50;
      this.verticalSpeed = 1;
      this.x += 150;
   }


   clearIntervals() {
      clearInterval(this.moveInterval);
      clearInterval(this.animationInterval);
      clearInterval(this.attackAnimation);
      clearInterval(this.attackInterval);
      clearInterval(this.checkForCharacter);
   }
}
