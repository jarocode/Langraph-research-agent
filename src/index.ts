import { model } from "./research-agent/llm";

const testModel = async () => {
  const response = await model.invoke("who are you?");
  console.log("gpt-4o response:", response);
};

testModel();
