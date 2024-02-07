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

   IMAGES_DEAD = [
      'img/2.Enemy/1.Puffer_fish/4.DIE/3.png',
      'img/2.Enemy/1.Puffer_fish/4.DIE/3.png'
   ];

   IMAGES_WINDUP = [
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition1.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition2.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition3.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition4.png',
      'img/2.Enemy/1.Puffer_fish/2.transition/3.transition5.png',
   ];

   /**
    * Create a new PufferFish instance.
    * Initializes the pufferfish with random attributes and loads its images.
    * After a delay, starts the animation of the pufferfish.
    */
   constructor() {
      super()
      this.loadImages(this.IMAGES_DEAD);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_SPEED);
      this.loadImages(this.IMAGES_SWIM);
      this.loadImages(this.IMAGES_WINDUP);
      // this.animate(); is callet upon starting the game with the button
   }


   /**
    * Move the pufferfish to the left.
    *
    * Calculates the pufferfish's position relative to the character and checks if it should attack.
    * If the character is within a certain range, the pufferfish attacks by moving faster.
    */
   moveLeft() {
      if (!this.world || !this.world.character) {
         return; // Beende die Funktion frühzeitig
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
    * Animate the pufferfish's behavior.
    *
    * If the pufferfish is dead, it sets the image source to the dead image and starts an animation to move upward.
    * If the pufferfish is alive, it sets up intervals to continuously move left and play swimming or attacking animations.
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
      }}      

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
         } else if(!this.isDead()){
            this.playAnimation(this.IMAGES_SWIM);
         }
      }, 1000 / 8);
      globalIntervals.push(animationIntervalId);
   }


   clearIntervals() {
      clearInterval(this.movementIntervalId);
      clearInterval(this.verticalMovementIntervalId);
      clearInterval(this.animationIntervalId);
   }


   /**
    * Play the attack wind-up animation if it hasn't been played already.
    *
    * If the attack wind-up animation has not been played and there are more frames to play,
    * it updates the image source, increments the current image index, and checks if the animation is complete.
    * If the animation is complete, it sets the attackWindUpPlayed flag to true and logs it.
    */
   playAttackWindupAnimation() {
      if (!this.attackWindUpPlayed && this.currentImage < this.IMAGES_WINDUP.length) {
         let path = this.IMAGES_WINDUP[this.currentImage];
         this.img = this.imageCache[path];
         this.currentImage++;

         if (this.currentImage === this.IMAGES_WINDUP.length) {
            this.attackWindUpPlayed = true;
            console.log(this.attackWindUpPlayed);
         }
      }
   }
}