let canvas;
let world;
let keyboard;

let musicIsPlaying = false;



function startGame() {
   document.getElementById('main-menu').style.display = 'none';
   document.getElementById('canvas').style.display = 'block';
   document.getElementById('musicButton').style.display = 'block';
   switchSoundMute();
   world.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) {
         enemy.checkForCharacter();
      } else {
         enemy.animate()
      }
   });
}

function init() {
   canvas = document.getElementById('canvas');
   keyboard = new Keyboard();
   world = new World(canvas, keyboard);
   
   console.log('Mein Charakter ist', world.character);
}

function switchSoundMute() {
   const button = document.getElementById('musicButton');
   musicIsPlaying = !musicIsPlaying;
   musicIsPlaying ? world.startMusic() : world.stopMusic();
   button.textContent = musicIsPlaying ? 'stop music' : 'start music';
}