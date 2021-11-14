import * as PIXI from "pixi.js";

PIXI.settings.ROUND_PIXELS = true;
// NOTE: this setting is required in order to prevent potential
// weird rendering behavior in certain browsers
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const pixiApp = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundAlpha: 0,
});
// Enable setting z-indices on sprites in our stage
pixiApp.stage.sortableChildren = true;

document.body.appendChild(pixiApp.view);

window.addEventListener(
  "resize",
  () => {
    pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
  },
  { passive: true }
);

export default pixiApp;
