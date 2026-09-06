import { chat } from "./llm/chat";
import type { Message, ToolDefination } from "./llm/types";
import { executeWeatherTool } from "./tools/weather";
import { executeCalculatorTool } from "./tools/calculator";

const weatherTool: ToolDefination = {
  type: "function",
  function: {
    name: "getWeather",
    description: "Get current weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string",description : "City name"},
      },
      required: ["city"]
    }
  }
}


const calcTool: ToolDefination = {
  type: "function",
  function: {
    name: "calculate",
    description: "Perform a basic arithmatic operation (add, subtract, multiply, divide) on two numbers",
    parameters: {
      type: "object",
      properties: {
        operation: { type: "string", description: "One of: add, subtract, multiply, divide" },
        a: { type: "number", description: "First number" },
        b: {type : "number", description: "Second number"},
      },
      required: ["operation", "a", "b"]
    }
  }
}


export async function runAgent(messages: Message[]): Promise<string>{

  let steps = 0;

  const MAX_HISTORY = 10;

  function trimHistory(messages: Message[]): Message[] {
    if (messages.length <= MAX_HISTORY) return messages;
    return messages.slice(-MAX_HISTORY);
  }


  while (true) {
    steps++;
    if (steps > 5) {
      return "Sorry, I couldn't resolve this after multiple attempts"
    }
    const reply = await chat(trimHistory(messages), undefined, [weatherTool, calcTool]);

    if (reply.toolCalls.length === 0) {
      return reply.content;
    }

    messages.push({ role: "assistant", content: "" });

    for (const toolCalls of reply.toolCalls) {
      let result = "";
      if (toolCalls.function.name === "getWeather") {
        result = executeWeatherTool(toolCalls);
      }
      if (toolCalls.function.name === "calculate") {
        result = executeCalculatorTool(toolCalls);
      }
      messages.push({ role: "tool", content: result, tool_call_id: toolCalls.id });
    }
  }
}
