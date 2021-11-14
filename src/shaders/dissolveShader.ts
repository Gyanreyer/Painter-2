import * as PIXI from "pixi.js";

import dissolveFragmentShader from "./dissolveFrag.glsl";

interface DissolveFragmentShaderUniforms {
  randSeed: number;
  pixelWidth: number;
  pixelHeight: number;
}

// Default uniform values to pass to our shader
const defaultDissolveShaderUniformValues: DissolveFragmentShaderUniforms = {
  randSeed: Math.random(),
  pixelWidth: 1 / window.innerWidth,
  pixelHeight: 1 / window.innerHeight,
};

const dissolveShader = new PIXI.Filter(
  undefined,
  dissolveFragmentShader,
  defaultDissolveShaderUniformValues
);

window.addEventListener(
  "resize",
  () => {
    // Update the shader uniform's pixel size when the window resizes
    dissolveShader.uniforms.pixelWidth = 1 / window.innerWidth;
    dissolveShader.uniforms.pixelHeight = 1 / window.innerHeight;
  },
  { passive: true }
);

export default dissolveShader;
