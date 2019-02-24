// Import app as starting point of app
import app from "./app.js";
// Import CSS files for webpack build
import "./style.scss";
import "./secondStyleFile.scss";

window.onload = app.init;
