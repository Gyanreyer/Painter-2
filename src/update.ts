import pixiApp from "./pixiApp";
import { getPlaybackState, PLAYBACK_STATES } from "./playbackState";
import render from "./render";

export default function startUpdateLoop() {
  // Add the pixi canvas to the DOM
  document.getElementById("pixi-root").appendChild(pixiApp.view);

  (function update() {
    const currentPlaybackState = getPlaybackState();

    if (
      currentPlaybackState === PLAYBACK_STATES.FORWARD ||
      currentPlaybackState === PLAYBACK_STATES.REVERSE
    ) {
      render();
    }

    requestAnimationFrame(update);
  })();
}
