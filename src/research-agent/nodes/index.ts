import { END } from "@langchain/langgraph";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AIMessage, SystemMessage } from "@langchain/core/messages";

import { model } from "../llm";
import { GenerateAnalystState, Analyst, InterviewState } from "../states";
import {
  analystInstructions,
  answerInstructions,
  questionInstructions,
  searchInstructions,
} from "../prompts";

import { queryMediaWiki, WikipediaSearchResult } from "../../utils/helpers";

type Analysts = {
  analyst: Analyst[];
};

type SearchQuery = {
  searchQuery: string;
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

export const searchWeb = async (state: typeof InterviewState.State) => {
  console.log("-- Node for retrieving docs form website --");

  const messages = state.messages;

  const parser = new JsonOutputParser<SearchQuery>();

  const searchPrompt = PromptTemplate.fromTemplate(searchInstructions);

  const tavilySearch = new TavilySearchResults({ maxResults: 3 });

  const searchChain = searchPrompt.pipe(model).pipe(parser);

  const searchQuery = await searchChain.invoke({ conversation: messages });

  const searchDocs = await tavilySearch.invoke(searchQuery.searchQuery);
  const formattedSearchDocs = searchDocs.map((data: any) => {
    return `<Document href=${data.url}>${data.content}</Document>`;
  });

  return {
    context: [formattedSearchDocs],
  };
};

export const searchWikipedia = async (state: typeof InterviewState.State) => {
  console.log("-- Node for retrieving docs form Wikipedia --");

  const messages = state.messages;

  const parser = new JsonOutputParser<SearchQuery>();

  const searchPrompt = PromptTemplate.fromTemplate(searchInstructions);

  const searchChain = searchPrompt.pipe(model).pipe(parser);

  const searchQuery = await searchChain.invoke({ conversation: messages });

  const searchDocs = await queryMediaWiki(searchQuery.searchQuery);

  const formattedSearchDocs = searchDocs.map((data: WikipediaSearchResult) => {
    return `<Document source=${data.pageUrl} page=${data.pageNumber}>${data.fullContent}</Document>`;
  });

  return {
    context: [formattedSearchDocs],
  };
};

export const generateAnswer = async (state: typeof InterviewState.State) => {
  console.log("-- Node to answer a question --");

  const { analyst, messages, context } = state;

  //answer question
  const systemMessage = await PromptTemplate.fromTemplate(
    answerInstructions
  ).format({ goals: analyst.persona, context });

  const answer = await model.invoke([
    new SystemMessage({ content: systemMessage }),
    ...messages,
  ]);

  //name the message as coming from the expert
  answer.name = "expert";

  return {
    messages: [answer],
  };
};

export const saveInterview = async (state: typeof InterviewState.State) => {
  console.log("-- Save interviews --");

  const { messages } = state;

  //Convert interview to a string.
  const interview = messages.toString();

  return {
    interview,
  };
};

export const routeMessages = async (
  state: typeof InterviewState.State,
  name = "expert"
) => {
  console.log("-- Route between question and answer --");
  const { messages, max_num_turns } = state;

  //Check the number of expert answers
  let numOfExpertResponses: number = 0;
  for (const message of messages) {
    if (message instanceof AIMessage && message.name === name)
      numOfExpertResponses++;
  }

  //End if expert has answered more than the max turns
  if (numOfExpertResponses >= max_num_turns) return "saveInterview";

  //This router is run after each question - answer pair
  //Get the last question asked to check if it signals the end of discussion
  const lastQuestion = messages[messages.length - 1];
  if (
    lastQuestion.content.toString().includes("Thank you so much for your help")
  )
    return "saveInterview";

  return "askQuestions";
};
