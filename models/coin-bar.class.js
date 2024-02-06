class CoinBar extends DrawableObject {
    IMAGES = [
        'img/4.Markers/green/Coin/0.png',
        'img/4.Markers/green/Coin/20.png',
        'img/4.Markers/green/Coin/40.png',
        'img/4.Markers/green/Coin/60.png',
        'img/4.Markers/green/Coin/80.png',
        'img/4.Markers/green/Coin/100.png'
     ];
  
     percentage;
  
     constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 500;
        this.y = 0;
        this.height = 50;
        this.width = this.height * 3.766;
        this.setPercentage(0);
     }
  
     setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
     }
  
     resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        else if (this.percentage >= 80) return 4;
        else if (this.percentage >= 60) return 3;
        else if (this.percentage >= 40) return 2;
        else if (this.percentage >= 20) return 1;
        else return 0;
    }

    reset() {
      this.setPercentage(0);
    }
}
