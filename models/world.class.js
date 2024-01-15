class World {
   character = new Character();
   enemies = [new PufferFish(), new PufferFish(), new PufferFish()];
   barriers = [new BarrierTunnel(), new BarrierStone()];
   backgroundObjects = [
      new WaterLayer(),
      new BackgroundLayer(),
      new MiddlegroundLayer(),
      new FloorLayer(),
      new LightLayer(),
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

      this.backgroundObjects.forEach((bg) => {
         this.addToMap(bg);
      });

      this.barriers.forEach((barrier) => {
         this.addToMap(barrier);
      });

      this.addToMap(this.character);

      this.enemies.forEach((enemy) => {
         this.addToMap(enemy);
      });
      requestAnimationFrame(() => this.draw());
   }

   addToMap(MovObj) {
      this.ctx.drawImage(MovObj.img, MovObj.x, MovObj.y, MovObj.width, MovObj.height);
   }
}
