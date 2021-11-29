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

// While we're painting or dissolving, perform infrequent checks
// on the pixel data to determine if all possible pixels have been
// painted/dissolved and if so, update playback state
export default function startCompletionChecker() {
  addPlaybackStateChangeListener((playbackState: PLAYBACK_STATES) => {
    if (
      playbackState !== PLAYBACK_STATES.FORWARD &&
      playbackState !== PLAYBACK_STATES.REVERSE
    )
      return;

    const completionChecker =
      playbackState === PLAYBACK_STATES.FORWARD
        ? paintCompletionChecker
        : dissolveCompletionChecker;

    let isCompletionCheckCanceled = false;
    let completionCheckTimeoutId = null;

    const removePlaybackStateChangeListener = addPlaybackStateChangeListener(
      (newPlaybackState) => {
        if (newPlaybackState !== playbackState) {
          // If the playback state changes while our completion check is in progress,
          // mark that the completion check loop should be canceled
          isCompletionCheckCanceled = true;
          clearTimeout(completionCheckTimeoutId);

          // Reset the completion checker's state
          completionChecker.reset();

          // Remove this playback state listener now that it's detected a state change
          removePlaybackStateChangeListener();
        }
      }
    );

    (async function checkIsComplete() {
      const displayPixelArray = getDisplayPixelsArray();

      const isComplete = await completionChecker.checkIsComplete(
        // Transfer ownership of the pixel buffer to the worker
        // Note that this means displayPixelBuffer will no longer be usable
        // within this checkIsPaintComplete context
        Comlink.transfer(displayPixelArray, [displayPixelArray.buffer])
      );

      // If the completion check loop is cancelled, return early
      if (isCompletionCheckCanceled) return;

      if (isComplete) {
        updatePlaybackState(
          playbackState === PLAYBACK_STATES.FORWARD
            ? PLAYBACK_STATES.DONE
            : PLAYBACK_STATES.EMPTY
        );
        return;
      }

      // Wait 200ms and then run another completion check; this allows us to keep the performance impact
      // of these checks lower while being just frequent enough to feel fairly responsive to the user
      completionCheckTimeoutId = setTimeout(checkIsComplete, 200);
    })();
  });
}
