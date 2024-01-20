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

       // Collision box properties
       collisionBoxWidth;
       collisionBoxHeight;
       collisionBoxOffsetX = 0; // Offset from the object's x position
       collisionBoxOffsetY = 0;


       constructor() {
         // Initialize default collision box size to match object size
         this.collisionBoxWidth = this.width;
         this.collisionBoxHeight = this.height;
     }
   

   loadImage(path) {
      this.img = new Image();
      this.img.src = path;
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
      ctx.beginPath();
      ctx.lineWidth = '3';
      ctx.strokeStyle = 'lightgreen';
      // Use the collision box properties for drawing
      ctx.rect(this.x + this.collisionBoxOffsetX, this.y + this.collisionBoxOffsetY, this.collisionBoxWidth, this.collisionBoxHeight);
      ctx.stroke();
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
      let i = this.currentImage % images.length;
      let path = images[i];
      this.img = this.imageCache[path];
      this.currentImage++;
   }


   playSwimSound() {
      this.swim_sound.play();
      this.swim_sound.volume = 0.15;
   }
}
