class MovableObject {
   x = 100;
   y = 350;
   img;
   height = 81.5;
   width = 100;


   loadImage(path) {
      this.img = new Image();
      this.img.src = path;
   }

   swimLeft() {
      console.log('puffer swims left');
   }

   swimRight() {
      console.log('swimming right');
   }

   swimUp() {
      console.log('swimming up');
   }

   swimDown() {
      console.log('swimming down');
   }
}
