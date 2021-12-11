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
  listener: PlaybackStateChangeListener,
  shouldInvokeImmediately: boolean = false
) {
  if (shouldInvokeImmediately) {
    listener(playbackState, playbackState);
  }

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

export function togglePlayPausePlaybackState() {
  const currentPlaybackState = getPlaybackState();

  switch (currentPlaybackState) {
    case PLAYBACK_STATES.FORWARD:
      updatePlaybackState(PLAYBACK_STATES.FORWARD_PAUSED);
      break;
    case PLAYBACK_STATES.FORWARD_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.FORWARD);
      break;
    case PLAYBACK_STATES.REVERSE:
      updatePlaybackState(PLAYBACK_STATES.REVERSE_PAUSED);
      break;
    case PLAYBACK_STATES.REVERSE_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.REVERSE);
      break;
    default:
    // Don't do anything if the canvas is empty or playback is done
  }
}

export function togglePlaybackDirection() {
  const currentPlaybackState = getPlaybackState();

  switch (currentPlaybackState) {
    case PLAYBACK_STATES.FORWARD:
    case PLAYBACK_STATES.DONE:
      updatePlaybackState(PLAYBACK_STATES.REVERSE);
      break;
    case PLAYBACK_STATES.FORWARD_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.REVERSE_PAUSED);
      break;
    case PLAYBACK_STATES.REVERSE:
      updatePlaybackState(PLAYBACK_STATES.FORWARD);
      break;
    case PLAYBACK_STATES.REVERSE_PAUSED:
      updatePlaybackState(PLAYBACK_STATES.FORWARD_PAUSED);
      break;
    default:
    // Don't do anything if the canvas is empty or playback is done
  }
}

export enum PLAYBACK_DIRECTIONS {
  FORWARD = "FORWARD",
  REVERSE = "REVERSE",
  NONE = "NONE",
}

export function getPlaybackDirectionFromPlaybackState(
  playbackState: PLAYBACK_STATES
) {
  switch (playbackState) {
    case PLAYBACK_STATES.FORWARD:
    case PLAYBACK_STATES.FORWARD_PAUSED:
    case PLAYBACK_STATES.DONE:
      return PLAYBACK_DIRECTIONS.FORWARD;
    case PLAYBACK_STATES.REVERSE:
    case PLAYBACK_STATES.REVERSE_PAUSED:
      return PLAYBACK_DIRECTIONS.REVERSE;
    case PLAYBACK_STATES.EMPTY:
      return PLAYBACK_DIRECTIONS.NONE;
  }
}
