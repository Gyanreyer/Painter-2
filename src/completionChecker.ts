import * as Comlink from "comlink";
import {
  addPlaybackStateChangeListener,
  PLAYBACK_STATES,
  updatePlaybackState,
} from "./playbackState";
import { getDisplayPixelsArray } from "./render";
import { DissolveCompletionChecker } from "./workers/dissolveCompletionChecker.worker";
import { PaintCompletionChecker } from "./workers/paintCompletionChecker.worker";

const paintCompletionCheckWorker = new Worker(
  new URL("./workers/paintCompletionChecker.worker", import.meta.url)
);
const paintCompletionChecker = Comlink.wrap<PaintCompletionChecker>(
  paintCompletionCheckWorker
);

const dissolveCompletionCheckWorker = new Worker(
  new URL("./workers/dissolveCompletionChecker.worker", import.meta.url)
);
const dissolveCompletionChecker = Comlink.wrap<DissolveCompletionChecker>(
  dissolveCompletionCheckWorker
);

let completionCheckTimeoutId;

// While we're painting or dissolving, perform infrequent checks
// on the pixel data to determine if all possible pixels have been
// painted/dissolved and if so, update playback state
export default function startCompletionChecker() {
  addPlaybackStateChangeListener((newPlaybackState) => {
    clearTimeout(completionCheckTimeoutId);

    if (
      newPlaybackState !== PLAYBACK_STATES.FORWARD &&
      newPlaybackState !== PLAYBACK_STATES.REVERSE
    )
      return;

    const completionChecker =
      newPlaybackState === PLAYBACK_STATES.FORWARD
        ? paintCompletionChecker
        : dissolveCompletionChecker;

    completionChecker.reset();

    (async function checkIsComplete() {
      const displayPixelArray = getDisplayPixelsArray();

      const isComplete = await completionChecker.checkIsComplete(
        // Transfer ownership of the pixel buffer to the worker
        // Note that this means displayPixelBuffer will no longer be usable
        // within this checkIsPaintComplete context
        Comlink.transfer(displayPixelArray, [displayPixelArray.buffer])
      );

      if (isComplete) {
        updatePlaybackState(
          newPlaybackState === PLAYBACK_STATES.FORWARD
            ? PLAYBACK_STATES.DONE
            : PLAYBACK_STATES.EMPTY
        );
        return;
      }

      completionCheckTimeoutId = setTimeout(checkIsComplete, 500);
    })();
  });
}
