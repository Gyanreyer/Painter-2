<script lang="ts">
  export let isHidden = false;
  export let onClick = () => {};
</script>

<button on:click={onClick} class:hidden={isHidden} disabled={isHidden}>
  <slot />
</button>

<style lang="scss">
  button {
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;

    width: 32px;

    @media (pointer: coarse) {
      width: 25%;
    }

    opacity: 1;
    transform: translateY(0);
    visibility: visible;

    --control-button-transition-duration: 0.1s;
    /* Max width transition should be twice as long to help reduce how much the buttons
        overlap each other as they're fading out */
    --max-width-transition-duration: 0.2s;

    /* Base transition delay that should be applied before transitioning the button in/out;
        we'll use this to stagger buttons as they transition in/out */
    --base-control-button-transition-delay: 0s;
    /* Transition delay to apply to the visibiblity property; when switching from hidden -> visible, we
        want this to be 0s so the button immediately becomes visible. When switching from visible -> hidden,
        we want this to match the button's opacity transition duration to ensure we don't fully hide the
        button until it's done animating out */
    --control-button-visibility-transition-delay: 0s;

    transition: max-width var(--max-width-transition-duration)
        var(--base-control-button-transition-delay),
      opacity var(--control-button-transition-duration)
        var(--base-control-button-transition-delay),
      transform var(--control-button-transition-duration)
        var(--base-control-button-transition-delay),
      visibility 0s
        calc(
          var(--base-control-button-transition-delay) +
            var(--control-button-visibility-transition-delay)
        );

    @for $i from 1 through 3 {
      /* Delay control buttons so they are staggered when transitioning relative to other
          elements in the same hidden/visible state */
      &:not(.hidden):nth-of-type(#{$i}),
      &.hidden:nth-of-type(#{$i}) {
        --base-control-button-transition-delay: calc(
          (#{$i} - 1) * var(--control-button-transition-duration) / 2
        );
      }
    }

    &.hidden {
      --control-button-visibility-transition-delay: var(
        --control-button-transition-duration
      );

      max-width: 0;
      opacity: 0;
      transform: translateY(50%);
      visibility: hidden;

      /* Disable pointer events on button when hidden */
      pointer-events: none;
    }
  }
</style>
