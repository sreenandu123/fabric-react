import { fabric } from "fabric";

const createCanvas = (id) => {
  return new fabric.Canvas(id, {
    height: 600,
    width: 1000,
    backgroundColor: "white",
    imageSmoothingEnabled: true,
    fireRightClick: true,
  });
};

const createRect = (canvas, obj) => {
  var rect = new fabric.Rect({
    left: 400,
    top: 100,
    fill: "red",
    width: 100,
    height: 200,
    angle: 60,
    selectable: false,
    lockScalingX: true,
    lockScalingY: true,
    centeredRotation: true,
    absolutePositioned: true,
    originX: "left",
    originY: "top",
    ...obj,
  });
  canvas.add(rect);
};

function handleZoom(options, canvas) {
  options.e.preventDefault();
  options.e.stopPropagation();
  var delta = options.e.deltaY;
  var zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);
  // canvas.setZoom(zoom);
}

const snapToFixture = (canvas, options) => {
  canvas.forEachObject((object) => {
    if (object === options.target) return;
    if (options.target.intersectsWithObject(object)) {
      options.target.set("angle", object.angle);
    }
  });
};

export { createCanvas, createRect, handleZoom, snapToFixture };
