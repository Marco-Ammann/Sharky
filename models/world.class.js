class World {
   character = new Character();

   level = level1;

   canvas;
   ctx;
   keyboard;
   camera_x = 0;
   isLoaded = false;

   constructor(canvas, keyboard) {
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.keyboard = keyboard;
      this.draw();
      this.setWorld();
      this.isLoaded = true;
   }


   startMusic() {
      this.level.music.volume = 0.05;
      this.level.music.loop = true;
      this.level.music.play();
   }


   stopMusic() {
      this.level.music.volume = 0.05;
      this.level.music.loop = true;
      this.level.music.play();
   }


   setWorld() {
      this.character.world = this;
   }


   draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.translate(this.camera_x, 0);

      this.addObjectsToMap(this.level.backgroundLayers);
      this.addObjectsToMap(this.level.enemies);
      this.addToMap(this.character);
      this.addObjectsToMap(this.level.barriers);

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
         this.flipImage(MovObj);
      }

      MovObj.draw(this.ctx);
      MovObj.drawFrame(this.ctx);

      if (MovObj.otherDirection) {
         this.flipImageBack(MovObj);
      }
   }


   flipImage(MovObj) {
      this.ctx.save();
      this.ctx.translate(MovObj.width, 0);
      this.ctx.scale(-1, 1);
      MovObj.x = MovObj.x * -1;
   }


   flipImageBack(MovObj) {
      MovObj.x = MovObj.x * -1;
      this.ctx.restore();
   }
}
