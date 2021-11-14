export const PLAYBACK_STATES = {
  // The canvas is blank
  EMPTY: 0,
  // The canvas is clearing with dissolveShader
  REVERSE: 1,
  // The canvas is filling up with painterShader
  FORWARD: 2,
  // The canvas is filled
  DONE: 3,
};

let playbackState = PLAYBACK_STATES.FORWARD;

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
