/**
 * Base class for all objects in the game that can move and interact with the game world.
 * Extends DrawableObject to add movement and collision capabilities.
 */
class MovableObject extends DrawableObject {
   speed = 0.15;
   otherDirection = false;
   speedY = 0;
   acceleration = 2.5;
   healthPoints = 100;
   immunity = false;
   damage = 20;
   lastHit = 0;
   dead = false;
   isAttacking = false;
   floorY = 480;
   damage;

   impact_sound = new Audio('audio/bubble_impact_sound.mp3');

   collisionBoxWidth;
   collisionBoxHeight;
   collisionBoxOffsetX = 0;
   collisionBoxOffsetY = 0;


   constructor() {
      super();
      this.collisionBoxWidth = this.width;
      this.collisionBoxHeight = this.height;
   }


   /**
    * Applies gravity effect to the object by modifying its vertical position over time.
    */
   applyGravity() {
      let gravityInterval = setInterval(() => {
         this.y -= this.speedY;
         this.speedY += this.acceleration;
      }, 1000 / 60);
      globalIntervals.push(gravityInterval);
   }


   /**
    * Plays the sound effect for an attack action.
    */
   playAttackSound() {
      this.attack_sound.play();
      let attackSoundTimeout = setTimeout(() => {
         this.attack_sound.pause();
         this.attack_sound.currentTime = 0;
      }, 370);
      globalTimeouts.push(attackSoundTimeout);
   }


   /**
    * Plays the sound effect when the object impacts with another object.
    */
   playImpactSound() {
      this.impact_sound.currentTime = 0;
      this.impact_sound.play();
      let impactSoundTimeout = setTimeout(() => {
         this.impact_sound.pause();
         this.impact_sound.currentTime = 0;
      }, 1000);
      globalTimeouts.push(impactSoundTimeout);
   }


   /**
    * Applies damage to the object, updating its health points and immunity status.
    * @param {Object} dmgSource - The source of the damage.
    */
   getDamage(dmgSource) {
      if (!this.immunity && this.healthPoints > 0) {
         this.healthPoints -= dmgSource.damage;
         this.immunity = true;
         this.lastHit = new Date().getTime();
         let damageTimeout = setTimeout(() => {
            this.immunity = false;
         }, 500);
         globalTimeouts.push(damageTimeout);
      }
   }


   /**
    * Checks if the object is dead.
    * @returns {boolean} True if the object's health points are 0 or below.
    */
   isDead() {
      return this.healthPoints <= 0;
   }


   /**
    * Checks if the object is currently hurt.
    * @returns {boolean} True if the object was hit recently.
    */
   isHurt() {
      let timepassed = new Date().getTime() - this.lastHit;
      return timepassed <= 500;
   }


   /**
    * Moves the object to the left by decreasing its x-coordinate.
    */
   moveLeft() {
      this.x -= this.speed;
   }


   /**
    * Moves the object to the right by increasing its x-coordinate.
    */
   moveRight() {
      this.x += this.speed;
   }


   /**
    * Moves the object up by decreasing its y-coordinate.
    */
   moveUp() {
      this.y -= this.speed;
   }


   /**
    * Moves the object down by increasing its y-coordinate.
    */
   moveDown() {
      this.y += this.speed;
   }


   /**
    * Plays the specified animation sequence for the object.
    * @param {Array} images - An array of image paths for the animation.
    */
   playAnimation(images) {
      if (this.isDead()) {
         this.sink();
         if (this.currentImage < images.length) {
            let path = images[this.currentImage];
            this.img = this.imageCache[path];
            this.currentImage++;
         } else {
            this.currentImage = images.length - 1;
            clearInterval(this.movementInterval);
            this.world.level.enemies.forEach((enemy) => {
               clearInterval(enemy.movementInterval);
               clearInterval(enemy.animationInterval);
               clearInterval(enemy.attackInterval);
               clearInterval(enemy.moveInterval);
            });
         }
      } else {
         let i = this.currentImage % images.length;
         let path = images[i];
         this.img = this.imageCache[path];
         this.currentImage++;
      }
   }


   /**
    * Simulates the sinking of the object, used when the object is dead.
    */
   sink() {
      let sinkInterval = setInterval(() => {
         if (this.y <= this.floorY) {
            this.y += 0.1;
            this.collisionBoxOffsetY = 3500;
         }
      }, 1000 / 60);
      globalIntervals.push(sinkInterval);
   }


   /**
    * Checks if this object is colliding with another object.
    * @param {MovableObject} obj - The other object to check collision with.
    * @returns {boolean} True if colliding, false otherwise.
    */
   isColliding(obj) {
      return (
         this.x + this.collisionBoxOffsetX + this.collisionBoxWidth >=
            obj.x + obj.collisionBoxOffsetX &&
         this.x + this.collisionBoxOffsetX <=
            obj.x + obj.collisionBoxOffsetX + obj.collisionBoxWidth &&
         this.y + this.collisionBoxOffsetY + this.collisionBoxHeight >=
            obj.y + obj.collisionBoxOffsetY &&
         this.y + this.collisionBoxOffsetY <=
            obj.y + obj.collisionBoxOffsetY + obj.collisionBoxHeight
      );
   }
   

   /**
    * Stops all ongoing animations for the object.
    */
   stopAnimations() {
      clearInterval(this.animationInterval);
      clearInterval(this.attackInterval);
      clearInterval(this.moveInterval);
   }
}
