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

  let isPlaying;
  let isHidden;

  addPlaybackStateChangeListener((playbackState) => {
    isPlaying =
      playbackState === PLAYBACK_STATES.FORWARD ||
      playbackState === PLAYBACK_STATES.REVERSE;

    isHidden =
      playbackState === PLAYBACK_STATES.EMPTY ||
      playbackState === PLAYBACK_STATES.DONE;
  }, true);

  function togglePlayPausePlaybackState() {
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

  // Add a keydown listener for the button's keyboard shortcut
  window.addEventListener("keydown", (event) => {
    // Ignore further events if the user is holding the same key down
    if (event.repeat) return;

    // If the user pressed the "P" key, toggle between a playing/paused state
    if (event.key === "p" || event.key === "P" || event.code === "KeyP") {
      togglePlayPausePlaybackState();
    }
  });
</script>

<ControlButton onClick={togglePlayPausePlaybackState} {isHidden}>
  {#if isPlaying}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
        class="icon-path"
        class:light={theme === BUTTON_THEMES.light}
        class:dark={theme === BUTTON_THEMES.dark}
      />
      <path d="M0 0h24v24H0z" fill="none" />
      <title>Pause (P)</title>
    </svg>
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 5v14l11-7z"
        class="icon-path"
        class:light={theme === BUTTON_THEMES.light}
        class:dark={theme === BUTTON_THEMES.dark}
      />
      <path d="M0 0h24v24H0z" fill="none" />
      <title>Play (P)</title>
    </svg>
  {/if}
</ControlButton>

<style lang="scss">
  svg {
    width: 32px;
    height: auto;

    .icon-path {
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
