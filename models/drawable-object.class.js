class DrawableObject {
   img;
   imageCache = {};
   currentImage = 0;
   x;
   y;
   height;
   width;

   loadImage(path) {
      this.img = new Image();
      this.img.src = path;
   }


   draw(ctx) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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
}
