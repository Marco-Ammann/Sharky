class MovableObject{
   x;
   y;
   img;
   height;
   width;
   imageCache = {};
   currentImage = 0;

   
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

   swimLeft() {
      console.log('puffer swims left');
   }

   swimRight() {
      console.log('swimming right');
   }

   swimUp() {
      console.log('swimming up');
   }

   swimDown() {
      console.log('swimming down');
   }
}
