import * as PIXI from "pixi.js";

import {
  updatePlaybackState,
  getPlaybackState,
  PLAYBACK_STATES,
} from "./playbackState";
import { clamp } from "./utils";
import pixiApp from "./pixiApp";
import render from "./render";
import paintShader from "./shaders/paintShader";

const userInputPixelDrawerSprite = new PIXI.Sprite();
userInputPixelDrawerSprite.visible = false;
userInputPixelDrawerSprite.zIndex = 0;

pixiApp.stage.addChild(userInputPixelDrawerSprite);

/**
 * Returns a random number value from 0-255 for a color channel. Will either return
 * a new random number or blend from an existing value.
 *
 * @param {number}  [blendChannelValue]   A color channel value which we should randomly blend from. If no value is provided,
 *                                          we'll return a totally fresh random number between 0-255.
 * @param {number}  [blendVariability=4]  The size of the range of how far the new blended value can deviate from the original.
 *                                          For example, for a value of 100, a blend variability of 4 means our new blended value
 *                                          will be somewhere between 98 and 102
 * @returns
 */
const getColorChannelValue = (
  blendChannelValue: number | null = null,
  blendVariability: number = 4
): number =>
  Math.round(
    blendChannelValue
      ? clamp(
          blendChannelValue + (Math.random() - 0.5) * blendVariability,
          0,
          255
        )
      : Math.random() * 255
  );

/**
 * Makes a new fresh color array with random RGB channel values
 */
export const getRandomColor = () =>
  new Uint8Array([
    getColorChannelValue(),
    getColorChannelValue(),
    getColorChannelValue(),
  ]);

type pixelData = {
  x: number;
  y: number;
  color: Uint8Array;
};

function drawPixels(pixelQueue: pixelData[]) {
  const width = pixiApp.renderer.width;
  const height = pixiApp.renderer.height;

  // Make an empty pixel array for the texture buffer
  const textureBuffer = new Uint8Array(width * height * 4);

  // Apply all pixels from queue to the texture buffer
  for (let i = 0, numPixels = pixelQueue.length; i < numPixels; ++i) {
    const currentPixel = pixelQueue[i];
    const arrayPos =
      (Math.round(currentPixel.x) + Math.round(currentPixel.y) * width) * 4;

    if (textureBuffer[arrayPos + 3] > 0) continue;

    // Set R, G, and B channels to random numbers
    for (let i = 0; i < 3; ++i) {
      textureBuffer[arrayPos + i] = currentPixel.color[i];
    }
    // Set the alpha channel to max of 255
    textureBuffer[arrayPos + 3] = 255;
  }

  // Make the user input sprite visible and set its texture to use the texture buffer we created
  userInputPixelDrawerSprite.visible = true;
  userInputPixelDrawerSprite.texture = PIXI.Texture.fromBuffer(
    textureBuffer,
    width,
    height
  );

  // Force a re-render of the scene to apply the user input texture to the display texture
  // Temporarily disable the paint shader during this process so that we don't progress the simulation
  // by additional steps
  paintShader.enabled = false;
  render();
  paintShader.enabled = true;

  // Destroy the user input sprite's texture and hide it again
  userInputPixelDrawerSprite.texture.destroy();
  userInputPixelDrawerSprite.visible = false;
}

/**
 * @param {number}      initialXPosition
 * @param {number}      initialYPosition
 * @param {Uint8Array}  [initialPointerColor]   Optional initial color to draw onto the canvas at this pointer's position; if not provided, we'll generate one
 */
export default function startDrawing(
  initialXPosition: number,
  initialYPosition: number,
  initialPointerColor: Uint8Array = null
): null | ((xPosition: number, yPosition: number) => void) {
  const currentPlaybackState = getPlaybackState();

  switch (currentPlaybackState) {
    case PLAYBACK_STATES.REVERSE:
    case PLAYBACK_STATES.REVERSE_PAUSED:
    case PLAYBACK_STATES.DONE:
      // If the current playback state is either done or going in reverse,
      // return early to ignore any attempts to paint
      return null;
    case PLAYBACK_STATES.EMPTY:
      updatePlaybackState(PLAYBACK_STATES.FORWARD);
      break;
    default:
    // Don't do anything if the playback state is already forward or paused
  }

  let previousPointerX = clamp(initialXPosition, 0, window.innerWidth - 1);
  let previousPointerY = clamp(initialYPosition, 0, window.innerHeight - 1);

  const pointerColor = initialPointerColor || getRandomColor();

  drawPixels([
    {
      x: previousPointerX,
      y: previousPointerY,
      color: pointerColor,
    },
  ]);

  return function onDragDrawing(newXPosition, newYPosition) {
    // Clamp position to ensure it's on the screen
    const sanitizedNewXPosition = clamp(newXPosition, 0, window.innerWidth - 1);
    const sanitizedNewYPosition = clamp(
      newYPosition,
      0,
      window.innerHeight - 1
    );

    const pointerXChange = sanitizedNewXPosition - previousPointerX;
    const pointerYChange = sanitizedNewYPosition - previousPointerY;

    const diffX = Math.abs(pointerXChange);
    const diffY = Math.abs(pointerYChange);

    const slopeX = Math.sign(pointerXChange);
    const slopeY = Math.sign(pointerYChange);

    let err = diffX - diffY;

    let x = previousPointerX;
    let y = previousPointerY;

    const pixelQueue = [];

    do {
      pointerColor[0] = getColorChannelValue(pointerColor[0]);
      pointerColor[1] = getColorChannelValue(pointerColor[1]);
      pointerColor[2] = getColorChannelValue(pointerColor[2]);

      const err2 = err << 1;
      if (err2 > -diffY) {
        err -= diffY;
        x += slopeX;
      }
      if (err2 < diffX) {
        err += diffX;
        y += slopeY;
      }

      pixelQueue.push({
        x,
        y,
        color: pointerColor,
      });
    } while (x !== sanitizedNewXPosition || y !== sanitizedNewYPosition);

    drawPixels(pixelQueue);

    previousPointerX = sanitizedNewXPosition;
    previousPointerY = sanitizedNewYPosition;
  };
}
