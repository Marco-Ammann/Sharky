class BarrierStone extends MovableObject {
   x = 800 + Math.random() * 1440;
   height = 100;
   y = 480 - this.height;
   width = this.height * 2.18;
   collisionBoxWidth = this.width * 0.97;
   collisionBoxHeight = this.height * 0.95; 
   collisionBoxOffsetX = 3;
   collisionBoxOffsetY = 5;

   constructor() {
      super().loadImage('img/3.Background/Barrier/2.png');
   }
}


class BarrierPillar extends MovableObject {
   x = 900 + 2780 + Math.random() * 1440;
   height = 300;
   y = 480 - this.height;
   width = this.height * 0.487;
   collisionBoxWidth = this.width * 0.97;
   collisionBoxHeight = this.height * 1; 
   collisionBoxOffsetX = 3;
   collisionBoxOffsetY = 5;
   
   constructor() {
      super().loadImage('img/3.Background/Barrier/3.png');
   }
}
