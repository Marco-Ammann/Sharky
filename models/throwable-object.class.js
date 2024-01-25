class ThrowableObject extends MovableObject {
    IMAGE = 'img/1.Sharkie/4.Attack/Bubble trap/Bubble.png';

    height = 45;
    width = this.height;

    constructor(x, y, otherDirection) {
        super();
        this.loadImage(this.IMAGE);
        this.otherDirection = otherDirection;
        if (this.otherDirection) {
            this.x = x + 10;  // Adjust for left direction
            this.speed = -3.5; // Negative speed for left direction
        } else {
            this.x = x + 190;  // Adjust for right direction
            this.speed = 3.5;  // Positive speed for right direction
        }
        this.y = y + 110;
        this.speedY = -2;
        this.acceleration = 0.3;
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


