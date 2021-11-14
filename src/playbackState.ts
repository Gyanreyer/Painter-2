export const PLAYBACK_STATES = {
  // The canvas is blank
  EMPTY: "EMPTY",
  // The canvas is clearing with dissolveShader
  REVERSE: "REVERSE",
  REVERSE_PAUSED: "REVERSE_PAUSED",
  // The canvas is filling up with painterShader
  FORWARD: "FORWARD",
  FORWARD_PAUSED: "FORWARD_PAUSED",
  // The canvas is filled
  DONE: "DONE",
};

let playbackState = PLAYBACK_STATES.EMPTY;

const playbackStateChangeListeners: Set<
  (newPlaybackState: number, previousPlaybackState: number) => void
> = new Set();

export function addPlaybackStateChangeListener(listener) {
  playbackStateChangeListeners.add(listener);

  return () => playbackStateChangeListeners.delete(listener);
}

export function getPlaybackState() {
  return playbackState;
}

export function updatePlaybackState(newPlaybackState) {
  if (playbackState === newPlaybackState) return;

  const previousPlaybackState = playbackState;
  playbackState = newPlaybackState;

  playbackStateChangeListeners.forEach((listener) =>
    listener(newPlaybackState, previousPlaybackState)
  );
}
