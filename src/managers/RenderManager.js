// Import pixi stuff
import * as PIXI from "pixi.js";
// Import our fragment shader file
import paintFragmentShader from "../shaders/paintFrag.glsl";
import dissolveFragmentShader from "../shaders/dissolveFrag.glsl";

import PaintCompletionCheckWorker from "../workers/paintCompletionChecker.worker.js";
import DissolveCompletionCheckWorker from "../workers/dissolveCompletionChecker.worker.js";

const RENDER_MANAGER_MODES = {
  Unstarted: 0,
  Playing: 1,
  Paused: 2,
  Complete: 3
};

const PLAY_DIRECTION = {
  Forward: 0,
  Reverse: 1
};

// Default uniform values to pass to our shader
const defaultPaintShaderUniformValues = {
  randSeed: Math.random(),
  pixelWidth: 1 / window.innerWidth,
  pixelHeight: 1 / window.innerHeight,
  colorVariability: 0.04,
  simulationSpeed: 1.0
};

const defaultDissolveShaderUniformValues = {
  randSeed: Math.random(),
  pixelWidth: 1 / window.innerWidth,
  pixelHeight: 1 / window.innerHeight
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

    // Disable the PixiJS ticker since we are using a custom update loop
    this.ticker = PIXI.Ticker.shared;
    this.ticker.autoStart = false;
    this.ticker.stop();

    // Load our fragment shaders with default uniform values
    this.paintShader = new PIXI.Filter(
      null,
      paintFragmentShader,
      defaultPaintShaderUniformValues
    );
    this.dissolveShader = new PIXI.Filter(
      null,
      dissolveFragmentShader,
      defaultDissolveShaderUniformValues
    );

    this.textures = [];
    this.currentRenderTargetIndex = 0;
    this.displaySprite = null;

    // Mode keeps track of the curren render manager's mode
    this.mode = RENDER_MANAGER_MODES.Unstarted;
    this.playDirection = PLAY_DIRECTION.Forward;

    // Keeps track of currently pending requested animation frame so we can cancel it
    this.updateFrameRequest = null;

    // Set up a web worker for checking if the painting is complete
    this.forwardCompletionCheckWorker = new PaintCompletionCheckWorker();
    this.reverseCompletionCheckWorker = new DissolveCompletionCheckWorker();

    this.forwardCompletionCheckWorker.onmessage = this.onCompletionCheckWorkerMessage;
    this.reverseCompletionCheckWorker.onmessage = this.onCompletionCheckWorkerMessage;

    // Automatically keep the canvas resized to fill the width of the window
    window.addEventListener("resize", this.onWindowResize, { passive: true });

    // Set up textures and display sprite
    this.setup();
  }

  onWindowResize = () => {
    clearTimeout(this.resizeTimeout);

    if (!this.shouldResume) {
      this.shouldResume =
        this.mode === RENDER_MANAGER_MODES.Playing ||
        this.mode === RENDER_MANAGER_MODES.Complete;

      if (this.shouldResume) this.pause();
    }

    this.resizeTimeout = setTimeout(() => {
      this.pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
      this.textures[this.currentRenderTargetIndex].resize(
        window.innerWidth,
        window.innerHeight
      );

      this.render();

      this.swapRenderTextures();

      this.textures[this.currentRenderTargetIndex].resize(
        window.innerWidth,
        window.innerHeight
      );

      const pixelWidth = 1 / window.innerWidth;
      const pixelHeight = 1 / window.innerHeight;
      this.paintShader.uniforms.pixelWidth = pixelWidth;
      this.paintShader.uniforms.pixelHeight = pixelHeight;
      this.dissolveShader.uniforms.pixelWidth = pixelWidth;
      this.dissolveShader.uniforms.pixelHeight = pixelHeight;

      if (this.shouldResume) {
        this.play();
        this.shouldResume = false;
      }
    }, 200);
  };

  onCompletionCheckWorkerMessage = event => {
    if (event.data) {
      this.pause();
      this.mode =
        this.playDirection === PLAY_DIRECTION.Forward
          ? RENDER_MANAGER_MODES.Complete
          : RENDER_MANAGER_MODES.Unstarted;
      return;
    }

    setTimeout(() => {
      if (this.mode !== RENDER_MANAGER_MODES.Playing) return;

      if (this.playDirection === PLAY_DIRECTION.Forward)
        this.forwardCompletionCheckWorker.postMessage(this.getDisplayPixels());
      else
        this.reverseCompletionCheckWorker.postMessage(this.getDisplayPixels());
    }, 500);
  };

  setup = () => {
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
    this.setPlayDirection(PLAY_DIRECTION.Forward);

    this.pixiApp.stage.addChild(this.displaySprite);

    // We will start by rendering to the second texture
    this.currentRenderTargetIndex = 1;
  };

  // Gets pixel data for the display sprite as a Uint8Array
  getDisplayPixels = () =>
    this.pixiApp.renderer.extract.pixels(this.displaySprite);

  swapRenderTextures = () => {
    // Swap the display sprite's texture to the target we just rendered to
    this.displaySprite.texture = this.textures[this.currentRenderTargetIndex];

    // Toggle target index between 0 and 1 each frame so we alternate which is the render target
    // and which is the input
    this.currentRenderTargetIndex = 1 - this.currentRenderTargetIndex;
  };

  // Renders to canvas each frame
  render = () => {
    // Render the stage
    this.pixiApp.renderer.render(
      this.pixiApp.stage,
      this.textures[this.currentRenderTargetIndex]
    );
  };

  update = (timestamp, shouldExecuteOnce) => {
    this.ticker.update(timestamp);

    if (!shouldExecuteOnce) {
      this.updateFrameRequest = requestAnimationFrame(this.update);
    }

    this.render();

    // Update the random seeds for our shaders
    this.paintShader.uniforms.randSeed = Math.random();
    this.dissolveShader.uniforms.randSeed = Math.random();

    this.swapRenderTextures();
  };

  handlePixelQueue = pixelQueue => {
    const { width, height } = this.pixiApp.renderer;

    // Get an array of all pixels in the current display texture
    const textureBuffer = this.getDisplayPixels();

    for (let i = 0, numPixels = pixelQueue.length; i < numPixels; ++i) {
      const currentPixel = pixelQueue[i];
      const arrayPos = (currentPixel.x + currentPixel.y * width) * 4;

      if (textureBuffer[arrayPos + 3] > 0) continue;

      // Set R, G, and B channels to random numbers
      for (let i = 0; i < 3; ++i) {
        textureBuffer[arrayPos + i] = currentPixel.color[i];
      }
      // Set the alpha channel to max of 255
      textureBuffer[arrayPos + 3] = 255;
    }

    this.displaySprite.texture = PIXI.Texture.fromBuffer(
      textureBuffer,
      width,
      height
    );

    if (this.mode === RENDER_MANAGER_MODES.Unstarted) {
      this.setPlayDirection(PLAY_DIRECTION.Forward);
      this.play();
    }
  };

  reset = () => {
    // Stop the update loop
    this.pause();
    this.setPlayDirection(PLAY_DIRECTION.Reverse);
    this.play();
  };

  play = () => {
    if (this.mode === RENDER_MANAGER_MODES.Playing) return;

    this.mode = RENDER_MANAGER_MODES.Playing;
    this.paintShader.enabled = true;
    this.dissolveShader.enabled = true;

    // Kick off the forward update loop and store our frame request so it can be cancelled
    this.updateFrameRequest = requestAnimationFrame(this.update);

    if (this.playDirection === PLAY_DIRECTION.Forward) {
      this.forwardCompletionCheckWorker.postMessage(this.getDisplayPixels());
    } else {
      this.reverseCompletionCheckWorker.postMessage(this.getDisplayPixels());
    }
  };

  pause = () => {
    this.paintShader.enabled = false;
    this.dissolveShader.enabled = false;

    // Cancel any impending update frame request
    cancelAnimationFrame(this.updateFrameRequest);

    // Mark that the loop is no longer running
    if (this.mode === RENDER_MANAGER_MODES.Playing)
      this.mode = RENDER_MANAGER_MODES.Paused;
  };

  togglePlayPause = () => {
    if (this.mode === RENDER_MANAGER_MODES.Playing) this.pause();
    else this.play();
  };

  setPlayDirection = playDirection => {
    this.playDirection = playDirection;
    this.displaySprite.filters = [
      playDirection === PLAY_DIRECTION.Forward
        ? this.paintShader
        : this.dissolveShader
    ];
  };
}
