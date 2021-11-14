export const getColorChannelValue = (
  blendChannelValue: number | null = null,
  blendVariability: number = 5
): number =>
  Math.max(
    Math.min(
      blendChannelValue
        ? blendChannelValue +
            Math.round((Math.random() - 0.5) * blendVariability)
        : Math.random() * 255,
      255
    ),
    0
  );
