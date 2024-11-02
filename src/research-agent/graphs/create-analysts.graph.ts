import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import { GenerateAnalystState } from "../states";

import { createAnalysts, humanFeedback, shouldContinue } from "../nodes";

const builder = new StateGraph(GenerateAnalystState)
  .addNode("create_analysts", createAnalysts)
  .addNode("human_feedback", humanFeedback)
  .addEdge(START, "create_analysts")
  .addEdge("create_analysts", "human_feedback")
  .addConditionalEdges(
    "human_feedback",
    shouldContinue
    //   {
    //   true: "create_analysts",
    //   false: END,
    // }
  );

// const builder = new StateGraph(GenerateAnalystState)
//   .addNode("create_analysts", createAnalysts)
//   .addEdge(START, "create_analysts")
//   .addEdge("create_analysts", END);

// Set up memory
const memory = new MemorySaver();

// compile
export const createAnalystGraph = builder.compile({
  checkpointer: memory,
  interruptBefore: ["human_feedback"],
});
