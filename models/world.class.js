class World {
   character = new Character();

   level = level1;

   canvas;
   ctx;
   keyboard;
   camera_x= 0;

   music = new Audio('audio/game_music.mp3');


   constructor(canvas, keyboard) { 
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.keyboard = keyboard;
      this.draw();
      this.setWorld();
      this.music.volume = 0.05;
      this.music.loop = true;
      setTimeout(() => {
         
         this.music.play();
      }, 1);
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


   toggleMusic() {
      this.music.muted = !this.music.muted;
      return this.music.muted;
  }


}
