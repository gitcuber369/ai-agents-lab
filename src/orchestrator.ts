import { chat } from "./llm/chat"
import type { Message } from "./llm/types"
import { runCalcAgent } from "./agents/calcAgent"
import { runWeatherAgent } from "./agents/weatherAgent"
import {runRagAgent} from "./agents/ragAgent"

export async function runOrchestrator(userQuery: string): Promise<string> {
  const classifyMessage: Message[] = [
    { role: "system", content: "Classify the user query as exactly one word: WEATHER or CALCULATE or DOC. Reply with only that word, nothing else." },
    { role: "user", content: userQuery },
  ]
  const classification = await chat(classifyMessage)

  const lastword =  classification.content.trim().split(/\s+/).pop()?.toUpperCase()

  if (lastword?.includes("WEATHER")) {
    return runWeatherAgent(userQuery)
  }
  else if (lastword?.includes("CALCULATE")) {
    return runCalcAgent(userQuery);
  }

  else if (lastword?.includes("DOC")) {
    return runRagAgent(userQuery);
  }

  return "I'm not sure how to handle that query."
}
