class World {
   character = new Character();
   enemies = level1.enemies;
   barriers = level1.barriers;
   backgroundLayers = level1.backgroundLayers;

   canvas;
   ctx;
   keyboard;
   camera_x= 0;

   constructor(canvas, keyboard) {
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.keyboard = keyboard;
      this.draw();
      this.setWorld();
   }
   

   setWorld() {
      this.character.world = this;
   }


   draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.translate(this.camera_x, 0);

      this.addObjectsToMap(this.backgroundLayers);
      this.addObjectsToMap(this.enemies);
      this.addToMap(this.character);
      this.addObjectsToMap(this.barriers);

      this.ctx.translate(-this.camera_x, 0);

      requestAnimationFrame(() => this.draw());
   }


   addObjectsToMap(objects) {
      objects.forEach((o) => {
         this.addToMap(o);
      });
   }


   addToMap(MovObj) {
      if (MovObj.otherDirection) {
         this.ctx.save();
         this.ctx.translate(MovObj.width, 0);
         this.ctx.scale(-1, 1);
         MovObj.x = MovObj.x * -1;
      }

      this.ctx.drawImage(MovObj.img, MovObj.x, MovObj.y, MovObj.width, MovObj.height);

      if (MovObj.otherDirection) {
         MovObj.x = MovObj.x * -1;
         this.ctx.restore();
      }
   }
}
