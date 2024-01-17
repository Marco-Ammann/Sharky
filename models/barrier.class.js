class BarrierTunnel extends MovableObject {
   constructor() {
      super().loadImage('img/3.Background/Barrier/1.png');
      this.x = 800 + 1440 + Math.random() * 1440;
      this.height = 480;
      this.y = 480 - this.height;
      this.width = this.height * 1.557;
   }
}

class BarrierStone extends MovableObject {
   constructor() {
      super().loadImage('img/3.Background/Barrier/2.png');
      this.x = 800 + Math.random() * 1440;
      this.height = 100;
      this.y = 480 - this.height;
      this.width = this.height * 2.18;
   }
}


class BarrierPillar extends MovableObject {
   constructor() {
      super().loadImage('img/3.Background/Barrier/3.png');
      this.x = 900 + 2780 + Math.random() * 1440;
      this.height = 300;
      this.y = 480 - this.height;
      this.width = this.height * 0.487;
   }
}
