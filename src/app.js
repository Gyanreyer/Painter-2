import RenderManager from "./managers/RenderManager.js";

// Import all modules and hook them up with the app
const app = {
  RenderManager
};

const init = () => {
  window.addEventListener("click", event => {
    app.RenderManager.start(event.clientX, event.clientY);
  });

  window.addEventListener("keydown", event => {
    app.RenderManager.togglePlayPause();
  });
};

export default {
  init
};
