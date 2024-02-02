const level1 = new Level(
   [
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new PufferFish(),
      new Endboss(),
   ],
   [new BarrierStone(), new BarrierPillar()],
   [
      new BackgroundLayer('img/3.Background/Layers/5. Water/D.png', 0), //water
      new BackgroundLayer('img/3.Background/Layers/4.Fondo 2/D.png', 0), //Background
      new BackgroundLayer('img/3.Background/Layers/3.Fondo 1/D.png', 0), //middleground
      new BackgroundLayer('img/3.Background/Layers/2. Floor/D.png', 0), //floor
      new BackgroundLayer('img/3.Background/Layers/1. Light/COMPLETO.png', 0), //light

      new BackgroundLayer('img/3.Background/Layers/5. Water/D.png', 480 * 3.55), //water
      new BackgroundLayer('img/3.Background/Layers/4.Fondo 2/D.png', 480 * 3.55), //Background
      new BackgroundLayer('img/3.Background/Layers/3.Fondo 1/D.png', 480 * 3.55), //middleground
      new BackgroundLayer('img/3.Background/Layers/2. Floor/D.png', 480 * 3.55), //floor

      new BackgroundLayer('img/3.Background/Layers/5. Water/D.png', 480 * 3.55 * 2), //water
      new BackgroundLayer('img/3.Background/Layers/4.Fondo 2/D.png', 480 * 3.55 * 2), //Background
      new BackgroundLayer('img/3.Background/Layers/3.Fondo 1/D.png', 480 * 3.55 * 2), //middleground
      new BackgroundLayer('img/3.Background/Layers/2. Floor/D.png', 480 * 3.55 * 2), //floor

      new BackgroundLayer('img/3.Background/Layers/5. Water/D.png', 480 * 3.55 * 3), //water
      new BackgroundLayer('img/3.Background/Layers/4.Fondo 2/D.png', 480 * 3.55 * 3), //Background
      new BackgroundLayer('img/3.Background/Layers/3.Fondo 1/D.png', 480 * 3.55 * 3), //middleground
      new BackgroundLayer('img/3.Background/Layers/2. Floor/D.png', 480 * 3.55 * 3), //floor
   ],
   new Audio('audio/game_music.mp3'),
   [
      new Poison(),
      new Poison(),
      new Poison(),
      new Poison(),
      new Poison(),
      new Poison(),
      new Poison(),
      new Coin(),
      new Coin(),
      new Coin(),
      new Coin(),
      new Coin()
   ]
);