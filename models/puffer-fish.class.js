class PufferFish extends MovableObject {
   constructor() {
      super().loadImage('../img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png');
      this.x = 350 + Math.random() * 400;
      this.y = 10 + Math.random() * 400;
      this.height = 60  ;
      this.width = this.height * 1.2;
   }
}
