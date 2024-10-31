import { END } from "@langchain/langgraph";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
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
  const { topic, max_analysts, human_analyst_feedback } = state;

  // Set up a parser
  const parser = new JsonOutputParser<Analysts>();

  //prompt
  const analyst_instructions = PromptTemplate.fromTemplate(analystInstructions);

  //Enforce structured output
  //   const structured_llm = model.withStructuredOutput()
  const structured_llm = model;

  const systemMessage = await analyst_instructions.format({
    topic,
    max_analysts,
    human_analyst_feedback,
  });

  const analyst_prompt = ChatPromptTemplate.fromMessages([
    ["system", analystInstructions],
    ["user", "Generate the set of analysts"],
  ]);

  const chain = analyst_prompt.pipe(model).pipe(parser);

  //Generate analysts
  // const analysts = structured_llm.invoke([
  //   { role: "system", content: systemMessage },
  //   { role: "user", content: "" },
  // ]);

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
  return state;
};

export const shouldContinue = (state: typeof GenerateAnalystState.State) => {
  //check if human feedback
  const human_analyst_feedback = state.human_analyst_feedback;
  if (human_analyst_feedback) return "create_analyts";

  //otherwise end
  return END;
};
