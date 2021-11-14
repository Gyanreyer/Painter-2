import * as PIXI from "pixi.js";

import pixiApp from "./pixiApp";
import paintShader from "./shaders/paintShader";

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

let textureResizeAnimationFrameId;

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
  displaySprite.texture = textures[displayTextureIndex];
}

window.addEventListener(
  "resize",
  () => {
    cancelAnimationFrame(textureResizeAnimationFrameId);

    textureResizeAnimationFrameId = requestAnimationFrame(() => {
      // Resize the textures when the window resizes
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      getRenderTargetTexture().resize(newWidth, newHeight);
      render();
      getDisplayTexture().resize(newWidth, newHeight);
    });
  },
  { passive: true }
);

const displaySprite = new PIXI.Sprite(textures[displayTextureIndex]);
displaySprite.zIndex = 1;
displaySprite.filters = [paintShader];

pixiApp.stage.addChild(displaySprite);

export default function render() {
  pixiApp.renderer.render(pixiApp.stage, {
    renderTexture: getRenderTargetTexture(),
  });

  swapDisplayTexture();

  // Update the random seed for our shaders for next frame
  paintShader.uniforms.randSeed = Math.random();
}
