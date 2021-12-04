<script lang="ts">
import { defineComponent } from "vue";
import {
  getPlaybackState,
  PLAYBACK_STATES,
  addPlaybackStateChangeListener,
  togglePlaybackDirection,
} from "../playbackState";
import ControlButton from "./ControlButton.vue";

enum PLAYBACK_DIRECTIONS {
  FORWARD = "FORWARD",
  REVERSE = "REVERSE",
  NONE = "NONE",
}

const getPlaybackDirectionFromPlaybackState = (
  playbackState: PLAYBACK_STATES
) => {
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
};

export default defineComponent({
  components: { ControlButton },
  created() {
    addPlaybackStateChangeListener((playbackState) => {
      this.playbackDirection =
        getPlaybackDirectionFromPlaybackState(playbackState);
    });
  },
  data() {
    return {
      playbackDirection: getPlaybackDirectionFromPlaybackState(
        getPlaybackState()
      ),
    };
  },
  methods: {
    togglePlaybackDirection,
  },
});
</script>


<template>
  <control-button
    class="playback-direction-button"
    :is-hidden="playbackDirection === 'NONE'"
    @click="togglePlaybackDirection"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      v-bind:class="{
        reverse: playbackDirection === 'REVERSE',
      }"
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
  </control-button>
</template>

<style lang="scss" scoped>
.playback-direction-button {
  svg {
    width: 32px;
    height: auto;

    .icon-polygons {
      fill: black;
    }

    transition: transform 0.2s, fill 0.2s;

    &.reverse {
      transform: rotateY(180deg);
    }
  }
}
</style>