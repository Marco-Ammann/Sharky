/**
 * Manages keyboard input for game controls, tracking the state of arrow keys and the spacebar.
 */
class Keyboard {
   LEFT = false;
   RIGHT = false;
   UP = false;
   DOWN = false;
   SPACE = false;

   // Maps keyboard event codes to corresponding control properties
   keyMap = {
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      Space: 'SPACE',
   };
   

   /**
    * Sets up initial state of keyboard controls and event listeners for key press actions.
    */
   constructor() {
      window.addEventListener('keydown', (event) => {
         this.handleKeyEvent(event, true);
      });

      window.addEventListener('keyup', (event) => {
         this.handleKeyEvent(event, false);
      });
   }


   /**
    * Handles keydown and keyup events to update control states.
    * @param {KeyboardEvent} event - The event object representing the key action.
    * @param {boolean} isKeyDown - True if the key is down, false if the key is up.
    */
   handleKeyEvent(event, isKeyDown) {
      const keyState = this.keyMap[event.code];
      if (keyState) {
         this[keyState] = isKeyDown;
      }
   }
}
