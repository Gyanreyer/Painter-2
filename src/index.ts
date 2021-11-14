// Import CSS files for webpack build
import "./style.scss";

import startUpdateLoop from "./update";
import startInputManager from "./inputManager";
import startCompletionChecker from "./completionChecker";

startUpdateLoop();
startInputManager();
startCompletionChecker();
