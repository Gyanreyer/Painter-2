// Import pixi stuff
import * as PIXI from "pixi.js";
// Import our fragment shader file
import fragmentShader from "../shaders/frag.glsl";

import CompletionCheckWorker from "../workers/completionChecker.worker.js";

// Default uniform values to pass to our shader
const defaultShaderUniformValues = {
  randSeed: Math.random(),
  pixelWidth: 1 / window.innerWidth,
  pixelHeight: 1 / window.innerHeight,
  colorVariability: 0.04,
  simulationSpeed: 1.0
};

export default class RenderManager {
  constructor() {
    // Initialize our PixiJS app
    this.pixiApp = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true
    });

    document.body.appendChild(this.pixiApp.view);

    // Load our fragment shader with default uniform values
    this.shader = new PIXI.Filter(
      null,
      fragmentShader,
      defaultShaderUniformValues
    );

    this.pixelQueue = [];
    this.textures = [];
    this.currentRenderTargetIndex = 0;
    this.displaySprite = null;

    // Keeps track of whether the simulation has been started
    this.hasStarted = false;
    // Keeps track of whether the simulation is currently running
    this.isRunning = false;
    // Keeps track of currently pending requested animation frame so we can cancel it
    this.updateFrameRequest = null;

    // Set up a web worker for checking if the painting is complete
    this.completionCheckWorker = new CompletionCheckWorker();

    this.completionCheckWorker.onmessage = event => {
      if (event.data) this.pause();

      setTimeout(() => {
        if (this.isRunning)
          this.completionCheckWorker.postMessage(this.getDisplayPixels());
      }, 1000);
    };

    // Automatically keep the canvas resized to fill the width of the window
    window.addEventListener(
      "resize",
      () => {
        this.pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
      },
      { passive: true }
    );
  }

  // Gets pixel data for the display sprite as a Uint8Array
  getDisplayPixels = () =>
    this.pixiApp.renderer.extract.pixels(this.displaySprite);

  // Renders to canvas each frame
  render = () => {
    // Render the stage
    this.pixiApp.renderer.render(
      this.pixiApp.stage,
      this.textures[this.currentRenderTargetIndex]
    );
  };

  // Updates render stuff once every frame
  update = timestamp => {
    this.updateFrameRequest = requestAnimationFrame(this.update);
    this.render();

    // Update the random seed for our shader
    this.shader.uniforms.randSeed = Math.random();
    // Swap the display sprite's texture to the target we just rendered to
    this.displaySprite.texture = this.textures[this.currentRenderTargetIndex];

    // Toggle target index between 0 and 1 each frame so we alternate which is the render target
    // and which is the input
    this.currentRenderTargetIndex = 1 - this.currentRenderTargetIndex;
  };

  addPixelToQueue = async pixelInfo => {
    const shouldStartHandlingQueue =
      this.pixelQueue.length === 0 && pixelInfo.length > 0;

    this.pixelQueue = this.pixelQueue.concat(pixelInfo);

    if (shouldStartHandlingQueue) {
      this.handlePixelQueue();
    }
  };

  handlePixelQueue = async () => {
    if (!this.hasStarted) this.initialize();

    // this.isH
    const shouldResume = this.isRunning;
    if (shouldResume) this.pause();

    const { width, height } = this.pixiApp.renderer;

    // Get an array of all pixels in the current display texture
    const textureBuffer = this.getDisplayPixels();

    while (this.pixelQueue.length > 0) {
      // for (let i = 0, numPixels = pixelsToChange.length; i < numPixels; i++) {
      const currentPixel = this.pixelQueue.pop(); //pixelsToChange[i];
      const arrayPos = (currentPixel.x + currentPixel.y * width) * 4;

      // Set R, G, and B channels to random numbers
      for (let i = 0; i < 3; ++i) {
        if (textureBuffer[arrayPos + i] !== 0) return;

        textureBuffer[arrayPos + i] = currentPixel.color[i];
      }
      // Set the alpha channel to max of 255
      textureBuffer[arrayPos + 3] = 255;
    }

    // window.requestAnimationFrame(() => {
    this.displaySprite.texture = PIXI.Texture.fromBuffer(
      textureBuffer,
      width,
      height
    );

    if (shouldResume) this.play();
    // });
  };

  initialize = (xPos, yPos) => {
    // Stop if it's currently running so that we can reset things
    // if (this.hasStarted) {
    //   this.reset();
    // }

    if (this.hasStarted) return;

    this.hasStarted = true;

    const { width, height } = this.pixiApp.renderer;

    // Create the two textures we'll be swapping between
    this.textures = [
      PIXI.RenderTexture.create(width, height),
      PIXI.RenderTexture.create(width, height)
    ];

    // Initialize our display sprite with the initial texture buffer we just set up
    // This will be rendered to our first render target texture, and then after that we'll
    // just be swapping between the two render textures in a sort of feedback loop
    this.displaySprite = new PIXI.Sprite(this.textures[0]);
    this.displaySprite.filters = [this.shader];

    this.pixiApp.stage.addChild(this.displaySprite);

    // We will start by rendering to the second texture
    this.currentRenderTargetIndex = 1;
  };

  reset = () => {
    // Stop the update loop
    this.pause();

    this.hasStarted = false;

    // Destroy our sprite and render textures since they're no longer needed
    this.displaySprite.destroy();
    this.textures[0].destroy();
    this.textures[1].destroy();
    this.textures.length = 0;
  };

  pause = () => {
    // Cancel any impending update frame request
    cancelAnimationFrame(this.updateFrameRequest);

    // Mark that the loop is no longer running
    this.isRunning = false;
  };

  play = () => {
    // Kick off the update loop and store our frame request so it can be cancelled
    this.updateFrameRequest = requestAnimationFrame(this.update);
    // Mark that the loop is running
    this.isRunning = true;

    this.completionCheckWorker.postMessage(this.getDisplayPixels());
  };

  togglePlayPause = () => {
    if (this.isRunning) this.pause();
    else this.play();
  };
}
