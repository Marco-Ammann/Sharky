/**
 * toggles the game's play state between paused and resumed
 * @return cancel pause request while Boss is attacking
 */
function switchPlayPause() {
   const endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
   if (endboss.isAttacking) {
      return;
   }
   gameIsPaused = !gameIsPaused;

   const playButtonImage = document.getElementById('playButtonImage');
   if (gameIsPaused) {
      pauseGame();
      playButtonImage.src = 'img/6.Buttons/play-icon.svg';
   } else {
      resumeGame();
      playButtonImage.src = 'img/6.Buttons/pause-icon.svg';
   }
}


/**
 * pauses the game, stopping animations and gameplay
 */
function pauseGame() {
   world.isGamePaused = true;
   const endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
   if (!endboss.isAttacking) {
      world.character.clearIntervals();
      world.level.enemies.forEach((enemy) => {
         enemy.clearIntervals();
         if (enemy instanceof Endboss) {
            enemy.clearIntervals();
         }
      });

      world.level.collectables.forEach((collectable) => {
         collectable.clearIntervals();
      });

      cancelAnimationFrame(animationFrameId);
   }
}


/**
 * resumes the game from a paused state, restarting animations and gameplay
 */
function resumeGame() {
   world.isGamePaused = false;
   clearAll();
   checkIfCharacterOrBossIsDead();
   world.character.animate();
   world.level.enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) {
         enemy.animate();
      } else if (enemy instanceof Endboss && enemy.isIntroduced) {
         enemy.animate();
      }
   });

   world.level.collectables.forEach((collectable) => {
      collectable.animate();
   });
   requestAnimationFrame(world.draw.bind(world));
}
