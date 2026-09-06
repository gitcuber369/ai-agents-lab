import { runOrchestrator } from "./orchestrator";
import type { Message } from "./llm/types";

const messages: Message[] = [];

while (true) {
  const userInput = prompt("You: ");
  if (userInput === "exit" || userInput === null) break;

  messages.push({ role: "user", content: userInput });

  const reply = await runOrchestrator(userInput);
  console.log("🤖", reply);

  messages.push({ role: "assistant", content: reply });
}
