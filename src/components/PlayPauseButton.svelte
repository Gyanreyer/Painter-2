<script lang="ts">
  import {
    PLAYBACK_STATES,
    addPlaybackStateChangeListener,
    togglePlayPausePlaybackState,
  } from "../playbackState";
  import ControlButton from "./ControlButton.svelte";

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
</script>

<ControlButton onClick={togglePlayPausePlaybackState} {isHidden}>
  {#if isPlaying}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" class="icon-path" />
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
      <path d="M8 5v14l11-7z" class="icon-path" />
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
      fill: black;
    }
  }
</style>
