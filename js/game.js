let canvas;
let world;
let keyboard = new Keyboard();

function init() {
   canvas = document.getElementById('canvas');
   world = new World(canvas, keyboard);

   console.log('My Character is', world.character);
}

function switchSoundMute() {
   const isMuted = world.toggleMusic();
   const button = document.querySelector('button');
   button.textContent = isMuted ? 'Unmute Music' : 'Mute Music';
}