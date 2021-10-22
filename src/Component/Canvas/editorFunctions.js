import { fabric } from "fabric";

const createCanvas = (id) => {
  return new fabric.Canvas(id, {
    height: 600,
    width: 0.5 * window.innerWidth,
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
    angle: 70,
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
  return (cord2.y - cord1.y) / (cord2.x - cord1.x);
};

const getDistance = (cord1, cord2) => {
  return Number(
    Math.sqrt(
      Math.pow(Number(cord2.x) - Number(cord1.x), 2) +
        Math.pow(Number(cord2.y) - Number(cord1.y), 2)
    ).toFixed(2)
  );
};

//y = mx+ c;
const edges = [
  ["tl", "bl"],
  ["bl", "br"],
  ["br", "tr"],
  ["tr", "tl"],
];

const getDistanceBetweenParallelLines = (edge, object, activeObject) => {
  let slopeOfObject = Number(
    getSlope(object.aCoords[edge[0]], object.aCoords[edge[1]]).toFixed(2)
  );
  let slopeOfActiveObj = Number(
    getSlope(
      activeObject.aCoords[edge[0]],
      activeObject.aCoords[edge[1]]
    ).toFixed(2)
  );
  let distance = 0,
    c1 = 0,
    c2 = 0;
  if (slopeOfObject === slopeOfActiveObj) {
    c1 = Number(
      (
        object.aCoords[edge[0]].y -
        slopeOfObject * object.aCoords[edge[0]].x
      ).toFixed(2)
    );
    c2 = Number(
      (
        activeObject.aCoords[edge[0]].y -
        slopeOfObject * activeObject.aCoords[edge[0]].x
      ).toFixed(2)
    );
    distance = Math.abs(c2 - c1) / Math.sqrt(1 + slopeOfObject * slopeOfObject);
  }
  return { distance, slopeOfObject, c1, c2 };
};
const getCentroid = (object, activeObject) => {
  let edgesDistancesObj = edges.map((item) =>
    getDistanceBetweenParallelLines(item, object, activeObject)
  );
  let maxDistindex = 0,
    maxDist = edgesDistancesObj[0].distance;
  edgesDistancesObj.forEach((item, index) => {
    if (maxDist > item.distance) {
      maxDist = item.distance;
      maxDistindex = index;
    }
  });
  if (
    edgesDistancesObj[maxDistindex].distance < 20 &&
    edgesDistancesObj[maxDistindex].distance !== 0
  ) {
    let { slopeOfObject, c1, distance } = edgesDistancesObj[maxDistindex];
    let [x1, y1] = [
      activeObject.getCenterPoint().x,
      activeObject.getCenterPoint().y,
    ];
    let perpendSlope = Number((-1 / slopeOfObject).toFixed(2));
    let c = Number((y1 - perpendSlope * x1).toFixed(2));

    let xIntersect = (c1 - c) / (perpendSlope - slopeOfObject);
    let yintersect =
      (c1 * perpendSlope - c * slopeOfObject) / (perpendSlope - slopeOfObject);

    let lineToCentroidDistance = getDistance(
      { x: x1, y: y1 },
      { x: xIntersect, y: yintersect }
    );
    let distanceRatio = distance / lineToCentroidDistance;
    let newCentroidX = (1 - distanceRatio) * x1 + distanceRatio * xIntersect;
    let newCentroidY = (1 - distanceRatio) * y1 + distanceRatio * yintersect;

    return { x: newCentroidX, y: newCentroidY };
  }
  return null;
};

const snapToFixture = (canvas, options) => {
  canvas.forEachObject((object) => {
    if (object === options.target) return;
    if (options.target.intersectsWithObject(object)) {
      options.target.set("angle", object.angle);

      let centroid = getCentroid(object, options.target);
      if (centroid) {
        options.target.setPositionByOrigin(centroid);
      }
    }
  });
};

export { createCanvas, createRect, handleZoom, snapToFixture };
