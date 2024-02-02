class ThrowableObject extends MovableObject {
   IMAGE = 'img/1.Sharkie/4.Attack/Bubble trap/Bubble.png';
   IMAGE_POISON = 'img/1.Sharkie/4.Attack/Bubble trap/Poisoned Bubble (for whale).png';

   height = 35;
   width = this.height;
   direction = -1;
   verticalSpeed;
   originalY;
   startX;
   acceleration = -0.08;

   constructor(x, fixedY, y, otherDirection, poisonBottleAmount) {
      super();
      this.originalY = fixedY + 105;
      this.startX = x;

      if (poisonBottleAmount > 0) {
         this.loadImage(this.IMAGE_POISON);
      } else if (poisonBottleAmount === 0) {
         this.loadImage(this.IMAGE);
      }
      this.otherDirection = otherDirection;
      if (this.otherDirection) {
         this.x = x + 10;
         this.speed = -2;
      } else {
         this.x = x + 190;
         this.speed = 2;
      }
      this.y = y + 105;
      this.verticalSpeed = 2;
      this.collisionBoxWidth = this.width;
      this.collisionBoxHeight = this.height;
      this.collisionBoxOffsetX = 0;
      this.collisionBoxOffsetY = 0;
   }


   move() {
      this.x += this.speed;

      if (Math.abs(this.verticalSpeed) >= 2) {
         this.acceleration *= -1;
      }

      this.verticalSpeed -= this.acceleration;
      this.y += this.verticalSpeed;

      if (Math.abs(this.x - this.startX) > 500) {
         this.removeBubble();
      }
   }
   

   removeBubble() {
      this.toBeRemoved = true;
   }
}
