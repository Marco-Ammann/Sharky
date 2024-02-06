class Keyboard {
   LEFT = false;
   RIGHT = false;
   UP = false;
   DOWN = false;
   SPACE = false;

   keyMap = {
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      Space: 'SPACE',
   };


   constructor() {
      window.addEventListener('keydown', (event) => {
         this.handleKeyEvent(event, true);
      });

      window.addEventListener('keyup', (event) => {
         this.handleKeyEvent(event, false);
      });
   }


   handleKeyEvent(event, isKeyDown) {
      const keyState = this.keyMap[event.code];
      if (keyState) {
         this[keyState] = isKeyDown;
      }
   }
}