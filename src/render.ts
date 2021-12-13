import * as PIXI from "pixi.js";

import pixiApp from "./pixiApp";
import paintShader from "./shaders/paintShader";
import dissolveShader from "./shaders/dissolveShader";
import {
  addPlaybackStateChangeListener,
  getPlaybackState,
  PLAYBACK_STATES,
} from "./playbackState";

const textures = [
  PIXI.RenderTexture.create({
    width: window.innerWidth,
    height: window.innerHeight,
  }),
  PIXI.RenderTexture.create({
    width: window.innerWidth,
    height: window.innerHeight,
  }),
];

let displayTextureIndex = 0;

// Returns the texture that isn't currently set on the display sprite
// and should therefore be rendered to
function getRenderTargetTexture() {
  return textures[1 - displayTextureIndex];
}

function getDisplayTexture() {
  return textures[displayTextureIndex];
}

function swapDisplayTexture() {
  displayTextureIndex = 1 - displayTextureIndex;
  displaySprite.texture = getDisplayTexture();
}

const displaySprite = new PIXI.Sprite(getDisplayTexture());
displaySprite.zIndex = 1;
displaySprite.filters = [paintShader];

pixiApp.stage.addChild(displaySprite);

addPlaybackStateChangeListener((newPlaybackState) => {
  // Update the shader to apply to the display sprite
  // when the playback state changes
  if (newPlaybackState === PLAYBACK_STATES.FORWARD) {
    displaySprite.filters = [paintShader];
  } else if (newPlaybackState === PLAYBACK_STATES.REVERSE) {
    displaySprite.filters = [dissolveShader];
  }
});

export default function render() {
  pixiApp.renderer.render(pixiApp.stage, {
    renderTexture: getRenderTargetTexture(),
  });

  swapDisplayTexture();

  // Update the random seed for our shaders for next frame
  const newRandSeed = Math.random();
  paintShader.uniforms.randSeed = newRandSeed;
  dissolveShader.uniforms.randSeed = newRandSeed;
}

let throttledResizeTexturesAnimationFrameId;

export function resizeRenderer(newWidth, newHeight) {
  // Resize the renderer immediately
  pixiApp.renderer.resize(newWidth, newHeight);

  // Throttle resizing the textures by cancelling any previous pending resize attempts so we can
  // reduce performance issues/flashes
  cancelAnimationFrame(throttledResizeTexturesAnimationFrameId);

  throttledResizeTexturesAnimationFrameId = requestAnimationFrame(() => {
    // Resize the render target texture and render so we can transfer the display texture's
    // current pixels without stretching anything
    getRenderTargetTexture().resize(newWidth, newHeight);
    render();

    // Resize the other texture now that we're done with it
    // (it will now be the "render target" since render()
    // swaps the display and render textures when it's done)
    getRenderTargetTexture().resize(newWidth, newHeight);

    // Update the shader uniforms' pixel size
    const pixelWidth = 1 / newWidth;
    const pixelHeight = 1 / newHeight;

    paintShader.uniforms.pixelWidth = pixelWidth;
    paintShader.uniforms.pixelHeight = pixelHeight;
    dissolveShader.uniforms.pixelWidth = pixelWidth;
    dissolveShader.uniforms.pixelHeight = pixelHeight;
  });
}

/**
 * Extracts the canvas' pixel color data as an array of 8-bit ints,
 * where each element in the array is the value of an R, G, B, or A
 * channel for a pixel's color
 *
 * @param {number}  [x=0]   The x position of the left edge of the rectangle of pixels we want to extract from the canvas
 * @param {number}  [y=0]   The y position of the top edge of the rectangle of pixels we want to extract from the canvas
 * @param {number}  [width]   The width of the rectangle of pixels we want to extract from the canvas; if not provided, will default to the full width of the canvas
 * @param {number}  [height]  The height of the rectangle of pixels we want to extract from the canvas; if not provided, will default to the full height of the canvas
 */
export function getDisplayPixelsArray(
  x = 0,
  y = 0,
  width = pixiApp.renderer.width,
  height = pixiApp.renderer.height
): Uint8ClampedArray {
  const { gl } = pixiApp.renderer as PIXI.Renderer;

  const pixels = new Uint8ClampedArray(4 * width * height);
  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return pixels;
}

/**
 * Downloads the canvas as an image file
 */
export function downloadCanvasImage() {
  const currentPlaybackState = getPlaybackState();

  // If the canvas is empty, don't do anything because there's no point in saving a blank image
  if (currentPlaybackState === PLAYBACK_STATES.EMPTY) return;

  // Make a temporary download link element and click it to download the image file
  const link = document.createElement("a");
  link.download = `Painter - ${new Date().toUTCString()}`;
  link.href = pixiApp.view.toDataURL("image/jpeg", 0.9);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
