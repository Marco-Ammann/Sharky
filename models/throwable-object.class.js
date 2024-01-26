class ThrowableObject extends MovableObject {
    IMAGE = 'img/1.Sharkie/4.Attack/Bubble trap/Bubble.png';

    height = 35;
    width = this.height;

    constructor(x, y, otherDirection) {
        super();
        this.loadImage(this.IMAGE);
        this.otherDirection = otherDirection;
        if (this.otherDirection) {
            this.x = x + 10;
            this.speed = -4.2;
        } else {
            this.x = x + 190;
            this.speed = 4.2;
        }
        this.y = y + 105;
        this.speedY = -1.7;
        this.acceleration = 0.12;
        this.applyGravity();

        this.collisionBoxWidth = this.width;
        this.collisionBoxHeight = this.height;
        this.collisionBoxOffsetX = 0;
        this.collisionBoxOffsetY = 0;
    }

    move() {
        this.x += this.speed;
    }

    removeBubble() {
        this.toBeRemoved = true;
    }
}


