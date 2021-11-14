// Import CSS files for webpack build
import "./style.scss";

import pixiApp from "./pixiApp";
import render from "./render";
// Import the input manager so it can start listening for user input
import startInputManager from "./inputManager";
import { getPlaybackState, PLAYBACK_STATES } from "./playbackState";

pixiApp.ticker.add(() => {
  const currentPlaybackState = getPlaybackState();

  if (
    currentPlaybackState === PLAYBACK_STATES.FORWARD ||
    currentPlaybackState === PLAYBACK_STATES.REVERSE
  ) {
    render();
  }
});

startInputManager();
