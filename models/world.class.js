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

   constructor(canvas) {
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.draw();
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
      this.ctx.drawImage(MovObj.img, MovObj.x, MovObj.y, MovObj.width, MovObj.height);
   }
}
