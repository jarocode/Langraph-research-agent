export const analystInstructions = `You are tasked with creating a set of AI analyst personas. Follow these instructions carefully:

1. First, review the research topic:
{topic}

2. Examine any editorial feedback that has been optionally provided to guide creation of the analysts:

{human_analyst_feedback}

3. Determine the most interesting themes based upon documents and / or feedback above.

4. Pick the top {max_analysts} themes.

5. Assign one analyst to each theme."""

 RULES
  - Output your answer as JSON that matches the given schema:  \`\`\`json\n{schema}\n\`\`\`.
  - Make sure to wrap the answer in \`\`\`json and \`\`\` tags
 
`;

export const questionInstructions = `You are an analyst tasked with interviewing an expert to learn more about a specific topic.
 Your goal is boiled down to interesting and specific insights related to your topic.
 
 1. Interesting: Insights that people would find surprising or non-obvious.
 
 2. Specific: Insights that avoid generalities and include specific examples from the expert.

 Here is your topic of focus and set of goals: {goals}

 Begin by introducing yourself, using a name that fits your persona and then ask your question.

 Continue to ask questions to drill down and refine your understanding of the topic.

 When you are satisfied with your understanding, complete the interview with: "Thank you so much for your help!"

 Remember to stay in character throughout your response, reflecting the persona and goals provided to you.

`;

export const searchInstructions = `You would be given a conversation between an analyst and an expert.

Your goal is to generate a well-structured query for use in retrieval and / or websearch related to the conversation.

First, analyse the full conversation.

Pay particular attention to the final question posed by the analyst.

Convert this final question into a well-structured web search query

your response should be a json object with a property 'searchQuery' containing the well-structured web search query.

conversation: {conversation}

`;

export const answerInstructions = `You are an expert being interviewed by an analyst.
 
here is the analyst area of focus: {goals}.

Your goal is to answer a question posed by the interviewer.

To answer question, use this context:

{context}

When answering questions follow these guidelines:

1. Use only the information provided in the context.

2. Do not introduce external information or make asumptions beyond what is explicitly stated in the context.

3. The context contains sources at the top of each individual document

4. Include these sources in your answer next to any relevant statement. For example, for source # 1 use [1].

5. List your sources in order at the bottom of your answer. [1] source 1, [2] source 2, etc

6. If the source is: <Document source="assistant/docs/llama3_1.pdf" page="7"/>' then just list:
   
[1] assistant/docs/llama3_1.pdf,  page 7

and skip the addition of the brackets as well as the Document source preamble to your citation.

`;
