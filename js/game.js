let canvas;
let world;
let keyboard = new Keyboard();
let musicIsPlaying = false;

function init() {
   canvas = document.getElementById('canvas');
   world = new World(canvas, keyboard);

   console.log('My Character is', world.character);
}

function switchSoundMute() {
   const button = document.getElementById('musicButton');
   musicIsPlaying = !musicIsPlaying;
   musicIsPlaying ? world.startMusic() : world.stopMusic();
   button.textContent = musicIsPlaying ? 'stop music' : 'start music';
}