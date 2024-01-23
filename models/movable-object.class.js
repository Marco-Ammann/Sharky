class MovableObject {
   x;
   y;
   img;
   height;
   width;
   imageCache = {};
   currentImage = 0;
   speed = 0.15;
   otherDirection = false;
   speedY = 0;
   acceleration = 2.5;
   healthPoints = 100;
   immunity = false;
   damage = 20;
   lastHit = 0;
   dead = false;

   collisionBoxWidth;
   collisionBoxHeight;
   collisionBoxOffsetX = 0;
   collisionBoxOffsetY = 0;



   // applyGravity() {
   //    setInterval(() => {
   //       if (this.speedY) {
   //          this.y -= this.speedY;
   //          this.speedY -= this.acceleration;
   //       }
   //    }, 1000 / 25);
   // }

   constructor() {
      this.collisionBoxWidth = this.width;
      this.collisionBoxHeight = this.height;
   }
   

   loadImage(path) {
      this.img = new Image();
      this.img.src = path;
   }


   getDamage() {
      if (!this.immunity && this.healthPoints > 0) {
         this.healthPoints -= this.damage;
         this.immunity = true;
         setTimeout(() => {
            this.immunity = false;
         }, 500);
      } else {
         this.lastHit = new Date().getTime();
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
      timepassed = timepassed / 1000; //difference in s
      return timepassed < 0.5;
   }


   /**
    *
    * @param {Array} arr - ['img/umage1.png', 'img/image2.png']
    */
   loadImages(arr) {
      arr.forEach((path) => {
         let img = new Image();
         img.src = path;
         this.imageCache[path] = img;
      });
   }


   draw(ctx) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
   }


   drawFrame(ctx) {
      if (
         this instanceof Character ||
         this instanceof Endboss ||
         this instanceof PufferFish ||
         this instanceof BarrierPillar ||
         this instanceof BarrierStone
      ) {
         const rectX = this.x + this.collisionBoxOffsetX;
         const rectY = this.y + this.collisionBoxOffsetY;
         const rectWidth = this.collisionBoxWidth;
         const rectHeight = this.collisionBoxHeight;

         ctx.beginPath();
         ctx.lineWidth = '3';
         ctx.strokeStyle = 'lightgreen';
         ctx.rect(rectX, rectY, rectWidth, rectHeight);
         ctx.stroke();
      }
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
          if (this.currentImage < images.length) {
              let path = images[this.currentImage];
              this.img = this.imageCache[path];
              this.currentImage++;
          }
          else {
             this.currentImage = images.length - 1;
               clearInterval(this.movementInterval);
               this.world.level.enemies.forEach((enemy) => {
                  clearInterval(enemy.movementInterval);
                  clearInterval(enemy.animationInterval);
               });

          }
      } else {
          let i = this.currentImage % images.length;
          let path = images[i];
          this.img = this.imageCache[path];
          this.currentImage++;
      }
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
}
