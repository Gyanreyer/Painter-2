import {
  addPlaybackStateChangeListener,
  PLAYBACK_STATES,
  updatePlaybackState,
} from "./playbackState";
import { getDisplayPixelsArray } from "./render";

import PaintCompletionCheckWorker from "worker-loader!./workers/paintCompletionChecker.worker";
import DissolveCompletionCheckWorker from "worker-loader!./workers/dissolveCompletionChecker.worker";

const paintCompletionChecker = new PaintCompletionCheckWorker();
const dissolveCompletionChecker = new DissolveCompletionCheckWorker();

let completionCheckTimeoutId;

// While we're painting or dissolving, perform infrequent checks
// on the pixel data to determine if all possible pixels have been
// painted/dissolved and if so, update playback state
export default function startCompletionChecker() {
  addPlaybackStateChangeListener((newPlaybackState) => {
    clearTimeout(completionCheckTimeoutId);
    paintCompletionChecker.onmessage = null;
    dissolveCompletionChecker.onmessage = null;

    if (
      newPlaybackState !== PLAYBACK_STATES.FORWARD &&
      newPlaybackState !== PLAYBACK_STATES.REVERSE
    )
      return;

    const completionChecker =
      newPlaybackState === PLAYBACK_STATES.FORWARD
        ? paintCompletionChecker
        : dissolveCompletionChecker;

    let lastIncompletePixelIndex = 0;

    const checkIsComplete = () => {
      const displayPixelBuffer = getDisplayPixelsArray().buffer;

      completionChecker.postMessage(
        {
          displayPixelBuffer,
          lastIncompletePixelIndex,
        },
        // Transfer ownership of the pixel buffer to the worker
        // Note that this means displayPixelBuffer will no longer be usable
        // within this checkIsPaintComplete context
        [displayPixelBuffer]
      );
    };

    completionChecker.onmessage = (event) => {
      if (event.data.isComplete) {
        updatePlaybackState(
          newPlaybackState === PLAYBACK_STATES.FORWARD
            ? PLAYBACK_STATES.DONE
            : PLAYBACK_STATES.EMPTY
        );
        return;
      }

      lastIncompletePixelIndex = event.data.lastIncompletePixelIndex;

      completionCheckTimeoutId = setTimeout(checkIsComplete, 500);
    };

    checkIsComplete();
  });
}
