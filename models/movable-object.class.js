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
      setInterval(() => {
         this.x -= this.speed;
      }, 1000 / 60);
   }


   moveRight() {
      console.log('swimming right');
   }


   moveUp() {
      console.log('swimming up');
   }


   moveDown() {
      console.log('swimming down');
   }
}
