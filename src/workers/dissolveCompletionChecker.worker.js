onmessage = (event) => {
  const packedPixelData = new Uint32Array(event.data.displayPixelBuffer);

  for (
    let i = event.data.lastIncompletePixelIndex || 0,
      numPixels = packedPixelData.length;
    i < numPixels;
    ++i
  ) {
    if (packedPixelData[i] !== 0) {
      return postMessage({
        isComplete: false,
        lastIncompletePixelIndex: i,
      });
    }
  }

  postMessage({
    isComplete: true,
  });
};
