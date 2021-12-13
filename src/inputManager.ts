import {
  updatePlaybackState,
  getPlaybackState,
  PLAYBACK_STATES,
} from "./playbackState";
import startDrawing from "./drawPixels";
import { resizeRenderer } from "./render";
import pixiApp from "./pixiApp";

export default function startInputManager() {
  pixiApp.view.addEventListener("pointerdown", (event) => {
    const onMovePaintBrush = startDrawing(
      Math.round(event.clientX),
      Math.round(event.clientY)
    );

    if (onMovePaintBrush) {
      function onPointerMove(event) {
        onMovePaintBrush(Math.round(event.clientX), Math.round(event.clientY));
      }
      window.addEventListener("pointermove", onPointerMove);

      function onPointerUp() {
        // Disable event listeners when the user lifts their mouse
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      }

      window.addEventListener("pointerup", onPointerUp);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      resizeRenderer(window.innerWidth, window.innerHeight);

      // If playback is currently done, attempt to start it again in case
      // the resize created some new un-painted white space on the canvas
      if (getPlaybackState() === PLAYBACK_STATES.DONE) {
        updatePlaybackState(PLAYBACK_STATES.FORWARD);
      }
    },
    { passive: true }
  );
}
