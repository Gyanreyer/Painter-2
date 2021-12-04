import pixiApp from "./pixiApp";
import { getPlaybackState, PLAYBACK_STATES } from "./playbackState";
import render from "./render";

export default function startUpdateLoop() {
  // Add the pixi canvas to the DOM
  document.getElementById("pixi-root").appendChild(pixiApp.view);

  let renderPassesPerLoop = 4;
  let renderPassCount = 0;

  // const renderSpeed = 1;

  (function update() {
    const currentPlaybackState = getPlaybackState();

    if (
      currentPlaybackState === PLAYBACK_STATES.FORWARD ||
      currentPlaybackState === PLAYBACK_STATES.REVERSE
    ) {
      renderPassCount += renderPassesPerLoop;

      while (Math.floor(renderPassCount) > 0) {
        render();
        renderPassCount -= 1;
      }
    }

    requestAnimationFrame(update);
  })();

  // pixiApp.ticker.add(() => {

  //   if (
  //     currentPlaybackState === PLAYBACK_STATES.FORWARD ||
  //     currentPlaybackState === PLAYBACK_STATES.REVERSE
  //   ) {
  //     render();
  //   }
  // });
}
