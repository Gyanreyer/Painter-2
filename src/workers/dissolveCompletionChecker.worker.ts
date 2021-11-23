import * as Comlink from "comlink";

const dissolveCompletionChecker = {
  lastIncompletePixelAlphaIndex: 3,
  reset() {
    this.lastIncompletePixelAlphaIndex = 3;
  },
  checkIsComplete(displayPixelArray: Uint8ClampedArray): boolean {
    for (
      let i = 3, pixelDataLength = displayPixelArray.length;
      i < pixelDataLength;
      i += 4
    ) {
      if (displayPixelArray[i] !== 0) {
        this.lastIncompletePixelAlphaIndex = i;
        return false;
      }
    }

    return true;
  },
};

Comlink.expose(dissolveCompletionChecker);

export type DissolveCompletionChecker = typeof dissolveCompletionChecker;
