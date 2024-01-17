class World {
   character = new Character();
   enemies = [new PufferFish(), new PufferFish(), new PufferFish()];
   barriers = [new BarrierTunnel(), new BarrierStone()];
   backgroundLayers = [
      new BackgroundLayer('img/3.Background/Layers/5. Water/D.png', 0), //water
      new BackgroundLayer('img/3.Background/Layers/4.Fondo 2/D.png', 0), //Background
      new BackgroundLayer('img/3.Background/Layers/3.Fondo 1/D.png', 0), //middleground
      new BackgroundLayer('img/3.Background/Layers/2. Floor/D.png', 0), //floor
      new BackgroundLayer('img/3.Background/Layers/1. Light/COMPLETO.png', 0), //light
   ];

   canvas;
   ctx;
   keyboard;

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

      this.addObjectsToMap(this.backgroundLayers);
      this.addObjectsToMap(this.enemies);
      this.addToMap(this.character);
      this.addObjectsToMap(this.barriers);

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
