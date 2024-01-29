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

   collisionBoxWidth;
   collisionBoxHeight;
   collisionBoxOffsetX = 0;
   collisionBoxOffsetY = 0;

   applyGravity() {
      this.gravityInterval = setInterval(() => {
         this.y -= this.speedY;
         this.speedY += this.acceleration;
      }, 1000 / 60);
   }

   constructor() {
      super();
      this.collisionBoxWidth = this.width;
      this.collisionBoxHeight = this.height;
   }

   getDamage() {
      if (!this.immunity && this.healthPoints > 0) {
          this.healthPoints -= this.damage;
          this.immunity = true;
          this.lastHit = new Date().getTime();
          setTimeout(() => {
              this.immunity = false;
          }, 500);
      }
  }

   isDead() {
      if (this.healthPoints == 0) {
         this.dead = true;
      }
      return this.dead;
   }

   isHurt() {
      let timepassed = new Date().getTime() - this.lastHit;
      return timepassed < 500;
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
      setInterval(() => {         
         if (this.y <= 380) {
            this.y += 0.1;
            this.collisionBoxOffsetY = 3500;
         }
      }, 1000 / 60);
   }

   playSwimSound() {
      this.swim_sound.play();
      this.swim_sound.volume = 0.15;
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
