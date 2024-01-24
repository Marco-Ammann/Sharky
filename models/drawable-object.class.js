class DrawableObject{
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
