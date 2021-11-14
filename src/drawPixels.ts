import * as PIXI from "pixi.js";

import pixiApp from "./pixiApp";
import render from "./render";
import paintShader from "./shaders/paintShader";

const userInputPixelDrawerSprite = new PIXI.Sprite();
userInputPixelDrawerSprite.visible = false;
userInputPixelDrawerSprite.zIndex = 0;

pixiApp.stage.addChild(userInputPixelDrawerSprite);

type pixelData = {
  x: number;
  y: number;
  color: Uint8Array;
};

export default function drawPixels(pixelQueue: pixelData[]) {
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
