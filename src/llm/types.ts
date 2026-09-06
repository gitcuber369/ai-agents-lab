export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

export interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
}

export interface ChatResponse {
  message: {
    role: string;
    content: string;
  }
}

export interface ToolDefination {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    }
  }
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: Record<string, any>
  }
}
