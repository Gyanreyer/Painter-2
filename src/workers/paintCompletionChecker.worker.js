onmessage = (event) => {
  // The received pixel buffer keeps the R, G, B, and A values for each pixel as separate
  // sequential 8-bit unsigned integers. This means if we use the buffer to create an array of
  // 32-bit unsigned integers, we can "pack" all 4 channels of each pixel into a single value.
  // Because we're only concerned with whether a pixel is "untouched", meaning it has a value of 0 for
  // all 4 channels, we can just check whether the packed pixels are equal to 0 and significantly
  // reduce the amount of iteration we have to do!
  const packedPixelData = new Uint32Array(event.data.displayPixelBuffer);

  for (
    let i = event.data.lastIncompletePixelIndex || 0,
      numPixels = packedPixelData.length;
    i < numPixels;
    ++i
  ) {
    if (packedPixelData[i] === 0) {
      return postMessage({
        isComplete: false,
        // Include the index where we found this incomplete pixel so we can start again from there rather than
        // repeating unneeded work iterating over pixels we already know are completed
        lastIncompletePixelIndex: i,
      });
    }
  }

  postMessage({
    isComplete: true,
  });
};
