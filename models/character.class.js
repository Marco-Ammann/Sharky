class Character extends MovableObject {
   height = 200;
   width = this.height * 1.227;
   x = 10;
   y = 200;
   world;
   speed = 4;

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
   

   constructor() {
      super().loadImage('../img/1.Sharkie/1.IDLE/1.png');
      this.loadImages(this.IMAGES_IDLE);
      this.loadImages(this.IMAGES_SWIM);
      this.animate();
   }


   animate() {
      setInterval(() => {
         if (this.world.keyboard.RIGHT) {
            this.x += this.speed;
            this.otherDirection = false;
         }
         if (this.world.keyboard.UP) {
            this.y -= this.speed;
         }
         if (this.world.keyboard.DOWN) {
            this.y += this.speed;
         }
         if (this.world.keyboard.LEFT) {
            this.x -= this.speed;
            this.otherDirection = true;
         }
      }, 1000 / 60);

      setInterval(() => {
         let i, path;
         let isMoving = false;

         if (
            this.world.keyboard.RIGHT ||
            this.world.keyboard.UP ||
            this.world.keyboard.DOWN ||
            this.world.keyboard.LEFT
         ) {
            i = this.currentImage % this.IMAGES_SWIM.length;
            path = this.IMAGES_SWIM[i];
            isMoving = true;
         } else {
            i = this.currentImage % this.IMAGES_IDLE.length;
            path = this.IMAGES_IDLE[i];
         }

         this.img = this.imageCache[path];
         this.currentImage++;
      }, 1000 / 8);
   }


   shootBubble() {
      console.log('shooting bubble');
   }
}
