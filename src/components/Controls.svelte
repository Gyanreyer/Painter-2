<script lang="ts">
  import PlayPauseButton from "./PlayPauseButton.svelte";
  import PlaybackDirectionButton from "./PlaybackDirectionButton.svelte";
  import DownloadButton from "./DownloadButton.svelte";
  import { addPlaybackStateChangeListener } from "../playbackState";

  const MOUSE_ACTIVITY_TIMEOUT_DURATION = 2000;

  let mouseActivityTimeoutId;

  const onControlsActivity = () => {
    clearTimeout(mouseActivityTimeoutId);

    document.documentElement.dataset.controlsactive = "true";

    mouseActivityTimeoutId = setTimeout(() => {
      document.documentElement.dataset.controlsactive = "false";
    }, MOUSE_ACTIVITY_TIMEOUT_DURATION);
  };

  window.addEventListener("mousemove", onControlsActivity);

  addPlaybackStateChangeListener(onControlsActivity);
</script>

<div class="controls">
  <PlayPauseButton />
  <PlaybackDirectionButton />
  <DownloadButton />
</div>

<style lang="scss">
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

    :global(html[data-controlsactive="true"]) & {
      --controls-visibility-transition-delay: 0s;

      visibility: visible;
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
