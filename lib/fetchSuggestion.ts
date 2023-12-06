import formatTodosForAI from "./formatTodosForAI";

const fetchSuggestion = async (board: IBoard) => {
  const todos = formatTodosForAI(board);
  console.log("FORMATTED TODOS to send: ", todos);

  const res = await fetch("/api/generateSummary", {
    method: "POST",
    body: JSON.stringify({ todos }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(res);

  const GPTdata = await res.json();
  const { content } = GPTdata;

  return content;
};

export default fetchSuggestion;
