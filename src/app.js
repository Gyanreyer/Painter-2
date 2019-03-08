import RenderManager from "./managers/RenderManager.js";
import InputManager from "./managers/InputManager.js";

// Import all modules and hook them up with the app
const app = {};

const init = () => {
  app.renderManager = new RenderManager();
  app.inputManager = new InputManager(app.renderManager);
};

export default {
  init
};
