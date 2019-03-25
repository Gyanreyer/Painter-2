onmessage = event => {
  const packedPixelData = new Uint32Array(event.data.buffer);

  for (let i = 0, numPixels = packedPixelData.length; i < numPixels; ++i) {
    if (packedPixelData[i] !== 0) {
      return postMessage(false);
    }
  }

  postMessage(true);
};
