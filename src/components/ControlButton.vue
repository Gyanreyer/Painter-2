<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isHidden: { type: Boolean, default: false },
  },
});
</script>

<template>
  <button
    class="control-button"
    v-bind:class="{
      hidden: isHidden,
    }"
    v-bind:disabled="isHidden"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.control-button {
  background: none;
  padding: 0;
  border: none;
  cursor: pointer;
  overflow: hidden;
  max-width: 32px;

  --control-button-transition-duration: 0.1s;
  --control-button-visibility-transition-delay: 0s;

  transition: opacity var(--control-button-transition-duration),
    max-width var(--control-button-transition-duration),
    visibility 0s var(--control-button-visibility-transition-delay);

  &.hidden {
    --control-button-visibility-transition-delay: var(
      --control-button-transition-duration
    );

    opacity: 0;
    max-width: 0;
    visibility: hidden;

    /* Disable pointer events on button when hidden */
    pointer-events: none;
  }
}
</style>