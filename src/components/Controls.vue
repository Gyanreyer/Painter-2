<script lang="ts">
import PlayPauseButton from "./PlayPauseButton.vue";
import PlaybackDirectionButton from "./PlaybackDirectionButton.vue";
import DownloadButton from "./DownloadButton.vue";
import { addPlaybackStateChangeListener } from "../playbackState";

const MOUSE_ACTIVITY_TIMEOUT_DURATION = 2000;

export default {
  created() {
    let mouseActivityTimeoutId;

    const onControlsActivity = () => {
      clearTimeout(mouseActivityTimeoutId);

      document.documentElement.dataset.ismouseactive = "true";

      mouseActivityTimeoutId = setTimeout(() => {
        document.documentElement.dataset.ismouseactive = "false";
      }, MOUSE_ACTIVITY_TIMEOUT_DURATION);
    };

    window.addEventListener("mousemove", onControlsActivity);

    addPlaybackStateChangeListener(onControlsActivity);
  },
  components: {
    PlayPauseButton,
    PlaybackDirectionButton,
    DownloadButton,
  },
};
</script>

<template>
  <div class="controls">
    <play-pause-button></play-pause-button>
    <playback-direction-button></playback-direction-button>
    <download-button></download-button>
  </div>
</template>

<style lang="scss" scoped>
.controls {
  position: absolute;
  bottom: 12px;
  left: 12px;

  --controls-transition-duration: 0.1s;
  --controls-visibility-transition-delay: var(--controls-transition-duration);

  visibility: hidden;
  opacity: 0;
  transform: translateY(10%);
  transition: opacity var(--controls-transition-duration),
    transform var(--controls-transition-duration),
    visibility 0s var(--controls-visibility-transition-delay);

  html[data-ismouseactive="true"] & {
    --controls-visibility-transition-delay: 0s;

    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
}
</style>