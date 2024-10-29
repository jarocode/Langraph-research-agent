import { model } from "./llm";

const testModel = async () => {
  const response = await model.invoke("who are you?");
  console.log("gpt-4o response:", response.content);
};

testModel();
