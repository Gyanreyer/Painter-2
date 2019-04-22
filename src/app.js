import RenderManager from "./managers/RenderManager.js";
import InputManager from "./managers/InputManager.js";

const init = () => new InputManager(new RenderManager());

export default {
  init
};
