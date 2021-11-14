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

window.addEventListener(
  "resize",
  () => {
    // Resize the textures when the window resizes
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    textures[0].resize(newWidth, newHeight);
    textures[1].resize(newWidth, newHeight);
  },
  { passive: true }
);

let currentTextureIndex = 0;

const getCurrentTexture = () => textures[currentTextureIndex];

function swapCurrentTexture() {
  currentTextureIndex = 1 - currentTextureIndex;

  return getCurrentTexture();
}

const displaySprite = new PIXI.Sprite(getCurrentTexture());
displaySprite.zIndex = 1;
displaySprite.filters = [paintShader];

pixiApp.stage.addChild(displaySprite);

export default function render() {
  const currentTexture = swapCurrentTexture();

  pixiApp.renderer.render(pixiApp.stage, {
    renderTexture: currentTexture,
  });

  displaySprite.texture = currentTexture;

  // Update the random seed for our shaders for next frame
  paintShader.uniforms.randSeed = Math.random();
}
