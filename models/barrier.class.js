class BarrierTunnel extends MovableObject {
   constructor() {
      super().loadImage('img/3.Background/Barrier/1.png');
      this.x = 800;
      this.height = 480;
      this.y = 480 - this.height;
      this.width = this.height * 1.557;
   }
}

class BarrierStone extends MovableObject {
   constructor() {
      super().loadImage('img/3.Background/Barrier/2.png');
      this.x = 500;
      this.height = 100;
      this.y = 480 - this.height;
      this.width = this.height * 2.18;
   }
}
