class World {
   character = new Character();
   enemies = [new PufferFish(), new PufferFish(), new PufferFish()];
   barriers = [new BarrierTunnel(), new BarrierStone()];

   canvas;
   ctx;

   constructor(canvas) {
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.draw();
   }

   draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let c = this.character;
      this.ctx.drawImage(c.img, c.x, c.y, c.width, c.height);

      this.enemies.forEach((enemy) => {
         this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
      });

      this.barriers.forEach((barrier)=> {
         this.ctx.drawImage(barrier.img, barrier.x, barrier.y, barrier.width, barrier.height);
      });

      

      setTimeout(() => {
         requestAnimationFrame(() => this.draw());
      }, 20);
   }
}
