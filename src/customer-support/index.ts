import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";

import initialSupport from "./nodes/initialSupport.node";
import billingSupport from "./nodes/billingSupport.node";
import technicalSupport from "./nodes/technicalSupport.node";
import handleRefund from "./nodes/handleRefund.node";

// const getModelResponse = async () => {
//   const res = await model.invoke("who are you?");
//   console.log("res", res);
// };

// getModelResponse();

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextRepresentative: Annotation<string>,
  refundAuthorized: Annotation<boolean>,
});

let builder = new StateGraph(StateAnnotation)
  .addNode("initial_support", initialSupport)
  .addNode("billing_support", billingSupport)
  .addNode("technical_support", technicalSupport)
  .addNode("handle_refund", handleRefund)
  .addEdge("__start__", "initial_support");

builder = builder.addConditionalEdges(
  "initial_support",
  async (state: typeof StateAnnotation.State) => {
    if (state.nextRepresentative.includes("BILLING")) {
      return "billing";
    } else if (state.nextRepresentative.includes("TECHNICAL")) {
      return "technical";
    } else {
      return "conversational";
    }
  },
  {
    billing: "billing_support",
    technical: "technical_support",
    conversational: "__end__",
  }
);

console.log("Added edges!");

builder = builder
  .addEdge("technical_support", "__end__")
  .addConditionalEdges(
    "billing_support",
    async (state) => {
      if (state.nextRepresentative.includes("REFUND")) {
        return "refund";
      } else {
        return "__end__";
      }
    },
    {
      refund: "handle_refund",
      __end__: "__end__",
    }
  )
  .addEdge("handle_refund", "__end__");

console.log("Added edges!");

const checkpointer = new MemorySaver();

const graph = builder.compile({
  checkpointer,
});

const testGraph = async () => {
  // const stream = await graph.stream(
  //   {
  //     messages: [
  //       {
  //         role: "user",
  //         content:
  //           "I've changed my mind and I want a refund for order #182818!",
  //       },
  //     ],
  //   },
  //   {
  //     configurable: {
  //       thread_id: "refund_testing_id",
  //     },
  //   }
  // );

  // for await (const value of stream) {
  //   console.log("---STEP---");
  //   console.log(value);
  //   console.log("---END STEP---");
  // }

  const technicalStream = await graph.stream(
    {
      messages: [
        {
          role: "user",
          content:
            "My LangCorp computer isn't turning on because I dropped it in water.",
        },
      ],
    },
    {
      configurable: {
        thread_id: "technical_testing_id",
      },
    }
  );

  for await (const value of technicalStream) {
    console.log(value);
  }
};

testGraph();
