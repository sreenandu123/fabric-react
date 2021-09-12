import React, { useEffect, useState } from "react";
import { createCanvas, createRect, handleZoom, snapToFixture } from "./editorFunctions";

const Canvas = (props) => {
  const [canvasLayer, setCanvasLayer] = useState();

  useEffect(() => {
    if (canvasLayer) {
      createRect(canvasLayer);
      createRect(canvasLayer, {
        fill: "green",
        width: 70,
        height: 50,
        left: 500,
        top: 200,
        angle: 0,
        selectable: true,
      });
      canvasLayer.on({
        "mouse:wheel": (options) => handleZoom(options, canvasLayer),
        "object:moving": handleSnapping
      });
    }
  }, [canvasLayer]);
  useEffect(() => {
    setCanvasLayer(createCanvas("canvas-layer"));
  }, []);

  const handleSnapping = (options) => {
    options.target.setCoords();
      snapToFixture(canvasLayer, options);
  }

  return (
    <div>
      <canvas id="canvas-layer" style={{ border: "1px solid black" }}>
        Hello Name
      </canvas>
    </div>
  );
};

export default Canvas;
