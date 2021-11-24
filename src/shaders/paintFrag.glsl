// The coordinates of the current pixel
varying vec2 vTextureCoord;
// The image data
uniform sampler2D uSampler;
// The width and height of a pixel in the scale of 0.0 - 1.0
// We need these so that we can modify the vTextureCoord to access neighboring pixels
uniform float pixelWidth;
uniform float pixelHeight;
// A random seed generated externally each frame to help add additional randomness to the simulation
uniform float randSeed;
// The amount by which each color channel can be varied from the average color of its neighbors
uniform float colorVariability;

uniform float fillProbability;

// Random number generation function taken from http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
// GPUs are weird and can't really normally simulate randomness on their own,
// so this basically relies on float precision errors - all you need to do is provide a vec2 as a seed!
highp float rand(vec2 co) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

void main() {
  // Get the color for this pixel
  vec4 pixelColor = texture2D(uSampler, vTextureCoord);

  // Get the color values of all of the pixel's 8 neighboring pixels
  vec4 topLeftPixelColor = texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y - pixelHeight));
  vec4 topPixelColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pixelHeight));
  vec4 topRightPixelColor = texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y - pixelHeight));
  vec4 leftPixelColor = texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y));
  vec4 rightPixelColor = texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y));
  vec4 bottomLeftPixelColor = texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y + pixelHeight));
  vec4 bottomPixelColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pixelHeight));
  vec4 bottomRightPixelColor = texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y + pixelHeight));

  vec4 averageColor = topLeftPixelColor +
    topPixelColor +
    topRightPixelColor +
    leftPixelColor +
    rightPixelColor +
    bottomLeftPixelColor +
    bottomPixelColor +
    bottomRightPixelColor;

  // Since we know a filled pixel will have an alpha value of 1.0, we can determine how many neighbors have fill
  // by the alpha of the sum of all of the neighboring colors
  float numberOfFilledPixels = averageColor.a;

  averageColor /= numberOfFilledPixels;

  vec2 randCoordSeed = vTextureCoord.xy * randSeed;

  gl_FragColor = pixelColor +
    // Multiply everything by 0 if the pixel color's alpha is 1.0, meaning its color is already locked in
    // This allows us to avoid any branching!
    (1.0 - pixelColor.a) *
    // Cast boolean to float so we can multiply by 0.0 if false or 1.0 if true
    float(
      // If the pixel hsa 6 or more filled neighboring pixels, it should just be filled immediately
      numberOfFilledPixels >= 6.0 ||
      // Otherwise, randomly determine if the pixel should be filled, increasing the probability based on the number of filled neighboring pixels it has
      (numberOfFilledPixels > 0.0 && rand(randCoordSeed) < fillProbability)
    ) * vec4(
      // Set the r, g, and b values by applying some random variation from the average r, g, and b values of the pixels surrounding this pixel
      clamp(averageColor.r + (rand(randCoordSeed * averageColor.r) - 0.5) * colorVariability, 0.0, 1.0),
      clamp(averageColor.g + (rand(randCoordSeed * averageColor.g) - 0.5) * colorVariability, 0.0, 1.0),
      clamp(averageColor.b + (rand(randCoordSeed * averageColor.b) - 0.5) * colorVariability, 0.0, 1.0),
      1.0
    );
}