<script lang="ts">
  import {
    PLAYBACK_DIRECTIONS,
    getPlaybackDirectionFromPlaybackState,
    addPlaybackStateChangeListener,
    togglePlaybackDirection,
  } from "../playbackState";
  import ControlButton from "./ControlButton.svelte";

  let playbackDirection;
  let isHidden;
  let isReversed;

  addPlaybackStateChangeListener((playbackState) => {
    playbackDirection = getPlaybackDirectionFromPlaybackState(playbackState);
    isHidden = playbackDirection === PLAYBACK_DIRECTIONS.NONE;
    isReversed = playbackDirection === PLAYBACK_DIRECTIONS.REVERSE;
  }, true);
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
      <g class="icon-polygons">
        <polygon points="15.5,5 11,5 16,12 11,19 15.5,19 20.5,12" />
        <polygon points="8.5,5 4,5 9,12 4,19 8.5,19 13.5,12" />
      </g>
    </g>
    <title>Change direction (D)</title>
  </svg>
</ControlButton>

<style lang="scss">
  svg {
    width: 32px;
    height: auto;

    transition: transform 0.2s, fill 0.2s;

    &.reverse {
      transform: rotateY(180deg);
    }
    .icon-polygons {
      fill: black;
    }
  }
</style>
