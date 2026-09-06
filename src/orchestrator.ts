import { chat } from "./llm/chat"
import type { Message } from "./llm/types"
import { runCalcAgent } from "./agents/calcAgent"
import { runWeatherAgent } from "./agents/weatherAgent"


export async function runOrchestrator(userQuery: string): Promise<string> {
  const classifyMessage: Message[] = [
    { role: "system", content: "Classify the user query as exactly one word: WEATHER or CALCULATE. Reply with only that word, nothing else." },
    { role: "user", content: userQuery },
  ]
  const classification = await chat(classifyMessage)

  if (classification.content.toUpperCase().includes("WEATHER")) {
    return runWeatherAgent(userQuery)
  }
  else if (classification.content.toUpperCase().includes("CALCULATE")) {
    return runCalcAgent(userQuery);
  }

  return "I'm not sure how to handle that query."
}
