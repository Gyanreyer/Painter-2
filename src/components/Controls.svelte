<script lang="ts">
  import { onMount } from "svelte";
  import tinycolor from "tinycolor2";

  import PlayPauseButton from "./PlayPauseButton.svelte";
  import PlaybackDirectionButton from "./PlaybackDirectionButton.svelte";
  import DownloadButton from "./DownloadButton.svelte";
  import {
    addPlaybackStateChangeListener,
    PLAYBACK_STATES,
  } from "../playbackState";
  import { getDisplayPixelsArray } from "../render";
  import { BUTTON_THEMES } from "./types";

  let buttonTheme = BUTTON_THEMES.dark;
  let controlsElement;

  function updateAverageColorWithNewColor(
    currentAverageColor: Uint8Array,
    newColorCount: number,
    red: number,
    green: number,
    blue: number
  ) {
    currentAverageColor[0] += (red - currentAverageColor[0]) / newColorCount;
    currentAverageColor[1] += (green - currentAverageColor[1]) / newColorCount;
    currentAverageColor[2] += (blue - currentAverageColor[2]) / newColorCount;
  }

  onMount(() => {
    const PIXEL_SAMPLE_WIDTH = 8;

    let sampleIntervalId;

    addPlaybackStateChangeListener((playbackState) => {
      clearInterval(sampleIntervalId);

      function samplePixelColorsAndUpdateButtonTheme() {
        let controlsClientRect = controlsElement.getBoundingClientRect();

        const sampleX =
          controlsClientRect.x +
          controlsClientRect.width / 2 -
          PIXEL_SAMPLE_WIDTH / 2;

        const sampleY = controlsClientRect.top + controlsClientRect.height / 2;

        const extractedSamplePixels = getDisplayPixelsArray(
          sampleX,
          sampleY,
          PIXEL_SAMPLE_WIDTH,
          1
        );

        const sampleColorSum = [0, 0, 0];
        let filledPixelCount = 0;

        for (let i = 0; i < PIXEL_SAMPLE_WIDTH; i += 1) {
          const colorStartIndex = i * 4;

          const alpha = extractedSamplePixels[colorStartIndex + 3];

          if (alpha === 0) {
            sampleColorSum[0] += 255;
            sampleColorSum[1] += 255;
            sampleColorSum[2] += 255;
          } else {
            sampleColorSum[0] += extractedSamplePixels[colorStartIndex];
            sampleColorSum[1] += extractedSamplePixels[colorStartIndex + 1];
            sampleColorSum[2] += extractedSamplePixels[colorStartIndex + 2];

            filledPixelCount += 1;
          }
        }

        const isColorDark = tinycolor({
          r: sampleColorSum[0] / PIXEL_SAMPLE_WIDTH,
          g: sampleColorSum[1] / PIXEL_SAMPLE_WIDTH,
          b: sampleColorSum[2] / PIXEL_SAMPLE_WIDTH,
        }).isDark();

        buttonTheme = isColorDark ? BUTTON_THEMES.light : BUTTON_THEMES.dark;

        // If all of the sample pixels have been filled with color it's safe to assume they're not going to change any further,
        // so cancel the interval loop
        if (
          (playbackState === PLAYBACK_STATES.FORWARD &&
            filledPixelCount === PIXEL_SAMPLE_WIDTH) ||
          (playbackState === PLAYBACK_STATES.REVERSE && filledPixelCount === 0)
        ) {
          clearInterval(sampleIntervalId);
        }
      }

      samplePixelColorsAndUpdateButtonTheme();

      if (
        playbackState === PLAYBACK_STATES.FORWARD ||
        playbackState === PLAYBACK_STATES.REVERSE
      ) {
        sampleIntervalId = setInterval(
          samplePixelColorsAndUpdateButtonTheme,
          500
        );
      }
    });
  });

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

<div class="controls" bind:this={controlsElement}>
  <PlayPauseButton theme={buttonTheme} />
  <PlaybackDirectionButton theme={buttonTheme} />
  <DownloadButton theme={buttonTheme} />
</div>

<style lang="scss">
  .controls {
    position: absolute;
    bottom: 12px;
    left: 12px;

    --controls-transition-duration: 0.1s;

    opacity: 0;
    transform: translateY(10%);
    transition: opacity var(--controls-transition-duration),
      transform var(--controls-transition-duration);

    :global(html[data-controlsactive="true"]) &,
    &:focus-within {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
