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

// Random number generation function taken from http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
// GPUs are weird and can't really normally simulate randomness on their own,
// so this basically relies on float precision errors - all you need to do is provide a vec2 as a seed!
highp float rand(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main() {
  // Get the color for this pixel
  vec4 pixelColor = texture2D(uSampler, vTextureCoord);

  if(pixelColor.a < 1.0){
    // Sum up the color values of all of the pixel's 8 neighboring pixels
    // Top left pixel
    vec4 averageColor = texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y - pixelHeight)) +
    // Top pixel
    texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pixelHeight)) +
    // Top right pixel
    texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y - pixelHeight)) +
    // Left pixel
    texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y)) +
    // Right pixel
    texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y)) +
    // Bottom left pixel
    texture2D(uSampler, vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y + pixelHeight)) +
    // Bottom pixel
    texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pixelHeight)) +
    // Bottom right pixel
    texture2D(uSampler, vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y + pixelHeight));

    // Since we know a filled pixel will have an alpha value of 1.0, we can determine how many neighbors have fill
    // by the alpha of the sum of all of the neighboring colors
    float numberOfFilledPixels = averageColor.a;

    averageColor /= numberOfFilledPixels;

    vec2 randCoordSeed = vTextureCoord.xy * randSeed;

    pixelColor = vec4(
        // Make this pixel use the average color of its neighboring pixels, but with a small added random variation on the RGB channels
        clamp(averageColor.r + (rand(randCoordSeed*averageColor.r) - 0.5) * colorVariability, 0.0, 1.0),
        clamp(averageColor.g + (rand(randCoordSeed*averageColor.g) - 0.5) * colorVariability, 0.0, 1.0),
        clamp(averageColor.b + (rand(randCoordSeed*averageColor.b) - 0.5) * colorVariability, 0.0, 1.0),
        1.0
    )
    // Cast boolean to float so we can multiply by 0.0 if false or 1.0 if true
    // Since each pixel is <0,0,0,0> by default, the vector will stay that way until the following conditions evaluate to true
    * float(
      // If 6 or more of this pixel's neighbors have fill, let's let this pixel fill in
      numberOfFilledPixels >= 6.0 ||
      // If this pixel has any neighboring pixels with fill, randomly determine if it should be filled
      (numberOfFilledPixels > 0.0 && rand(randCoordSeed) < 0.33)
    );
  }

  gl_FragColor = pixelColor;
}