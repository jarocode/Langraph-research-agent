import { HumanMessage } from "@langchain/core/messages";
import { createAnalystGraph } from "./research-agent/graphs/create-analysts.graph";
import { Analyst } from "./research-agent/states";
import { interviewGraph } from "./research-agent/graphs/interview-graph";
// import { drawGraph } from "./research-agent/utils";

const input = {
  max_analysts: 3,
  topic: "the benefits of adopting LangGraph as an agent framework",
};

let config = { configurable: { thread_id: "conversation-num-1" } };

const createAnalysts = async (): Promise<Analyst[]> => {
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
  let human_analyst_feedback =
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

  //no further human feedback
  human_analyst_feedback = "";
  await createAnalystGraph.updateState(config, {
    human_analyst_feedback,
    asNode: "human_feedback",
  });

  // Continue the graph execution to the end
  for await (const event of await createAnalystGraph.stream(null, {
    ...config,
    streamMode: "updates",
  })) {
    console.log(event.analysts);
    console.log("\n====\n");
  }

  const finalState = await createAnalystGraph.getState(config);
  const analysts = finalState.values.analysts;

  console.log("final analysts:", analysts);

  //   await drawGraph(createAnalystGraph);

  console.log("--GRAPH EXECUTION ENDS--");
  return analysts;
};

const conductInterview = async () => {
  const analysts = await createAnalysts();
  const analyst = analysts[0];
  const messages = new HumanMessage({
    content: `So you said you were writing an article on ${input.topic}?`,
  });
  let config = { configurable: { thread_id: "interview-session-1" } };
  const interview = await interviewGraph.invoke(
    {
      analyst,
      messages,
      max_num_turns: 2,
    },
    { ...config }
  );

  console.log("interview", interview);
};

conductInterview();
