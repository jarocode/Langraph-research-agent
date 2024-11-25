import { StateGraph, START, MemorySaver, END } from "@langchain/langgraph";

import { InterviewState } from "../states";

import {
  generateAnswer,
  generateQuestion,
  routeMessages,
  saveInterview,
  searchWeb,
  searchWikipedia,
  writeSection,
} from "../nodes";

const builder = new StateGraph(InterviewState)
  .addNode("ask_question", generateQuestion)
  .addNode("search_web", searchWeb)
  .addNode("search_wikipedia", searchWikipedia)
  .addNode("answer_question", generateAnswer)
  .addNode("save_interview", saveInterview)
  .addNode("write_section", writeSection)
  .addEdge(START, "ask_question")
  .addEdge("ask_question", "search_web")
  .addEdge("ask_question", "search_wikipedia")
  .addEdge("search_web", "answer_question")
  .addEdge("search_wikipedia", "answer_question")
  .addConditionalEdges("answer_question", (state) =>
    routeMessages(state, "expert")
  )
  .addEdge("save_interview", "write_section")
  .addEdge("write_section", END);
// Set up memory
const memory = new MemorySaver();

// compile
export const interviewGraph = builder.compile({
  checkpointer: memory,
});
