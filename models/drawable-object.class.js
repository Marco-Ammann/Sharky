/**
 * This class represents any object that can be drawn on the screen.
 * It includes basic properties like image, position, and size.
 */
class DrawableObject {
   constructor() {
      this.img = new Image();
      this.imageCache = {};
      this.currentImage = 0;
      this.x = 0;
      this.y = 0;
      this.height = 0;
      this.width = 0;
   }

   
   /**
    * Loads an image into the object.
    * @param {string} path - The path to the image file.
    */
   loadImage(path) {
      this.img.src = path;
   }


   /**
    * Draws an outline around the object if it's a specific type.
    * Useful for debugging collision boxes.
    * @param {CanvasRenderingContext2D} ctx - The drawing context from the canvas.
    */
   drawFrame(ctx) {
      if (
         this instanceof Character ||
         this instanceof Endboss ||
         this instanceof PufferFish ||
         this instanceof BarrierPillar ||
         this instanceof BarrierStone ||
         this instanceof ThrowableObject ||
         this instanceof Coin ||
         this instanceof Poison
      ) {
         // Calculates the position and size of the collision box.
         const rectX = this.x + this.collisionBoxOffsetX;
         const rectY = this.y + this.collisionBoxOffsetY;
         const rectWidth = this.collisionBoxWidth;
         const rectHeight = this.collisionBoxHeight;

         // Draws the collision box.
         ctx.beginPath();
         ctx.lineWidth = '3';
         ctx.strokeStyle = 'lightgreen';
         ctx.rect(rectX, rectY, rectWidth, rectHeight);
         ctx.stroke();
      }
   }


   /**
    * Draws the object's image on the canvas.
    * @param {CanvasRenderingContext2D} ctx - The drawing context from the canvas.
    */
   draw(ctx) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
   }


   /**
    * Loads multiple images for animations and stores them.
    * @param {string[]} arr - An array of image paths.
    */
   loadImages(arr) {
      arr.forEach((path) => {
         let img = new Image();
         img.src = path;
         this.imageCache[path] = img;
      });
   }
}
