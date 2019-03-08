export default class InputManager {
  constructor(renderManagerInstance) {
    this.renderManager = renderManagerInstance;

    this.mouseColor = [
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255)
    ];

    this.lastMousePosition = null;

    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("keyup", this.onKeyUp);
  }

  updateNextMouseColor = () => {
    this.mouseColor = [
      Math.max(
        Math.min(
          this.mouseColor[0] + Math.round((Math.random() - 0.5) * 10),
          255
        ),
        0
      ),
      Math.max(
        Math.min(
          this.mouseColor[1] + Math.round((Math.random() - 0.5) * 10),
          255
        ),
        0
      ),
      Math.max(
        Math.min(
          this.mouseColor[2] + Math.round((Math.random() - 0.5) * 10),
          255
        ),
        0
      )
    ];
  };

  onMouseDown = event => {
    const { clientX, clientY } = event;

    this.lastMousePosition = {
      x: clientX,
      y: clientY
    };

    this.renderManager.addPixelToQueue([
      {
        x: clientX,
        y: clientY,
        color: this.mouseColor
      }
    ]);
    this.updateNextMouseColor();

    this.isMouseDown = true;
  };

  onMouseMove = event => {
    if (!this.isMouseDown) return;

    const { clientX, clientY } = event;

    let lastX = this.lastMousePosition.x;
    let lastY = this.lastMousePosition.y;

    const diffX = Math.abs(clientX - lastX);
    const diffY = Math.abs(clientY - lastY);
    const slopeX = clientX > lastX ? 1 : -1;
    const slopeY = clientY > lastY ? 1 : -1;
    let err = diffX - diffY;

    this.lastMousePosition = {
      x: clientX,
      y: clientY
    };

    const pixelsToChange = [];

    do {
      const err2 = err << 1;
      if (err2 > -diffY) {
        err -= diffY;
        lastX += slopeX;
      }
      if (err2 < diffX) {
        err += diffX;
        lastY += slopeY;
      }

      pixelsToChange.push({
        x: Math.round(lastX),
        y: Math.round(lastY),
        color: this.mouseColor
      });
      this.updateNextMouseColor();
    } while (lastX !== clientX || lastY !== clientY);

    this.renderManager.addPixelToQueue(pixelsToChange);

    // window.requestAnimationFrame(() =>
    // this.renderManager.onClickCanvas(pixelsToChange);
    // );
  };

  onMouseUp = event => {
    this.isMouseDown = false;
    this.renderManager.play();
  };

  onKeyUp = event => {
    switch (event.key || event.keyCode) {
      case " ":
      case 32:
        // Space bar pressed - play/pause
        this.renderManager.pause();
        break;
      case "r":
      case 82:
        // R pressed - restart
        this.renderManager.reset();
        break;
    }
  };
}
