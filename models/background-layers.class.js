class BackgroundLayer extends MovableObject {
    height = 480;
    width = this.height * 3.55;
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}