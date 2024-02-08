/**
 * Represents a pufferfish enemy in the game. Inherits from MovableObject to add movement and interaction capabilities.
 */
class PufferFish extends MovableObject {
   height = 60;
   width = this.height * 1.217;
   x = 650 + Math.random() * 5400;
   y = 30 + Math.random() * 400;
   speed = 0.1 + Math.random() * 0.3;
   collisionBoxWidth = this.width * 0.75;
   collisionBoxHeight = this.height * 0.5;
   collisionBoxOffsetX = 10;
   collisionBoxOffsetY = 9;
   healthPoints = 20;
   world;
   direction = 1;
   deathHandled;
   damage = 20;

   characterCenterY;
   centerY;
   characterFront;

   attackWindUpPlayed = false;

   IMAGES_SWIM = [
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim2.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim3.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim4.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim5.png',
   ];

   IMAGES_SPEED = [
      'img/2.Enemy/1.Puffer_fish/3.Bubbleeswim/3.bubbleswim1.png',
      'img/2.Enemy/1.Puffer_fish/3.Bubbleeswim/3.bubbleswim2.png',
      'img/2.Enemy/1.Puffer_fish/3.Bubbleeswim/3.bubbleswim3.png',
      'img/2.Enemy/1.Puffer_fish/3.Bubbleeswim/3.bubbleswim4.png',
      'img/2.Enemy/1.Puffer_fish/3.Bubbleeswim/3.bubbleswim5.png',
   ];

   IMAGES_DEAD = ['img/2.Enemy/1.Puffer_fish/4.DIE/3.png', 'img/2.Enemy/1.Puffer_fish/4.DIE/3.png'];

   IMAGES_WINDUP = [
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition1.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition2.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition3.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition4.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition5.png',
   ];


   constructor() {
      super();
      this.loadImages(this.IMAGES_DEAD);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_SPEED);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_WINDUP);
      // this.animate(); is callet upon starting the game with the button
   }


   /**
    * Handles the pufferfish's movement to the left, simulating its swimming behavior.
    * The pufferfish will speed up if the player character is close, indicating an attack.
    */
   moveLeft() {
      if (!this.world || !this.world.character) {
         return;
      }
      this.characterCenterY =
         this.world.character.y +
         this.world.character.collisionBoxOffsetY +
         this.world.character.collisionBoxHeight / 2;
      this.centerY = this.y + this.collisionBoxOffsetY + this.collisionBoxHeight / 2;
      this.x -= this.speed;

      this.y += this.speed * this.direction * Math.random() * 3;

      if (
         Math.abs(this.characterCenterY - this.centerY) < 50 &&
         this.x - this.world.character.x < 480 &&
         this.x > this.world.character.x
      ) {
         this.x -= this.speed * 22;
         this.isAttacking = true;
      } else {
         this.isAttacking = false;
         this.attackWindUpPlayed = false;
      }
   }


   /**
    * Controls the animation and behavior of the pufferfish, including moving and attacking.
    * Different animations are played based on whether the pufferfish is attacking or swimming normally.
    */
   animate() {
      if (this.isDead()) {
         if (!this.deathHandled) {
            this.clearIntervals();
            this.healthPoints = 0;
            this.img.src = 'img/2.Enemy/1.Puffer_fish/4.DIE/3.png';

            this.deathHandled = true;
            this.clearIntervals();
            let deathInterval = setInterval(() => {
               this.y -= 3;
               this.collisionBoxOffsetY = -500;
            }, 1000 / 60);
            globalIntervals.push(deathInterval);
            return;
         }
      }

      let movementIntervalId = setInterval(() => {
         this.moveLeft();
      }, 1000 / 60);
      globalIntervals.push(movementIntervalId);
      this.movementIntervalId = movementIntervalId;

      let verticalMovementIntervalId = setInterval(() => {
         this.direction = this.direction * -1;
      }, 3000 * Math.random());
      globalIntervals.push(verticalMovementIntervalId);

      let animationIntervalId = setInterval(() => {
         if (this.isAttacking && !this.isDead()) {
            if (!this.attackWindUpPlayed) {
               this.playAnimation(this.IMAGES_WINDUP);
               if ((this.currentImage = this.IMAGES_WINDUP.length - 1)) {
                  this.attackWindUpPlayed = true;
               }
            } else {
               this.playAnimation(this.IMAGES_SPEED);
            }
         } else if (!this.isDead()) {
            this.playAnimation(this.IMAGES_SWIM);
         }
      }, 1000 / 8);
      globalIntervals.push(animationIntervalId);
   }


   /**
    * Clears all intervals associated with the pufferfish's movement and animation, stopping its behavior.
    */
   clearIntervals() {
      clearInterval(this.movementIntervalId);
      clearInterval(this.verticalMovementIntervalId);
      clearInterval(this.animationIntervalId);
   }


   /**
    * Plays the windup animation for the pufferfish's attack, preparing for a speed increase.
    */
   playAttackWindupAnimation() {
      if (!this.attackWindUpPlayed && this.currentImage < this.IMAGES_WINDUP.length) {
         let path = this.IMAGES_WINDUP[this.currentImage];
         this.img = this.imageCache[path];
         this.currentImage++;

         if (this.currentImage === this.IMAGES_WINDUP.length) {
            this.attackWindUpPlayed = true;
         }
      }
   }
}
