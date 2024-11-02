import { createAnalystGraph } from "./research-agent/graphs/create-analysts.graph";

const input = {
  max_analysts: 3,
  topic: "the benefits of adopting LangGraph as an agent framework",
};

let config = { configurable: { thread_id: "conversation-num-1" } };

const graphTest = async () => {
  console.log("--GRAPH EXECUTION STARTS--");

  for await (const chunk of await createAnalystGraph.stream(input, {
    ...config,
    streamMode: "values",
  })) {
    console.log(chunk.analysts);
    console.log("\n====\n");
  }

  //get the next node after interruption (for human-in-the-loop) takes place.
  const state = await createAnalystGraph.getState(config);
  console.log(`Graph interrupted before ${state.next[0]} node`);

  // Update the state with the user input as if it was the human_feedback node
  const human_analyst_feedback =
    "Add in someone from a startup to add an entrepreneur perspective";

  await createAnalystGraph.updateState(config, {
    human_analyst_feedback,
    asNode: "human_feedback",
  });

  // We can check the state after user input
  console.log("--- State after update ---");
  console.log(await createAnalystGraph.getState(config));

  // Continue the graph execution
  for await (const event of await createAnalystGraph.stream(null, {
    ...config,
    streamMode: "values",
  })) {
    console.log(event.analysts);
    console.log("\n====\n");
  }

  console.log("--GRAPH EXECUTION ENDS--");
};

graphTest();
