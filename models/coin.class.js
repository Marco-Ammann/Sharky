class Coin extends MovableObject {
    height = 40;
    width = this.height * 0.939;
    x = 350 + Math.random() * 5400;
    y = 10 + Math.random() * 400;

    collisionBoxWidth = this.width * 0.85;
    collisionBoxHeight = this.height * 0.85; 
    collisionBoxOffsetX = 3;
    collisionBoxOffsetY = 3;

    IMAGES_COIN = [
        'img/4.Markers/1. Coins/1.png',
        'img/4.Markers/1. Coins/2.png',
        'img/4.Markers/1. Coins/3.png',
        'img/4.Markers/1. Coins/4.png'
     ];





    constructor() {
        super().loadImage('img/4.Markers/1. Coins/1.png');
        this.loadImages(this.IMAGES_COIN);
        this.animate();
    }

    animate() {
        this.animationInterval = setInterval(() => {
           this.playAnimation(this.IMAGES_COIN);
        }, 1000 / 6);
     }
}