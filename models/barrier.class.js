class BarrierTunnel extends StaticObjects {
   constructor() {
      super().loadImage('img/3.Background/Barrier/1.png');
      this.x = 800;
      this.y = 0;
      this.height = 480;
      this.width = this.height * 1.557;
   }
}



class BarrierStone extends StaticObjects {
   constructor() {
      super().loadImage('img/3.Background/Barrier/2.png');
      this.x = 500;
      this.y = 380;
      this.height = 100;
      this.width = this.height * 2.18;
   }
}
