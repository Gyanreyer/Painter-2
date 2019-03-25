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
// The probabiliy of a pixel being filled in any given frame - when this is lower it translates to
// the simulation going slower, hence the name
uniform float dissolveSpeed;

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

vec4 getPixelColor(vec2 coordinates){
  return float(all(greaterThanEqual(coordinates, vec2(0.0))) && all(lessThanEqual(coordinates, vec2(1.0)))) * texture2D(uSampler, coordinates);
}

void main() {
  // Get the color for this pixel
  vec4 pixelColor = texture2D(uSampler, vTextureCoord);

  if(pixelColor.a > 0.0){
    // Sum up the color values of all of the pixel's 8 neighboring pixels
    // Top left pixel
    vec4 averageColor = getPixelColor(vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y - pixelHeight)) +
      // Top pixel
      getPixelColor(vec2(vTextureCoord.x, vTextureCoord.y - pixelHeight)) +
      // Top right pixel
      getPixelColor(vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y - pixelHeight)) +
      // Left pixel
      getPixelColor(vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y)) +
      // Right pixel
      getPixelColor(vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y)) +
      // Bottom left pixel
      getPixelColor(vec2(vTextureCoord.x - pixelWidth, vTextureCoord.y + pixelHeight)) +
      // Bottom pixel
      getPixelColor(vec2(vTextureCoord.x, vTextureCoord.y + pixelHeight)) +
      // Bottom right pixel
      getPixelColor(vec2(vTextureCoord.x + pixelWidth, vTextureCoord.y + pixelHeight));

    float numberOfFilledPixels = averageColor.a;

    // 8 filled pixels = highest probability of true
    // 0 filled pixels = guaranteed false
    // More filled pixels = higher probability this will evaluate to true (multiply by 1, no change)
    // Less filled pixels = higher probability this will evaluate to false (multiply by 0)
    pixelColor *= float(rand(gl_FragCoord.xy*randSeed) < numberOfFilledPixels * 0.12475);
  }

  gl_FragColor = pixelColor;
}