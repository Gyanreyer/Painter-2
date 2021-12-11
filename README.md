# Painter v2
A remake of [my original Painter project](https://github.com/Gyanreyer/Painter) with major user experience and performance improvements.

## Improvements over the previous implementation:
- In Painter v1, the user could only click once on the canvas to paint a single pixel, and then the simulation would run from there, resetting if you click again. In v2, the user can now click + drag to paint multiple pixels in a single stroke,
and can continue clicking to paint more empty pixels on the canvas while the simulation is running.
- Adds a dissolve effect to clear any paint on the canvas; the user can switch directions between painting/dissolving at any time
- UI improvements
  - Drops bootstrap in favor of [material icons](https://google.github.io/material-design-icons/) + custom CSS
  - Fancy transitions + effects; I'm most proud of how the button icons switch from black to white if the canvas under them is determined to be too dark
  - UI components written in [Svelte](https://svelte.dev/)
- Switched from [Three.js](https://github.com/mrdoob/three.js/) to [Pixi.js](https://github.com/pixijs/pixijs) for the significantly simpler setup/developer experience. I would guess this comes with some performance tradeoffs, but setup is so much simpler that it has been totally worth it.
- In Painter v1, periodic checks for whether the simulation was complete or not were extremely expensive and the biggest source of performance degradation. This version makes an effort to move as much of that logic into web workers as possible so it won't block the main thread.
  - Using the [Comlink](https://github.com/GoogleChromeLabs/comlink) library for simpler worker management
- Switched to TypeScript, because it's just great.
  
## Further planned features:
- The ability to change playback speed
  - The foundation for this are in place; just need to design a good way to control it in the UI
