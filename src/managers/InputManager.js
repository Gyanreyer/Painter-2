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
    const { mouseX, mouseY } = this.getClampedMousePos(event);

    this.lastMousePosition = {
      x: mouseX,
      y: mouseY
    };

    this.renderManager.handlePixelQueue([
      {
        x: mouseX,
        y: mouseY,
        color: this.mouseColor
      }
    ]);

    this.updateNextMouseColor();

    this.isMouseDown = true;
  };

  onMouseMove = event => {
    if (!this.isMouseDown) return;

    const { mouseX, mouseY } = this.getClampedMousePos(event);

    let lastX = this.lastMousePosition.x;
    let lastY = this.lastMousePosition.y;

    const diffX = Math.abs(mouseX - lastX);
    const diffY = Math.abs(mouseY - lastY);
    const slopeX = mouseX > lastX ? 1 : -1;
    const slopeY = mouseY > lastY ? 1 : -1;
    let err = diffX - diffY;

    this.lastMousePosition = {
      x: mouseX,
      y: mouseY
    };

    const pixelQueue = [];

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

      pixelQueue.push({
        x: Math.round(lastX),
        y: Math.round(lastY),
        color: this.mouseColor
      });
      this.updateNextMouseColor();
    } while (lastX !== mouseX || lastY !== mouseY);

    this.renderManager.handlePixelQueue(pixelQueue);
  };

  onMouseUp = async event => {
    this.isMouseDown = false;

    this.mouseColor = [
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255)
    ];
  };

  onKeyUp = event => {
    switch (event.key || event.keyCode) {
      case " ":
      case 32:
        // Space bar pressed - play/pause
        this.renderManager.togglePlayPause();
        break;
      case "r":
      case 82:
        // R pressed - restart
        this.renderManager.reset();
        break;
    }
  };

  getClampedMousePos = event => ({
    mouseX: Math.min(Math.max(event.clientX, 0), window.innerWidth-1),
    mouseY: Math.min(Math.max(event.clientY, 0), window.innerHeight-1)
  });
}
