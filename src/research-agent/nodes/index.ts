import { END } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

import { model } from "../llm";
import { GenerateAnalystState, Analyst } from "../states";
import { analystInstructions } from "../prompts";

type Analysts = {
  analyst: Analyst[];
};

export const createAnalysts = async (
  state: typeof GenerateAnalystState.State
) => {
  console.log("--- createAnalyst Node ---");
  const { topic, max_analysts, human_analyst_feedback } = state;

  console.log(
    "value of human_analyst_feedback in createAnalyst Node :",
    human_analyst_feedback
  );

  // Set up a parser
  const parser = new JsonOutputParser<Analysts>();

  //output schema
  const schema = `{{ analyst: [{{ affiliation: "string", name: "string", role: "string", description: "string", persona: "(self: string) => void" }}] }}`;

  const analyst_prompt = await ChatPromptTemplate.fromMessages([
    ["system", analystInstructions],
    ["user", "Generate the set of analysts"],
  ]).partial({ schema });

  const chain = analyst_prompt.pipe(model).pipe(parser);

  const analysts = await chain.invoke({
    topic,
    max_analysts,
    human_analyst_feedback,
  });
  console.log("analysts:", analysts);
  return {
    analysts: analysts.analyst,
  };
};

export const humanFeedback = (state: typeof GenerateAnalystState.State) => {
  console.log("--- humanFeedback ---");
  return state;
};

export const shouldContinue = (state: typeof GenerateAnalystState.State) => {
  console.log("--Conditional edge function--");
  //check if human feedback
  const human_analyst_feedback = state.human_analyst_feedback;

  console.log(
    "value of human_analyst_feedback in shouldContinue func:",
    state.human_analyst_feedback
  );

  if (human_analyst_feedback) return "create_analyts";

  //otherwise end
  return END;
};
