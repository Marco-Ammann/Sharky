let canvas;
let world;
let keyboard;

let musicIsPlaying = false;

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