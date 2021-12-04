import { createApp } from "vue";

// Import CSS files for webpack build
import "./style.scss";

import startUpdateLoop from "./update";
import startInputManager from "./inputManager";
import startCompletionChecker from "./completionChecker";

import Controls from "./components/Controls.vue";

startUpdateLoop();
startInputManager();
startCompletionChecker();

const controlsVueApp = createApp(Controls);

controlsVueApp.mount("#ui-root");
