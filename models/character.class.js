class Character extends MovableObject {

   constructor(){
      super().loadImage('../img/1.Sharkie/1.IDLE/1.png')
   }

   shootBubble() {
      console.log('shooting bubble');
   }
}