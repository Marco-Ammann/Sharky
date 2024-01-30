class Poison extends MovableObject {
    height = 70;
    width = this.height * 0.732;
    x = 350 + Math.random() * 5400;
    y = 10 + Math.random() * 400;

    collisionBoxWidth = this.width * 0.6;
    collisionBoxHeight = this.height * 0.45; 
    collisionBoxOffsetX = 10;
    collisionBoxOffsetY = 35;

    IMAGES_POISON = [
        'img/4.Markers/Poison/Animation/1.png',
        'img/4.Markers/Poison/Animation/2.png',
        'img/4.Markers/Poison/Animation/3.png',
        'img/4.Markers/Poison/Animation/4.png',
        'img/4.Markers/Poison/Animation/5.png',
        'img/4.Markers/Poison/Animation/6.png',
        'img/4.Markers/Poison/Animation/7.png',
        'img/4.Markers/Poison/Animation/8.png',
     ];





    constructor() {
        super().loadImage('img/4.Markers/Poison/Animation/1.png');
        this.loadImages(this.IMAGES_POISON);
        this.animate();
    }

    animate() {
        this.animationInterval = setInterval(() => {
           this.playAnimation(this.IMAGES_POISON);
        }, 1000 / 10);
     }
}