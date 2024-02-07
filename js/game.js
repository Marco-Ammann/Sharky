let canvas;
let world;
let keyboard;

let musicIsPlaying = false;
let characterCheckInterval;
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
   checkIfCharacterIsAlive();
   world.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) {
         enemy.checkForCharacter();
      } else {
         enemy.animate();
      }
   });
}


function checkIfCharacterIsAlive() {
   let characterCheckInterval = setInterval(() => {
      if (world.character.healthPoints == 0 && checkIntervalOn) {
         document.getElementById('gameOverScreen').style.display = 'flex';
         switchSoundMute();
         checkIntervalOn = false;
         clearAll();
      } else if (!checkIntervalOn) {
         clearInterval(characterCheckInterval);
      }
   }, 1000 / 10);
   globalIntervals.push(characterCheckInterval);
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
   
   if (world.character) {
      world.character.clearIntervals();
   }
   
   if (world && world.level && world.level.enemies) {
      world.level.enemies = [];
   }
   
   setTimeout(() => {
      gameRestartet = true;
      checkIntervalOn = true;

      
      init();
   }, 500);
   checkIfCharacterIsAlive();
}


function clearAll() {
   clearAllTimeOuts();
   clearAllIntervals();
   clearAnimationFrame();
}
