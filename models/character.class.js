class Character extends MovableObject {
   constructor() {
      super().loadImage('../img/1.Sharkie/1.IDLE/1.png');
      this.x = 10;
      this.y = 200;
      this.height = 200;
      this.width = this.height * 1.227;
   }

   shootBubble() {
      console.log('shooting bubble');
   }
}
