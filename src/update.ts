import pixiApp from "./pixiApp";
import { getPlaybackState, PLAYBACK_STATES } from "./playbackState";
import render from "./render";

export default function startUpdateLoop() {
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
