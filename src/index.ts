// Import CSS files for webpack build
import "./style.scss";

import startUpdateLoop from "./update";
import startInputManager from "./inputManager";
import startCompletionChecker from "./completionChecker";

import Controls from "./components/Controls.svelte";
import KeyboardAccessibilityPaintCursor from "./components/KeyboardAccessibilityPaintCursor.svelte";

startUpdateLoop();
startInputManager();
startCompletionChecker();

new Controls({
  target: document.body,
});

new KeyboardAccessibilityPaintCursor({
  target: document.getElementById("pixi-root"),
});
