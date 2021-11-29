import {
  updatePlaybackState,
  getPlaybackState,
  PLAYBACK_STATES,
  addPlaybackStateChangeListener,
} from "./playbackState";
import { getColorChannelValue } from "./utils/colors";
import drawPixels from "./drawPixels";
import { resizeRenderer, downloadCanvasImage } from "./render";
import pixiApp from "./pixiApp";
import { getPointerEventPositionRelativeToTarget } from "./utils/pointer";

function togglePlayPausePlaybackState() {
  const currentPlaybackState = getPlaybackState();

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
}

function togglePlaybackDirection() {
  const currentPlaybackState = getPlaybackState();

  switch (currentPlaybackState) {
    case PLAYBACK_STATES.FORWARD:
    case PLAYBACK_STATES.DONE:
      updatePlaybackState(PLAYBACK_STATES.REVERSE);
      break;
    case PLAYBACK_STATES.FORWARD_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.REVERSE_PAUSED);
      break;
    case PLAYBACK_STATES.REVERSE:
      updatePlaybackState(PLAYBACK_STATES.FORWARD);
      break;
    case PLAYBACK_STATES.REVERSE_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.FORWARD_PAUSED);
      break;
    default:
    // Don't do anything if the canvas is empty or playback is done
  }
}

export default function startInputManager() {
  const playPauseButton = document.getElementById("play-pause-button");
  playPauseButton.addEventListener("click", () =>
    togglePlayPausePlaybackState()
  );

  const playbackDirectionButton = document.getElementById(
    "playback-direction-button"
  );
  playbackDirectionButton.addEventListener("click", () =>
    togglePlaybackDirection()
  );

  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", () => downloadCanvasImage());

  document.documentElement.dataset.playbackstate = getPlaybackState();
  addPlaybackStateChangeListener((newPlaybackState) => {
    document.documentElement.dataset.playbackstate = newPlaybackState;
  });

  addPlaybackStateChangeListener((newPlaybackState) => {
    playbackDirectionButton;
    switch (newPlaybackState) {
      case PLAYBACK_STATES.FORWARD:
      case PLAYBACK_STATES.FORWARD_PAUSED:
      case PLAYBACK_STATES.EMPTY:
        playPauseButton.dataset.playbackdirection = "forward";
      case PLAYBACK_STATES.REVERSE:
      case PLAYBACK_STATES.REVERSE_PAUSED:
      case PLAYBACK_STATES.EMPTY:
        playPauseButton.dataset.playbackdirection = "reverse";
        break;
    }
  });

  window.addEventListener("keydown", (event) => {
    const keyCode = event.key?.toLowerCase() || event.code;

    switch (keyCode) {
      // "D" key togggles playback direction
      case "d":
      case "KeyD":
        togglePlaybackDirection();
        break;
      // "P" key toggles playback into a paused/unpaused state
      case "p":
      case "KeyP":
        togglePlayPausePlaybackState();
        break;

      case "s":
      case "KeyS":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          downloadCanvasImage();
        }
        break;

      default:
    }
  });

  pixiApp.view.addEventListener("pointerdown", (event) => {
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

    const relativePointerPosition =
      getPointerEventPositionRelativeToTarget(event);

    let previousPointerX = Math.round(relativePointerPosition.x);
    let previousPointerY = Math.round(relativePointerPosition.y);

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
      const relativePointerPosition =
        getPointerEventPositionRelativeToTarget(event);

      const newPointerX = Math.round(relativePointerPosition.x);
      const newPointerY = Math.round(relativePointerPosition.y);

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

    pixiApp.view.addEventListener("pointermove", onPointerMove);

    function onPointerUp() {
      // Disable event listeners when the user lifts their mouse
      pixiApp.view.removeEventListener("pointermove", onPointerMove);
      pixiApp.view.removeEventListener("pointerup", onPointerUp);
    }
    pixiApp.view.addEventListener("pointerup", onPointerUp);
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

  let mouseActivityTimeoutId;

  window.addEventListener("mousemove", () => {
    clearTimeout(mouseActivityTimeoutId);

    document.documentElement.dataset.ismouseactive = "true";

    mouseActivityTimeoutId = setTimeout(() => {
      document.documentElement.dataset.ismouseactive = "false";
    }, 4000);
  });
}
