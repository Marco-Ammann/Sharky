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

   impact_sound = new Audio ('audio/bubble_impact_sound.mp3');

   collisionBoxWidth;
   collisionBoxHeight;
   collisionBoxOffsetX = 0;
   collisionBoxOffsetY = 0;
 

   constructor() {
      super();
      this.collisionBoxWidth = this.width;
      this.collisionBoxHeight = this.height;
   }

   
   applyGravity() {
      let gravityInterval = setInterval(() => {
         this.y -= this.speedY;
         this.speedY += this.acceleration;
      }, 1000 / 60);
      globalIntervals.push(gravityInterval);
   }


   playAttackSound() {
      this.attack_sound.play();
      this.attack_sound.volume = 0.15;
      let attackSoundTimeout = setTimeout(() => {
          this.attack_sound.pause();
          this.attack_sound.currentTime = 0;
      }, 370);
      globalTimeouts.push(attackSoundTimeout);
   }


  playImpactSound() {
   this.impact_sound.currentTime = 0;
   this.impact_sound.play();
   this.impact_sound.volume = 0.4;
   let impactSoundTimeout = setTimeout(() => {
       this.impact_sound.pause();
       this.impact_sound.currentTime = 0;
   }, 1000);
   globalTimeouts.push(impactSoundTimeout);
   }


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


   isDead() {
   return this.healthPoints <= 0;
   }


   isHurt() {
      let timepassed = new Date().getTime() - this.lastHit;
      return timepassed <= 500;
   }


   moveLeft() {
      this.x -= this.speed;
   }


   moveRight() {
      this.x += this.speed;
   }


   moveUp() {
      this.y -= this.speed;
   }


   moveDown() {
      this.y += this.speed;
   }


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


   sink() {
      let sinkInterval = setInterval(() => {         
         if (this.y <= this.floorY) {
            this.y += 0.1;
            this.collisionBoxOffsetY = 3500;
         }
      }, 1000 / 60);
      globalIntervals.push(sinkInterval);
   }


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


   stopAnimations() {
      clearInterval(this.animationInterval);
      clearInterval(this.attackInterval);
      clearInterval(this.moveInterval);
  }
}