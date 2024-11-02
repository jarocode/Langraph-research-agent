import * as tslab from "tslab";

export const drawGraph = async (graph: any) => {
  const drawableGraph = graph.getGraph();
  const image = await drawableGraph.drawMermaidPng();
  const arrayBuffer = await image.arrayBuffer();

  tslab.display.png(new Uint8Array(arrayBuffer));
};
