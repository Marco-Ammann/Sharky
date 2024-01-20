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
