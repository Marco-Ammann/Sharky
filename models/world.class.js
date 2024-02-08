class World {
   character;

   level;
   statusBar;
   poisonBar;
   coinBar = new CoinBar();

   throwables = [];
   bossHasAppeared = false;
   endbossDefeated = false;

   canvas;
   ctx;
   keyboard;
   camera_x = 0;

   lastCollisionCheck = 0;
   collisionCheckInterval = 1000 / 20;
   isGameOver = false;
   isGamePaused = false;

   gameOverSound = new Audio('audio/death_sound.mp3');
   gameWonSound = new Audio('audio/win_sound.mp3');
   bossBattleSound = new Audio('audio/boss_battle_music.mp3');
   gameMusic;

   inventory = {};

   constructor(canvas, keyboard) {
      this.poisonBar = new PoisonBar();
      this.statusBar = new StatusBar();
      this.level = createLevel1();
      this.enemies = [];
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.keyboard = keyboard;
      this.character = new Character();
      this.draw();
      this.inventory = {
         coins: 0,
         poisonBottles: 0,
      };
      this.setWorld(this.character);
      this.level.enemies.forEach((enemy) => {
         this.setWorld(enemy);
      });

      this.level.collectables.forEach((collectable) => {
         this.setWorld(collectable);
      });
      this.gameMusic = this.level.music;
   }


   checkCollisions() {
      this.level.enemies.forEach((enemy) => {
         if (
            this.character.isColliding(enemy) &&
            this.character.healthPoints > 0 &&
            !this.character.isHurt()
         ) {
            this.character.getDamage(enemy);
            this.character.playGotHitSound();
            console.log('damage recieved: ', enemy.damage, 'by the enemy');
            console.log('HP left: ', this.character.healthPoints);

            this.statusBar.setPercentage(this.character.healthPoints);
            if (this.character.healthPoints <= 0) {
               this.playGameOverSound();
            }
         }
      });

      this.level.barriers.forEach((barrier) => {
         if (this.character.isColliding(barrier) && !this.character.isHurt() && !this.character.isHurt()) {
            this.character.getDamage(barrier);
            this.character.playGotHitSound();
            console.log('damage recieved: ', barrier.damage, ' by the barrier');
            console.log('HP left: ', this.character.healthPoints);
            this.statusBar.setPercentage(this.character.healthPoints);
            if (this.character.healthPoints <= 0) {
               this.playGameOverSound();
            }
         }
      });

      this.level.collectables.forEach((collectable, index) => {
         if (this.character.isColliding(collectable)) {
            this.level.collectables.splice(index, 1);
            collectable.playPickupSound();
            if (collectable instanceof Poison) {
               this.inventory.poisonBottles += 1;
               this.poisonBar.setPercentage(this.inventory.poisonBottles * 20);
            } else if (collectable instanceof Coin) {
               this.inventory.coins += 1;
               this.coinBar.setPercentage(this.inventory.coins * 20);
            }
         }
      });
   }


   checkBubbleCollisions() {
      this.throwables.forEach((bubble, bubbleIndex) => {
         this.level.enemies.forEach((enemy, enemyIndex) => {
            if (bubble.isColliding(enemy)) {
               this.character.playImpactSound();
               enemy.getDamage(this.character);
               bubble.removeBubble();

               if (enemy.isDead()) {
                  if (enemy instanceof Endboss) {
                     enemy.animate();
                     if (enemy.healthPoints <= 0) {
                        this.character.clearIntervals();
                        this.stopMusic();
                        this.playWonSound();
                     }
                  } else {
                     enemy.animate();
                     setTimeout(() => {
                        this.level.enemies.splice(enemyIndex, 1);
                     }, 3000);
                  }
               }
            }
         });

         if (bubble.toBeRemoved) {
            this.throwables.splice(bubbleIndex, 1);
         }
      });
   }


   playGameOverSound() {
      this.gameOverSound.volume = 0.15;
      this.gameOverSound.loop = false;
      this.gameOverSound.play();
   }


   playWonSound() {
      this.gameWonSound.volume = 0.15;
      this.gameWonSound.loop = false;
      this.gameWonSound.play();
   }


   startMusic() {
      this.stopMusic();
      this.gameMusic.volume = 0.05;
      this.gameMusic.loop = true;
      this.gameMusic.play();
      musicIsPlaying = true;
   }


   stopMusic() {
      if (this.gameMusic) {
         this.gameMusic.pause();
         musicIsPlaying = false;
      }
   }


   switchToBossMusic() {
      this.stopMusic();
      this.gameMusic = this.bossBattleSound;
      this.startMusic();
   }


   handleBossDefeat() {
      this.stopMusic();
      this.gameMusic = this.level.music;
      setTimeout(() => {
         this.startMusic();
      }, 500);
   }


   setWorld(obj) {
      obj.world = this;
   }


   draw() {
      let now = Date.now();
      if (now - this.lastCollisionCheck > this.collisionCheckInterval) {
         this.checkCollisions();
         this.checkBubbleCollisions();

         this.lastCollisionCheck = now;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.translate(this.camera_x, 0);
      this.addObjectsToMap(this.level.backgroundLayers);

      //----------space for fixed Objects------------
      this.ctx.translate(-this.camera_x, 0);
      this.addToMap(this.statusBar);
      this.addToMap(this.poisonBar);
      this.addToMap(this.coinBar);
      this.ctx.translate(this.camera_x, 0);
      //---------------------------------------------

      this.addToMap(this.character);
      this.addObjectsToMap(this.level.enemies);
      this.addObjectsToMap(this.level.collectables);
      this.addObjectsToMap(this.level.barriers);
      this.throwables.forEach((throwable) => {
         throwable.move();
         this.addToMap(throwable);
      });
      this.throwables = this.throwables.filter((bubble) => !bubble.toBeRemoved);

      this.ctx.translate(-this.camera_x, 0);

      animationFrameId = requestAnimationFrame(() => this.draw());
   }


   addObjectsToMap(objects) {
      objects.forEach((o) => {
         this.addToMap(o);
      });
   }


   addToMap(MovObj) {
      if (MovObj.otherDirection) {
         this.flipImage(MovObj);
      }

      MovObj.draw(this.ctx);
      // MovObj.drawFrame(this.ctx); //draw hitbox squares here --------------------------------------------------

      if (MovObj.otherDirection) {
         this.flipImageBack(MovObj);
      }
   }


   flipImage(MovObj) {
      this.ctx.save();
      this.ctx.translate(MovObj.width, 0);
      this.ctx.scale(-1, 1);

      MovObj.x = MovObj.x * -1;
   }


   flipImageBack(MovObj) {
      MovObj.x = MovObj.x * -1;
      this.ctx.restore();
   }
}
