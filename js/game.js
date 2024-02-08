let canvas;
let world;
let keyboard;

let musicIsPlaying = false;
let gameIsPaused = false;
let checkInterval;
let checkIntervalOn = true;

let globalTimeouts = [];
let globalIntervals = [];
let animationFrameId = [];

let gameRestartet = false;

function clearAllTimeOuts() {
   globalTimeouts.forEach((id) => clearTimeout(id));
   globalTimeouts = [];
}


function clearAllIntervals() {
   globalIntervals.forEach((id) => clearInterval(id));
   globalIntervals = [];
}


function clearAnimationFrame() {
   if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
   }
}


function startGame() {
   document.getElementById('main-menu').style.display = 'none';
   document.getElementById('canvas').style.display = 'block';
   document.getElementById('playButton').style.display = 'block';
   document.getElementById('title').style.display = 'none';
   if (window.innerHeight < 800) {
      document.querySelector('.mobilePanel').style.display = 'flex';
      
   }
   world.startMusic();
   checkIfCharacterOrBossIsDead();
   world.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) {
         enemy.checkForCharacter();
      } else {
         enemy.animate();
      }
   });
}


function checkIfCharacterOrBossIsDead() {
   let checkInterval = setInterval(() => {
      if (world.character.healthPoints <= 0 && checkIntervalOn) {
         console.log('Character fainted');

         world.stopMusic();
         setTimeout(() => {
            checkIntervalOn = false;
            
            setTimeout(() => {
               document.getElementById('gameOverScreen').style.display = 'flex';
               clearAll();
            }, 2500);
         }, 500);
      }
      if (!checkIntervalOn) {
         clearInterval(checkInterval);
      }

      if (world.endbossDefeated && checkIntervalOn) {
         console.log('Boss defeated');
         world.stopMusic();
         setTimeout(() => {
            document.getElementById('gameWonScreen').style.display = 'flex';
            checkIntervalOn = false;

            setTimeout(() => {
               clearAll();
            }, 3000);
         }, 500);
      }
   }, 1000 / 10);
   globalIntervals.push(checkInterval);
}


function init() {
   canvas = document.getElementById('canvas');
   keyboard = new Keyboard();
   createNewWorld();

   if (gameRestartet) {
      let gameRestartTimeout = setTimeout(() => {
         startGame();
      }, 1000);
      globalTimeouts.push(gameRestartTimeout);
   }
}


function createNewWorld() {
   world = new World(canvas, keyboard, createLevel1());
}


function switchSoundMute() {
   musicIsPlaying = !musicIsPlaying;
   musicIsPlaying ? world.startMusic() : world.stopMusic();
}


function switchPlayPause() {
   const endboss = world.level.enemies.find(enemy => enemy instanceof Endboss);
   if (endboss.isAttacking) {
      console.log('cant pause during boss attack')
      return
   }
   gameIsPaused = !gameIsPaused;
   if (gameIsPaused) {
      pauseGame();
   } else {
      resumeGame();
   }
   document.getElementById('playButton').textContent = gameIsPaused ? 'resume' : 'pause';
}


function pauseGame() {
   world.isGamePaused = true;
   const endboss = world.level.enemies.find(enemy => enemy instanceof Endboss);
   if (!endboss.isAttacking) {
      
      console.log('Game paused');
      switchSoundMute();
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
   } else {
      console.log('cant pause during boss attack')
   }
}


function resumeGame() {
   world.isGamePaused = false;
   clearAll();
   checkIfCharacterOrBossIsDead();
   switchSoundMute();
   console.log('Game resumed');
   world.character.animate();
   world.level.enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) {
         enemy.animate();
      } else if (enemy instanceof Endboss && enemy.isIntroduced){
         enemy.animate();
      }
   });

   world.level.collectables.forEach((collectable) => {
      collectable.animate();
   });
   requestAnimationFrame(world.draw.bind(world));
}


function resetGame() {
   clearAll();
   document.getElementById('gameOverScreen').style.display = 'none';
   document.getElementById('gameWonScreen').style.display = 'none';

   if (world.character) {
      world.character.clearIntervals();
   }

   if (world && world.level && world.level.enemies) {
      world.level.enemies = [];
   }

   world.stopMusic();
   
   setTimeout(() => {
      gameRestartet = true;
      checkIntervalOn = true;

      init();
   }, 500);
   checkIfCharacterOrBossIsDead();
}


function clearAll() {
   clearAllTimeOuts();
   clearAllIntervals();
   clearAnimationFrame();
}



function simulateKeyDown(keyCode) {
   const event = new KeyboardEvent('keydown', { code: keyCode });
   window.dispatchEvent(event);
}

function simulateKeyUp(keyCode) {
   const event = new KeyboardEvent('keyup', { code: keyCode });
   window.dispatchEvent(event);
}

function handleTouchStart(keyCode) {
   simulateKeyDown(keyCode);
   event.preventDefault();
}

function handleTouchEnd(keyCode) {
   simulateKeyUp(keyCode);
   event.preventDefault();
}