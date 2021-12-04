<script lang="ts">
import { defineComponent } from "vue";
import {
  getPlaybackState,
  PLAYBACK_STATES,
  addPlaybackStateChangeListener,
  togglePlayPausePlaybackState,
} from "../playbackState";
import ControlButton from "./ControlButton.vue";

const isPlaybackStatePlaying = (playbackState) =>
  playbackState === PLAYBACK_STATES.FORWARD ||
  playbackState === PLAYBACK_STATES.REVERSE;

const isPlaybackStateComplete = (playbackState: PLAYBACK_STATES) =>
  playbackState === PLAYBACK_STATES.EMPTY ||
  playbackState === PLAYBACK_STATES.DONE;

export default defineComponent({
  components: { ControlButton },
  created() {
    addPlaybackStateChangeListener((playbackState) => {
      this.isPlaying = isPlaybackStatePlaying(playbackState);
      this.isComplete = isPlaybackStateComplete(playbackState);
    });
  },
  data() {
    const initialPlaybackState = getPlaybackState();

    return {
      isPlaying: isPlaybackStatePlaying(initialPlaybackState),
      isComplete: isPlaybackStateComplete(initialPlaybackState),
    };
  },
  methods: {
    togglePlayPause: togglePlayPausePlaybackState,
  },
});
</script>

<template>
  <control-button
    class="play-pause-button"
    @click="togglePlayPause"
    :is-hidden="isComplete"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      v-if="isPlaying"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" class="icon-path" />
      <path d="M0 0h24v24H0z" fill="none" />
      <title>Pause (P)</title>
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      v-else
    >
      <path d="M8 5v14l11-7z" class="icon-path" />
      <path d="M0 0h24v24H0z" fill="none" />
      <title>Play (P)</title>
    </svg>
  </control-button>
</template>

<style lang="scss" scoped>
.play-pause-button {
  svg {
    width: 32px;
    height: auto;

    .icon-path {
      stroke: white;
    }
  }
}
</style>