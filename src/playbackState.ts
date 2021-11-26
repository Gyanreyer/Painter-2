export enum PLAYBACK_STATES {
  // The canvas is blank
  EMPTY = "EMPTY",
  // The canvas is clearing with dissolveShader
  REVERSE = "REVERSE",
  // Playback was paused while in the reverse dissolving state
  REVERSE_PAUSED = "REVERSE_PAUSED",
  // The canvas is painting with paintShader
  FORWARD = "FORWARD",
  // Playback was paused while in the forward painting state
  FORWARD_PAUSED = "FORWARD_PAUSED",
  // Painting is complete as every pixel has been filled
  DONE = "DONE",
}

let playbackState: PLAYBACK_STATES = PLAYBACK_STATES.EMPTY;

type PlaybackStateChangeListener = (
  newPlaybackState: PLAYBACK_STATES,
  previousPlaybackState: PLAYBACK_STATES
) => void;

const playbackStateChangeListeners: Set<PlaybackStateChangeListener> =
  new Set();

export function addPlaybackStateChangeListener(
  listener: PlaybackStateChangeListener
) {
  playbackStateChangeListeners.add(listener);

  return () => playbackStateChangeListeners.delete(listener);
}

export function getPlaybackState() {
  return playbackState;
}

export function updatePlaybackState(newPlaybackState: PLAYBACK_STATES) {
  if (playbackState === newPlaybackState) return;

  const previousPlaybackState = playbackState;
  playbackState = newPlaybackState;

  playbackStateChangeListeners.forEach((listener) =>
    listener(newPlaybackState, previousPlaybackState)
  );
}
