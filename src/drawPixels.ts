import * as PIXI from "pixi.js";

import { getColorChannelValue } from "./utils/colors";
import pixiApp from "./pixiApp";
import render from "./render";
import paintShader from "./shaders/paintShader";

const userInputPixelDrawerSprite = new PIXI.Sprite();
userInputPixelDrawerSprite.visible = false;
userInputPixelDrawerSprite.zIndex = 0;

pixiApp.stage.addChild(userInputPixelDrawerSprite);

let currentColor: Uint8Array;

export const getNewColor = (): Uint8Array => {
  currentColor = new Uint8Array([
    getColorChannelValue(),
    getColorChannelValue(),
    getColorChannelValue(),
  ]);

  return currentColor;
};

export const getNextBlendedColor = (): Uint8Array => {
  currentColor[0] = getColorChannelValue(currentColor[0]);
  currentColor[1] = getColorChannelValue(currentColor[1]);
  currentColor[2] = getColorChannelValue(currentColor[2]);

  return currentColor;
};

type pixelData = {
  x: number;
  y: number;
  color: Uint8Array;
};

window.addEventListener("pointerdown", (event) => {
  let previousPointerX = Math.round(event.x);
  let previousPointerY = Math.round(event.y);

  handlePixelQueue([
    {
      x: previousPointerX,
      y: previousPointerY,
      color: getNewColor(),
    },
  ]);

  function onPointerMove(event) {
    const newPointerX = Math.round(event.x);
    const newPointerY = Math.round(event.y);

    const pointerXChange = newPointerX - previousPointerX;
    const pointerYChange = newPointerY - previousPointerY;

    const diffX = Math.abs(pointerXChange);
    const diffY = Math.abs(pointerYChange);

    const slopeX = Math.sign(pointerXChange);
    const slopeY = Math.sign(pointerYChange);

    let err = diffX - diffY;

    let x = previousPointerX;
    let y = previousPointerY;

    const pixelQueue = [];

    do {
      const err2 = err << 1;
      if (err2 > -diffY) {
        err -= diffY;
        x += slopeX;
      }
      if (err2 < diffX) {
        err += diffX;
        y += slopeY;
      }

      // Only add pixels that are on screen
      if (x >= 0 && x < window.innerWidth && y >= 0 && y < window.innerHeight) {
        pixelQueue.push({
          x,
          y,
          color: getNextBlendedColor(),
        });
      }
    } while (x !== newPointerX || y !== newPointerY);

    handlePixelQueue(pixelQueue);

    previousPointerX = newPointerX;
    previousPointerY = newPointerY;
  }

  window.addEventListener("pointermove", onPointerMove);

  function onPointerUp() {
    // Disable event listeners when the user lifts their mouse
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
  window.addEventListener("pointerup", onPointerUp);
});

function handlePixelQueue(pixelQueue: pixelData[]) {
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
