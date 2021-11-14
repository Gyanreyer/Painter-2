// Import CSS files for webpack build
import "./style.scss";

import pixiApp from "./pixiApp";
import render from "./render";
import "./drawPixels";

pixiApp.ticker.add(() => {
  render();
});
