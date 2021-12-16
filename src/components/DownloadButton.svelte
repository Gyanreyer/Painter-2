<script lang="ts">
  import ControlButton from "./ControlButton.svelte";

  import {
    getPlaybackState,
    PLAYBACK_STATES,
    addPlaybackStateChangeListener,
  } from "../playbackState";
  import { downloadCanvasImage } from "../render";
  import { BUTTON_THEMES } from "./types";

  export let theme: BUTTON_THEMES;

  let isHidden = getPlaybackState() === PLAYBACK_STATES.EMPTY;

  addPlaybackStateChangeListener((newPlaybackState) => {
    isHidden = newPlaybackState === PLAYBACK_STATES.EMPTY;
  });

  // Add a keydown listener for the button's keyboard shortcut
  window.addEventListener("keydown", (event) => {
    // Ignore further events if the user is holding the same key down
    if (event.repeat) return;

    // If the user presses ctrl/cmd + "S", save the canvas as an image file
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "s" || event.key === "S" || event.code === "KeyS")
    ) {
      event.preventDefault();
      downloadCanvasImage();
    }
  });
</script>

<ControlButton {isHidden} onClick={downloadCanvasImage}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enable-background="new 0 0 24 24"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
  >
    <g>
      <rect fill="none" height="24" width="24" />
    </g>
    <g>
      <path
        d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"
        class="icon-path"
        class:light={theme === BUTTON_THEMES.light}
        class:dark={theme === BUTTON_THEMES.dark}
      />
    </g>
    <title>Download as image (CTRL+S)</title>
  </svg>
</ControlButton>

<style lang="scss">
  svg {
    width: 100%;
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
