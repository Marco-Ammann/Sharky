class StatusBar extends DrawableObject {
   IMAGES = [
      'img/4.Markers/green/Life/0.png',
      'img/4.Markers/green/Life/20.png',
      'img/4.Markers/green/Life/40.png',
      'img/4.Markers/green/Life/60.png',
      'img/4.Markers/green/Life/80.png',
      'img/4.Markers/green/Life/100.png',
   ];

   percentage = 100;

   constructor() {
      this.loadImages(this.IMAGES);
   }

   setPercentage(percentage) {
      this.percentage = percentage;
      let path = this.IMAGES[this.resolveImageIndex()];
      this.img = this.imageCache[path];
   }

   resolveImageIndex() {
    const thresholds = [80, 60, 40, 20, 0];
    for (let i = 0; i < thresholds.length; i++) {
        if (this.percentage > thresholds[i]) {
            return 5 - i;
        }
    }
    return 0;
}



}
