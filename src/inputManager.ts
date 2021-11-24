import {
  updatePlaybackState,
  getPlaybackState,
  PLAYBACK_STATES,
} from "./playbackState";
import { getColorChannelValue } from "./utils/colors";
import drawPixels from "./drawPixels";

export default function startInputManager() {
  window.addEventListener("keydown", (event) => {
    const currentPlaybackState = getPlaybackState();

    const keyCode = event.key?.toLowerCase() || event.code;

    switch (keyCode) {
      // The "R" key switches playback state to reverse
      case "r":
      case "KeyR":
        switch (currentPlaybackState) {
          case PLAYBACK_STATES.FORWARD:
          case PLAYBACK_STATES.FORWARD_PAUSED:
          case PLAYBACK_STATES.DONE:
            updatePlaybackState(PLAYBACK_STATES.REVERSE);
            break;
          default:
        }

        break;
      // The "F" key switches playback state to forward if it's currently going in reverse
      case "f":
      case "KeyF":
        switch (currentPlaybackState) {
          case PLAYBACK_STATES.REVERSE:
          case PLAYBACK_STATES.REVERSE_PAUSED:
            updatePlaybackState(PLAYBACK_STATES.FORWARD);
            break;
          default:
        }

        break;
      // Space bar toggles playback into a paused/unpaused state
      case " ":
      case "Space":
        switch (currentPlaybackState) {
          case PLAYBACK_STATES.FORWARD:
            updatePlaybackState(PLAYBACK_STATES.FORWARD_PAUSED);
            break;
          case PLAYBACK_STATES.FORWARD_PAUSED:
            updatePlaybackState(PLAYBACK_STATES.FORWARD);
            break;
          case PLAYBACK_STATES.REVERSE:
            updatePlaybackState(PLAYBACK_STATES.REVERSE_PAUSED);
            break;
          case PLAYBACK_STATES.REVERSE_PAUSED:
            updatePlaybackState(PLAYBACK_STATES.REVERSE);
            break;
          default:
          // Don't do anything if the canvas is empty or playback is done
        }

      default:
    }
  });

  window.addEventListener("pointerdown", (event) => {
    const currentPlaybackState = getPlaybackState();

    switch (currentPlaybackState) {
      case PLAYBACK_STATES.REVERSE:
      case PLAYBACK_STATES.REVERSE_PAUSED:
      case PLAYBACK_STATES.DONE:
        // If the current playback state is either done or going in reverse,
        // return early to ignore any attempts to paint
        return;
      case PLAYBACK_STATES.EMPTY:
        updatePlaybackState(PLAYBACK_STATES.FORWARD);
        break;
      default:
      // Don't do anything if the playback state is already forward or paused
    }

    let previousPointerX = Math.round(event.x);
    let previousPointerY = Math.round(event.y);

    // Set an initial color to draw onto the canvas at this pointer's position
    const pointerColor = new Uint8Array([
      getColorChannelValue(),
      getColorChannelValue(),
      getColorChannelValue(),
    ]);

    drawPixels([
      {
        x: previousPointerX,
        y: previousPointerY,
        color: pointerColor,
      },
    ]);

    function onPointerMove(event) {
      const newPointerX = Math.round(event.x);
      const newPointerY = Math.round(event.y);

      const pointerXChange = newPointerX - previousPointerX;
      const pointerYChange = newPointerY - previousPointerY;

      const diffX = Math.abs(pointerXChange);
      const diffY = Math.abs(pointerYChange);

      const slopeX = Math.sign(pointerXChange);
      const slopeY = Math.sign(pointerYChange);

      let err = diffX - diffY;

      let x = previousPointerX;
      let y = previousPointerY;

      const pixelQueue = [];

      do {
        pointerColor[0] = getColorChannelValue(pointerColor[0]);
        pointerColor[1] = getColorChannelValue(pointerColor[1]);
        pointerColor[2] = getColorChannelValue(pointerColor[2]);

        const err2 = err << 1;
        if (err2 > -diffY) {
          err -= diffY;
          x += slopeX;
        }
        if (err2 < diffX) {
          err += diffX;
          y += slopeY;
        }

        // Only add pixels that are on screen
        if (
          x >= 0 &&
          x < window.innerWidth &&
          y >= 0 &&
          y < window.innerHeight
        ) {
          pixelQueue.push({
            x,
            y,
            color: pointerColor,
          });
        }
      } while (x !== newPointerX || y !== newPointerY);

      drawPixels(pixelQueue);

      previousPointerX = newPointerX;
      previousPointerY = newPointerY;
    }

    window.addEventListener("pointermove", onPointerMove);

    function onPointerUp() {
      // Disable event listeners when the user lifts their mouse
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    window.addEventListener("pointerup", onPointerUp);
  });
}
