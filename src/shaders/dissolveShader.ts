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

export default dissolveShader;
