import * as PIXI from "pixi.js";

import paintFragmentShader from "./paintFrag.glsl";

interface PaintFragmentShaderUniforms {
  randSeed: number;
  pixelWidth: number;
  pixelHeight: number;
  colorVariability: number;
  fillProbability: number;
}

// Default uniform values to pass to our shader
const defaultPaintShaderUniformValues: PaintFragmentShaderUniforms = {
  randSeed: Math.random(),
  pixelWidth: 1 / window.innerWidth,
  pixelHeight: 1 / window.innerHeight,
  colorVariability: 0.04,
  fillProbability: 0.3,
};

const paintShader = new PIXI.Filter(
  undefined,
  paintFragmentShader,
  defaultPaintShaderUniformValues
);

export default paintShader;
