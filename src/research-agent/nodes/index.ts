import { END } from "@langchain/langgraph";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

import { model } from "../llm";
import { GenerateAnalystState, Analyst, InterviewState } from "../states";
import { analystInstructions, questionInstructions } from "../prompts";
import { SystemMessage } from "@langchain/core/messages";

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
  const schema = `{{ analyst: [{{ affiliation: "string", name: "string", role: "string", description: "string", persona: "string" }}] }}`;

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
    human_analyst_feedback
  );

  if (human_analyst_feedback) return "create_analysts";

  //otherwise end
  return END;
};

//generate question nodes
export const generateQuestion = async (state: typeof InterviewState.State) => {
  console.log("-- Generate Question Node --");

  //Get state
  const analyst = state.analyst;
  const messages = state.messages;

  //Generate question
  const systemMessage = await PromptTemplate.fromTemplate(
    questionInstructions
  ).format({ goals: analyst.persona });

  console.log("analyst persona:", analyst.persona);

  const question = await model.invoke([
    new SystemMessage({ content: systemMessage }),
    ...messages,
  ]);

  //Write messages to state.

  return {
    messages: [question],
  };
};
