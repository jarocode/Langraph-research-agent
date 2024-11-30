import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
  persona: string;
}

export const GenerateAnalystState = Annotation.Root({
  topic: Annotation<string>, //research topic
  max_analysts: Annotation<number>, //number of analysts
  human_analyst_feedback: Annotation<string>, //human feedback
  analysts: Annotation<Analyst[]>, //Analyst asking questions
});

export const InterviewState = Annotation.Root({
  ...MessagesAnnotation.spec,
  max_num_turns: Annotation<number>, //Number turns of conversation
  context: Annotation<[]>, //Source docs
  analyst: Annotation<Analyst>, //Analyst asking questions
  interview: Annotation<string>, //Interview transcript
  sections: Annotation<[]>, //Final key we duplicate in outer state for Send() API
});
export const ResearchState = Annotation.Root({
  topic: Annotation<string>, //research topic
  max_analysts: Annotation<number>, //number of analysts
  human_analyst_feedback: Annotation<string>, //human feedback
  analysts: Annotation<Analyst[]>, //Analyst asking questions
  sections: Annotation<[]>, //Final key we duplicate in outer state for Send() API
  introduction: Annotation<string>, //Introduction for the final report
  content: Annotation<string>, //Content for the final report
  conclusion: Annotation<string>, //Conclusion for the final report
  final_report: Annotation<string>, //Final report
});
