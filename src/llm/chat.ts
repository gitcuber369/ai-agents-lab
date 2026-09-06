import { LLMClient } from "./client";
import { DEFAULT_MODEL, OLLAMA_BASE_URL } from "./constant";
import type { Message, ToolDefination } from "./types";


export async function chat(
  message: Message[],
  onToken?: (token: string) => void,
  tools?: ToolDefination[]
) {
  const client = new LLMClient(OLLAMA_BASE_URL, DEFAULT_MODEL);
  const reply = await client.chat(message, tools, onToken);
  return reply;
}
