class MovableObject {
   x;
   y;
   img;
   height;
   width;

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
