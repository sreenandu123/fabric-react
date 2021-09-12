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
    angle: 10,
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

const getSlope = (cord1, cord2) => {
  return (cord2.y-cord1.y)/(cord2.x-cord1.x);
}

const getDistance = (cord1, cord2) => {
  return Number(Math.sqrt(Math.pow(Number(cord2.x) - Number(cord1.x), 2) +Math.pow(Number(cord2.y) - Number(cord1.y), 2)).toFixed(2))
}

//y = mx+ c;
const getCentroid = (object, activeObject) => {
  let a1 = Number(getSlope(object.aCoords.tl, object.aCoords.bl).toFixed(2));
  let slopeObject2 = Number(getSlope(activeObject.aCoords.tl, activeObject.aCoords.bl).toFixed(2));
  if(a1 === slopeObject2){
    let c1 = Number((object.aCoords.tl.y - (a1*object.aCoords.tl.x)).toFixed(2));
    let c2 = Number((activeObject.aCoords.tl.y - (a1*activeObject.aCoords.tl.x)).toFixed(2));
    let distance = Math.abs(c2-c1)/Math.sqrt(1 + a1*a1);
    if(distance<20){

      let [x1, y1] = [activeObject.getCenterPoint().x, activeObject.getCenterPoint().y];
      let perpendSlope = Number((-1/a1).toFixed(2));
      let c = Number((y1 - (perpendSlope*x1)).toFixed(2));

      let xIntersect = (c1 - c)/(perpendSlope - a1);
      let yintersect = (c1*perpendSlope - c*a1)/(perpendSlope - a1)
  
      let lineToCentroidDistance = getDistance({x: x1, y: y1}, {x: xIntersect, y: yintersect});
      let distanceRatio = distance/lineToCentroidDistance;
      let newCentroidX = (1-distanceRatio)*x1 + distanceRatio*xIntersect;
      let newCentroidY = (1-distanceRatio)*y1 + distanceRatio*yintersect;
  
      return {x: newCentroidX, y: newCentroidY}
    }
  }
  return null;
}

const snapToFixture = (canvas, options) => {
  canvas.forEachObject((object) => {
    if (object === options.target) return;
    if (options.target.intersectsWithObject(object)) {
      options.target.set("angle", object.angle);
      
      let centroid = getCentroid(object, options.target);
      if(centroid){
        options.target.setPositionByOrigin(centroid);
      }
    }
  });
};

export { createCanvas, createRect, handleZoom, snapToFixture };
