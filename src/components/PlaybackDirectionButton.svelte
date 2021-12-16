<script lang="ts">
  import {
    PLAYBACK_STATES,
    getPlaybackState,
    updatePlaybackState,
    addPlaybackStateChangeListener,
  } from "../playbackState";
  import ControlButton from "./ControlButton.svelte";
  import { BUTTON_THEMES } from "./types";

  export let theme: BUTTON_THEMES;

  let isHidden;
  let isReversed;

  addPlaybackStateChangeListener((playbackState) => {
    isHidden = playbackState === PLAYBACK_STATES.EMPTY;
    isReversed =
      playbackState === PLAYBACK_STATES.REVERSE ||
      playbackState === PLAYBACK_STATES.REVERSE_PAUSED;
  }, true);

  function togglePlaybackDirection() {
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
      // Don't do anything if the canvas is empty
    }
  }

  // Add a keydown listener for the button's keyboard shortcut
  window.addEventListener("keydown", (event) => {
    // Ignore further events if the user is holding the same key down
    if (event.repeat) return;

    // If the user pressed the "D" key, toggle the playback direction
    if (event.key === "d" || event.key === "D" || event.code === "KeyD") {
      togglePlaybackDirection();
    }
  });
</script>

<ControlButton onClick={togglePlaybackDirection} {isHidden}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    class:reverse={isReversed}
  >
    <g>
      <rect fill="none" height="24" width="24" />
    </g>
    <g>
      <g
        class="icon-polygons"
        class:light={theme === BUTTON_THEMES.light}
        class:dark={theme === BUTTON_THEMES.dark}
      >
        <polygon points="15.5,5 11,5 16,12 11,19 15.5,19 20.5,12" />
        <polygon points="8.5,5 4,5 9,12 4,19 8.5,19 13.5,12" />
      </g>
    </g>
    <title>Change direction (D)</title>
  </svg>
</ControlButton>

<style lang="scss">
  svg {
    width: 100%;
    height: auto;

    transition: transform 0.2s;

    &.reverse {
      transform: rotateY(180deg);
    }
    .icon-polygons {
      transition: fill 0.4s;

      &.dark {
        fill: black;
      }
      &.light {
        fill: white;
      }
    }
  }
</style>
