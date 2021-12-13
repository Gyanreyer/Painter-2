<script lang="ts">
  import startDrawing, { getRandomColor } from "../drawPixels";

  const BASE_MOVEMENT_SPEED = 3;
  const SLOWED_MOVEMENT_SPEED = 1;
  let cursorMovementSpeed = BASE_MOVEMENT_SPEED;
  let cursorPositionX = window.innerWidth / 2;
  let cursorPositionY = window.innerHeight / 2;
  let paintColor = getRandomColor();
  let isDrawing = false;

  const pixiRootElement = document.getElementById("pixi-root");

  let isFocused = document.activeElement === pixiRootElement;
  let isUsingKeyboardNavigation = false;

  let isEnabled = false;
  $: isEnabled = isFocused && isUsingKeyboardNavigation;

  pixiRootElement.addEventListener("focus", () => {
    isFocused = true;
  });
  pixiRootElement.addEventListener("blur", () => {
    isFocused = false;
  });

  window.addEventListener("pointerdown", () => {
    // If a mouse or touch event occurs, the user isn't using keyboard navigation
    isUsingKeyboardNavigation = false;
  });

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    const keyCode = event.key || event.code;

    if (!isEnabled) {
      if (keyCode === "Tab") {
        // If the user presses tab, indicate that they're using keyboard navigation
        isUsingKeyboardNavigation = true;
      }
      return;
    }

    let onKeyUpCleanup = null;

    switch (keyCode) {
      case "Shift":
        // While the user is holding "Shift" key, slow down how quickly the cursor moves each frame
        cursorMovementSpeed = SLOWED_MOVEMENT_SPEED;

        onKeyUpCleanup = () => {
          cursorMovementSpeed = BASE_MOVEMENT_SPEED;
        };

        break;
      case "Enter":
      case "Space":
      case " ":
        const onDragDrawing = startDrawing(
          cursorPositionX,
          cursorPositionY,
          paintColor
        );

        if (onDragDrawing) {
          isDrawing = true;

          let animationFrameId;

          let previousCursorX;
          let previousCursorY;

          (function paintAtCursorPosition() {
            if (
              previousCursorX !== cursorPositionX ||
              previousCursorY !== cursorPositionY
            ) {
              onDragDrawing(cursorPositionX, cursorPositionY);

              previousCursorX = cursorPositionX;
              previousCursorY = cursorPositionY;
            }

            animationFrameId = requestAnimationFrame(paintAtCursorPosition);
          })();

          onKeyUpCleanup = () => {
            cancelAnimationFrame(animationFrameId);
            paintColor = getRandomColor();
            isDrawing = false;
          };
        }
        break;
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        let animationFrameId;

        (function moveCursor() {
          switch (keyCode) {
            case "ArrowUp":
              cursorPositionY = Math.max(
                cursorPositionY - cursorMovementSpeed,
                0
              );
              break;
            case "ArrowDown":
              cursorPositionY = Math.min(
                cursorPositionY + cursorMovementSpeed,
                window.innerHeight - 1
              );
              break;
            case "ArrowLeft":
              cursorPositionX = Math.max(
                cursorPositionX - cursorMovementSpeed,
                0
              );
              break;
            case "ArrowRight":
              cursorPositionX = Math.min(
                cursorPositionX + cursorMovementSpeed,
                window.innerWidth - 1
              );
              break;
          }
          animationFrameId = requestAnimationFrame(moveCursor);
        })();

        onKeyUpCleanup = () => {
          cancelAnimationFrame(animationFrameId);
        };
        break;

      default:
    }

    if (onKeyUpCleanup) {
      window.addEventListener("keyup", function onKeyUp(event) {
        if ((event.key || event.code) === keyCode) {
          onKeyUpCleanup();

          window.removeEventListener("keyup", onKeyUp);
        }
      });
    }
  });
</script>

<div
  class="keyboard-cursor"
  class:enabled={isEnabled}
  style="
    transform: translate(
      calc({cursorPositionX}px - 50%),
      calc({cursorPositionY}px - 50%)
      );
    background-color: rgba(
      {paintColor[0]},
      {paintColor[1]},
      {paintColor[2]},
      {isDrawing ? 0 : 1});
  "
/>

<style lang="scss">
  .keyboard-cursor {
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;

    border: 2px solid rgba(0, 0, 0, 0.5);
    border-radius: 50%;

    opacity: 0;
    transition: opacity 0.2s, background-color 0.2s;

    &.enabled {
      opacity: 1;
    }
  }
</style>
