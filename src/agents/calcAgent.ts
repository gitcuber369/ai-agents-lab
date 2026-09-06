import { chat } from "../llm/chat";
import { executeCalculatorTool } from "../tools/calculator";
import type { Message, ToolCall, ToolDefination } from "../llm/types";

const calcTool: ToolDefination = {
  type: "function",
  function: {
    name: "calculator",
    description: "Execute a calculator tool call",
    parameters: {
      type: "object",
      properties: {
        operation: { type: "string", description: "The operation to perform (e.g., 'add', 'subtract')" },
        a: { type: "number", description: "The first operand" },
        b: { type: "number", description: "The second operand" },
      },
      required: ["operation", "a", "b"],
    }
  }
}

export async function runCalcAgent(userQuery: string): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: "You are a math assistant that can perform calculator operations." },
    { role: "user", content: userQuery },
  ];

  let steps = 0;

  while (true) {
    steps++;
    if (steps > 5) {
      return "Sorry, I couldn't resolve this after multiple  attempts"
    }

    const reply = await chat(messages, undefined, [calcTool])

    if (reply.toolCalls.length === 0) {
      return reply.content;
    }

    messages.push({role: "assistant", content: ""})


    for (const toolCall of reply.toolCalls) {
      const result = executeCalculatorTool(toolCall);
      messages.push({role: "tool", content: result, tool_call_id: toolCall.id})
    }
  }
}
