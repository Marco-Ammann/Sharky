class WaterLayer extends BackgroundObjects {
    constructor() {
        super().loadImage('img/3.Background/Layers/5. Water/D.png');
        this.x = 0;
        this.y = 0;
        this.height = 480;
        this.width = this.height * 3.55;
    }
}

class BackgroundLayer extends BackgroundObjects {
    constructor() {
        super().loadImage('img/3.Background/Layers/4.Fondo 2/D.png');
        this.x = 0;
        this.y = 0;
        this.height = 480;
        this.width = this.height * 3.55;
    }
}

class MiddlegroundLayer extends BackgroundObjects {
    constructor() {
        super().loadImage('img/3.Background/Layers/3.Fondo 1/D.png');
        this.x = 0;
        this.y = 0;
        this.height = 480;
        this.width = this.height * 3.55;
    }
}

class FloorLayer extends BackgroundObjects {
    constructor() {
        super().loadImage('img/3.Background/Layers/2. Floor/D.png');
        this.x = 0;
        this.y = 0;
        this.height = 480;
        this.width = this.height * 3.55;
    }
}

class LightLayer extends BackgroundObjects {
    constructor() {
        super().loadImage('img/3.Background/Layers/1. Light/COMPLETO.png');
        this.x = 0;
        this.y = 0;
        this.height = 480;
        this.width = this.height * 3.55;
    }
}