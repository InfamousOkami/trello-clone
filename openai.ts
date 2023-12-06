import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_API_KEY,
});

export default openai;
