import { createAnalystGraph } from "./research-agent/graphs/create-analysts.graph";

const input = {
  max_analysts: 3,
  topic: "the benefits of adopting LangGraph as an agent framework",
};

let config = { configurable: { thread_id: "conversation-num-1" } };

const graphTest = async () => {
  console.log("--START--");
  for await (const chunk of await createAnalystGraph.stream(input, {
    ...config,
    streamMode: "values",
  })) {
    console.log(chunk);
    console.log("\n====\n");
  }
  console.log("--END--");
};

graphTest();
