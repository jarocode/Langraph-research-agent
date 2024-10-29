import { PromptTemplate } from "@langchain/core/prompts";

import { model } from "../llm";
import { GenerateAnalystState } from "../states";
import { analystInstructions } from "../prompts";

const createAnalysts = async (state: typeof GenerateAnalystState.State) => {
  const { topic, max_analysts, human_analyst_feedback } = state;

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

  //Generate analysts
  const analysts = structured_llm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: "" },
  ]);
};
