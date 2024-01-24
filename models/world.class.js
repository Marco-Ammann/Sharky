class World {
   character = new Character();

   level = level1;
   statusBar = new StatusBar;

   canvas;
   ctx;
   keyboard;
   camera_x = 0;

   lastCollisionCheck = 0;
   collisionCheckInterval = 1000 / 20;
   isGameOver = false;  
   gameOverSound = new Audio('audio/death_sound.mp3');


   constructor(canvas, keyboard) {
      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.keyboard = keyboard;
      this.draw();
      this.setWorld(this.character);
      this.level.enemies.forEach((enemy) =>{
         this.setWorld(enemy);
      });
   }


   checkCollisions() {
      this.level.enemies.forEach((enemy) => {
         if (this.character.isColliding(enemy) && this.character.healthPoints > 0) {
            this.character.getDamage();
            this.statusBar.setPercentage(this.character.healthPoints);
            if (this.character.healthPoints == 0) {
               console.log('you are dead!');
               this.playGameOverSound();
            }
         }
      });
      this.level.barriers.forEach((barrier) => {
         if (this.character.isColliding(barrier)) {
            this.character.getDamage();
            this.statusBar.setPercentage(this.character.healthPoints);
            if (this.character.healthPoints == 0) {
               console.log('you are dead!');
               this.playGameOverSound();
            }
         }
      });
   }


   playGameOverSound() {
      this.gameOverSound.volume = 0.15;
      this.gameOverSound.loop = false;
      this.gameOverSound.play();
   }


   startMusic() {
      this.level.music.volume = 0.05;
      this.level.music.loop = true;
      this.level.music.play();
   }


   stopMusic() {
      this.level.music.volume = 0.05;
      this.level.music.loop = true;
      this.level.music.pause();
   }


   setWorld(obj) {
      obj.world = this;
   }


   draw() {
      let now = Date.now();
      if (now - this.lastCollisionCheck > this.collisionCheckInterval) {
         this.checkCollisions();
         this.lastCollisionCheck = now;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.translate(this.camera_x, 0);
      this.addObjectsToMap(this.level.backgroundLayers);

      //----------space for fixed Objects------------
      this.ctx.translate(-this.camera_x, 0);
      this.addToMap(this.statusBar);
      this.ctx.translate(this.camera_x, 0);
      //---------------------------------------------

      this.addObjectsToMap(this.level.enemies);
      this.addToMap(this.character);
      this.addObjectsToMap(this.level.barriers);

      this.ctx.translate(-this.camera_x, 0);
      

      requestAnimationFrame(() => this.draw());
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
      MovObj.drawFrame(this.ctx);

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
