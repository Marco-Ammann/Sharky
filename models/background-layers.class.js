class BackgroundLayer extends MovableObject {
    height = 480;
    width = this.height * 3.55;
    direction = 1;


    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


    animate() {
        setInterval(() => {
            this.x += 0.06 * this.direction;
        }, 1000 / 60);

        setInterval(() => {
            this.direction *= -1;
        }, 4000);
    }
}