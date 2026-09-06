import { chat } from "../llm/chat";
import type { Message, ToolDefination } from "../llm/types";
import { executeWeatherTool } from "../tools/weather";

const weatherTool: ToolDefination = {
  type: "function",
  function: {
    name: "getWeather",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name"
        }
      },
      required: ["city"]
    }
  }
}

export async function runWeatherAgent(userMessage: string): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: "You are a weather agent that helps users get weather information." },
    { role: "user", content: userMessage },
  ];

  let steps = 0;

  while (true) {
    steps++;
    if (steps > 5) {
      return "Sorry, I couldn't find the weather information. Please try again later."
    }

    const reply = await chat(messages, undefined, [weatherTool])

    if (reply.toolCalls.length === 0) {
      return reply.content;
    }

    messages.push({ role: "assistant", content: "" });

    for (const toolCalls of reply.toolCalls) {
      const result = executeWeatherTool(toolCalls);
      messages.push({role: "tool", content: result, tool_call_id: toolCalls.id})
   }
  }
}
