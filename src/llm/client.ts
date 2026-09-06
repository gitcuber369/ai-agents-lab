import type { Message, ToolDefination, ToolCall } from "./types";

export class LLMClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl
    this.model = model
  }

  async chat(messages: Message[], tools?: ToolDefination[], onToken?: (token: string) => void): Promise<{ content: string; toolCalls: ToolCall[]}> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        ...(tools && {tools}),
      })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    let full_content = "";
    const toolCalls: ToolCall[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        const parsed = JSON.parse(line);
        if (parsed.done) break;

        if (parsed.message?.tool_calls) {
          toolCalls.push(...parsed.message.tool_calls);
        }

        const content = parsed.message?.content || "";
        const thinking = parsed.message?.thinking || "";
        const token = content || thinking || "";

        full_content += token;
        onToken?.(token);
      }
    }

    return {
      content: full_content, toolCalls
    };


  }
}
