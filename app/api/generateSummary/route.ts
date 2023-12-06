import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // todos in the body of the post request
  console.log("request: ", request);
  const { todos } = await request.json();
  console.log("todos 2: ", todos);

  // communicate to openai GPT
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    n: 1,
    stream: false,
    messages: [
      {
        role: "system",
        content:
          "When responding, welcome the user always as Joey and say welcome to your Todo App! Limit the response to 200 characters",
      },
      {
        role: "user",
        content: ` Hi there, provide a summary of the following todos. Count how many todos are in each category such as todo, in progress and done, then tell the user to have a productive day! Here's the data: ${JSON.stringify(
          todos
        )}`,
      },
    ],
  });

  // console.log("response: ", response);

  // const { data } = response;

  // console.log("Data is: ", response);
  // console.log(data.choices[0].message);

  // return NextResponse.json(data.choices[0].message);
}
