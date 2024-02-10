let canvas;
let world;
let keyboard;

let musicIsPlaying = false;
let isMuted = false;
let gameIsPaused = false;
let checkInterval;
let checkIntervalOn = true;

let globalTimeouts = [];
let globalIntervals = [];
let animationFrameId = [];

let gameRestartet = false;

/**
 * Clears all timeouts stored in globalTimeouts array.
 */
function clearAllTimeOuts() {
   globalTimeouts.forEach((id) => clearTimeout(id));
   globalTimeouts = [];
}


/**
 * Clears all intervals stored in globalIntervals array.
 */
function clearAllIntervals() {
   globalIntervals.forEach((id) => clearInterval(id));
   globalIntervals = [];
}


/**
 * Cancels the animation frame request.
 */
function clearAnimationFrame() {
   if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
   }
}


/**
 * Initializes the game, sets up the world, and starts the game logic.
 */
function startGame() {
   document.getElementById('main-menu').style.display = 'none';
   document.getElementById('canvas').style.display = 'block';
   document.getElementById('playButton').style.display = 'flex';
   document.getElementById('switchSoundMuteButton').style.display = 'flex';
   document.getElementById('title').style.display = 'none';
   if (window.innerHeight < 800) {
      document.querySelector('.mobilePanel').style.display = 'flex';
   }
   world.startMusic();
   checkIfCharacterOrBossIsDead();
   world.character.resetSleepTimeout();
   world.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) {
         enemy.checkForCharacter();
      } else {
         enemy.animate();
      }
   });
}


/**
 * Checks whether the character or the endboss is dead and updates the game state accordingly.
 */
function checkIfCharacterOrBossIsDead() {
   let checkInterval = setInterval(() => {
      if (world.character.healthPoints <= 0 && checkIntervalOn) {
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


/**
 * Initializes the game environment and preloads necessary resources.
 */
function init() {
   canvas = document.getElementById('canvas');
   keyboard = new Keyboard();
   createNewWorld();
   setIndividualVolumes();

   if (gameRestartet) {
      let gameRestartTimeout = setTimeout(() => {
         startGame();
      }, 1500);
      globalTimeouts.push(gameRestartTimeout);
   }
}


/**
 * Creates a new game World instance
 */
function createNewWorld() {
   world = new World(canvas, keyboard, createLevel1());
}


/**
 * Resets the game to its initial state.
 */
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
      world.character.resetSleepTimeout();
      if (isMuted) {
         muteAllSounds();         
      }
   }, 500);
   checkIfCharacterOrBossIsDead();
}


/**
 * Clears all timeouts, intervals, and animation frames to stop all ongoing game actions.
 */
function clearAll() {
   clearAllTimeOuts();
   clearAllIntervals();
   clearAnimationFrame();
}


/**
 * Simulates a keydown event for a given key code.
 * @param {string} keyCode - The code of the key to simulate.
 */
function simulateKeyDown(keyCode) {
   const event = new KeyboardEvent('keydown', { code: keyCode });
   window.dispatchEvent(event);
}


/**
 * Simulates a keyup event for a given key code.
 * @param {string} keyCode - The code of the key to simulate.
 */
function simulateKeyUp(keyCode) {
   const event = new KeyboardEvent('keyup', { code: keyCode });
   window.dispatchEvent(event);
}


/**
 * Handles the start of a touch interaction, simulating a keydown event.
 * @param {string} keyCode - The code of the key to simulate.
 */
function handleTouchStart(keyCode) {
   simulateKeyDown(keyCode);
   event.preventDefault();
}


/**
 * Handles the end of a touch interaction, simulating a keyup event.
 * @param {string} keyCode - The code of the key to simulate.
 */
function handleTouchEnd(keyCode) {
   simulateKeyUp(keyCode);
   event.preventDefault();
}
