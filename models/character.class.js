class Character extends MovableObject {
   constructor() {
      super().loadImage('../img/1.Sharkie/1.IDLE/1.png');
      this.x = 10;
      this.y = 280;
      this.width = 200;
      this.height = this.width * 0.8;
   }

   shootBubble() {
      console.log('shooting bubble');
   }
}
