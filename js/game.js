let canvas;
let world;
let keyboard;

let musicIsPlaying = false;
let checkInterval;
let checkIntervalOn = true;

let globalTimeouts = [];
let globalIntervals = [];
let animationFrameId;

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
   document.getElementById('musicButton').style.display = 'block';
   document.getElementById('title').style.display = 'none';
   switchSoundMute();
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
         switchSoundMute();
         setTimeout(() => {            
            document.getElementById('gameOverScreen').style.display = 'flex';
            checkIntervalOn = false;

            setTimeout(() => {               
               clearAll();
            }, 3000);
         }, 500);
      } 
      if (!checkIntervalOn) {
         clearInterval(checkInterval);
      }

      if(world.endbossDefeated && checkIntervalOn) {
         switchSoundMute();
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
   const button = document.getElementById('musicButton');
   musicIsPlaying = !musicIsPlaying;
   musicIsPlaying ? world.startMusic() : world.stopMusic();
   button.textContent = musicIsPlaying ? 'stop music' : 'start music';
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
   world.handleBossDefeat();
   
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
