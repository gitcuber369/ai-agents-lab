import type { ToolCall } from "../llm/types";

export function executeCalculatorTool(toolCall: ToolCall): string {
  const { operation, a, b } = toolCall.function.arguments;

  if (operation === "add") {
    return `${a + b}`;
  }

  if (operation === "subtract") {
    return `${a - b}`
  }

  if (operation === "multiply") {
    return `${a * b}`
  }

  if (operation === "divide") {
    if (b === 0) {
      return `Error: cannot divide by zero`
    }
    return `${a / b}`
  }



  return `Unknown operation ${operation}`;
}
