/**
 * Toggles the game's sound between muted and unmuted.
 */
function switchSoundMute() {
   let buttonImage = document.getElementById('switchSoundImage');
   isMuted = !isMuted;

   if (isMuted) {
      buttonImage.src = 'img/6.Buttons/music-off-icon.svg';
      muteAllSounds();
   } else {
      buttonImage.src = 'img/6.Buttons/music-on-icon.svg';
      unmuteAllSounds();
   }
}


/**
 * Mutes all sounds by setting their volume to 0.
 */
function muteAllSounds() {
   [
      'swim_sound',
      'attack_sound',
      'hit_sound',
      'impact_sound',
      'gameMusic',
      'gameOverSound',
      'gameWonSound',
      'bossBattleSound',
   ].forEach((sound) => {
      setVolume(world.character[sound] || world[sound], 0);
   });

   world.level.enemies.forEach((enemy) => {
      setVolume(enemy.impact_sound, 0);
      if (enemy.introduce_sound) setVolume(enemy.introduce_sound, 0); // Specific to Endboss
      if (enemy.bite_sound) setVolume(enemy.bite_sound, 0); // Specific to Endboss
   });

   world.level.collectables.forEach((collectable) => {
      setVolume(collectable.pickup_sound, 0);
   });
}


/**
 * Unmutes all sounds by restoring their volume to a specific level.
 */
function unmuteAllSounds() {
   setIndividualVolumes();
}


/**
 * Adjusts the volume of a given sound object.
 * @param {HTMLAudioElement} sound - The sound object to adjust.
 * @param {number} volume - The new volume level (between 0.0 and 1.0).
 */
function setVolume(sound, volume) {
   if (sound) sound.volume = volume;
}


/**
 * Sets the volume of each sound object in the game according to predefined settings.
 */
function setIndividualVolumes() {
   Object.keys(soundSettings.character).forEach((sound) => {
      setVolume(world.character[sound], soundSettings.character[sound]);
   });

   Object.keys(soundSettings.game).forEach((sound) => {
      setVolume(world[sound], soundSettings.game[sound]);
   });

   world.level.enemies.forEach((enemy) => {
      setVolume(enemy.impact_sound, soundSettings.enemy.default);
      if (enemy instanceof Endboss) {
         setVolume(enemy.introduce_sound, soundSettings.enemy.endboss.introduce_sound);
         setVolume(enemy.bite_sound, soundSettings.enemy.endboss.bite_sound);
      }
   });

   world.level.collectables.forEach((collectable) => {
      setVolume(collectable.pickup_sound, soundSettings.collectable);
   });
}