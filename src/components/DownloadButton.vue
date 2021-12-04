<script lang="ts">
import { defineComponent } from "vue";
import {
  getPlaybackState,
  PLAYBACK_STATES,
  addPlaybackStateChangeListener,
} from "../playbackState";
import { downloadCanvasImage } from "../render";
import ControlButton from "./ControlButton.vue";

const isPlaybackStateEmpty = (playbackState: PLAYBACK_STATES) =>
  playbackState === PLAYBACK_STATES.EMPTY;

export default defineComponent({
  components: { ControlButton },
  created() {
    addPlaybackStateChangeListener((playbackState) => {
      this.isHidden = isPlaybackStateEmpty(playbackState);
    });
  },
  data() {
    return {
      isHidden: isPlaybackStateEmpty(getPlaybackState()),
    };
  },
  methods: {
    downloadCanvasImage,
  },
});
</script>

<template>
  <control-button
    class="download-button"
    :is-hidden="isHidden"
    @click="downloadCanvasImage"
  >
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
        />
      </g>
      <title>Download as image (CTRL+S)</title>
    </svg>
  </control-button>
</template>

<style lang="scss" scoped>
.download-button {
  svg {
    width: 32px;
    height: auto;

    .icon-path {
      fill: black;
    }
  }
}
</style>