class PufferFish extends MovableObject {
   height = 60;
   width = this.height * 1.217;

   IMAGES_SWIM = [
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim2.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim3.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim4.png',
      'img/2.Enemy/1.Puffer_fish/1.Swim/3.swim5.png',
   ];
   

   constructor() {
      super().loadImage('img/2.Enemy/1.Puffer_fish/1.Swim/3.swim1.png');
      this.loadImages(this.IMAGES_SWIM);

      this.x = 350 + Math.random() * 400;
      this.y = 10 + Math.random() * 400;
      this.speed = 0.1 + Math.random() * 0.3;

      this.animate();
   }


   animate() {
      this.moveLeft();
      setInterval(() => {
         let i = this.currentImage % this.IMAGES_SWIM.length;
         let path = this.IMAGES_SWIM[i];
         this.img = this.imageCache[path];
         this.currentImage++;
      }, 1000 / 8);
   }
}
