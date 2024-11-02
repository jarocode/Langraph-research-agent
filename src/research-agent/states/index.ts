import { Annotation } from "@langchain/langgraph";

export interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
  persona: (self: string) => string;
}

export const GenerateAnalystState = Annotation.Root({
  topic: Annotation<string>, //research topic
  max_analysts: Annotation<number>, //number of analysts
  human_analyst_feedback: Annotation<string>, //human feedback
  analysts: Annotation<Analyst[]>, //Analyst asking questions
});

export const InterviewState = Annotation.Root({
  max_num_turns: Annotation<number>, //Number turns of conversation
  context: Annotation<[]>, //Source docs
  analyst: Annotation<Analyst>, //Analyst asking questions
  interview: Annotation<string>, //Interview transcript
  sections: Annotation<[]>, //Final key we duplicate in outer state for Send() API
});
