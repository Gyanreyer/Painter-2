import pixiApp from "./pixiApp";
import { getPlaybackState, PLAYBACK_STATES } from "./playbackState";
import render from "./render";

export default function startUpdateLoop() {
  // Add the pixi canvas to the DOM
  document.body.appendChild(pixiApp.view);

  pixiApp.ticker.add(() => {
    const currentPlaybackState = getPlaybackState();

    if (
      currentPlaybackState === PLAYBACK_STATES.FORWARD ||
      currentPlaybackState === PLAYBACK_STATES.REVERSE
    ) {
      render();
    }
  });
}
