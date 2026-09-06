# AI Agent Lab - Learning Context Prompt

Copy-paste this entire prompt to any AI assistant session to continue where you left off.

---

## WHO I AM

I am a developer who knows TypeScript and is learning to build AI agents **from scratch to advanced level**. I prefer explanations in **Hinglish (Hindi + English mix)** with real-life analogies (jaise Gulab Jamun ka saancha for classes). I want to understand every line of code, not just copy it. Explain concepts step-by-step before writing code, and let me write code myself when possible — guide me, don't do everything for me.

## PROJECT PURPOSE

This project (`ai-agent-lab`) is my hands-on learning lab where I build AI agents piece by piece WITHOUT using any framework (no LangChain, no Vercel SDK) — everything from raw code, so I deeply understand how agents actually work under the hood.

- **Runtime:** Bun v1.3.14 (macOS arm64)
- **Language:** TypeScript (strict mode)
- **LLM Backend:** Ollama running locally at `http://localhost:11434`
- **Model:** `qwen3:8b` (supports: completion, tools, **thinking**)
- **No external dependencies** — only Bun built-ins (fetch, TextDecoder, prompt)

Run command: `bun run src/index.ts`

## WHAT IS ALREADY IMPLEMENTED (Working & Tested)

### File Structure
```
src/
├── index.ts          → Interactive chat loop entry point
└── llm/
    ├── client.ts     → LLMClient class (fetch + streaming reader)
    ├── chat.ts       → chat() wrapper function
    ├── constant.ts   → OLLAMA_BASE_URL, DEFAULT_MODEL constants
    └── types.ts      → Message, ChatRequest, ChatResponse interfaces
```

### 1. LLMClient class (`src/llm/client.ts`)
```typescript
import type { Message } from "./types";

export class LLMClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
      })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    let full_content = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        const parsed = JSON.parse(line);
        if (parsed.done) break;

        const content = parsed.message?.content || "";
        const thinking = parsed.message?.thinking || "";
        const token = content || thinking || "";

        full_content += token;
        onToken?.(token);
      }
    }

    return full_content;
  }
}
```

### 2. chat wrapper (`src/llm/chat.ts`)
```typescript
import { LLMClient } from "./client";
import { DEFAULT_MODEL, OLLAMA_BASE_URL } from "./constant";
import type { Message } from "./types";

export async function chat(
  message: Message[],
  onToken?: (token: string) => void,
) {
  const client = new LLMClient(OLLAMA_BASE_URL, DEFAULT_MODEL);
  const reply = await client.chat(message, onToken);
  return reply;
}
```

### 3. Interactive loop (`src/index.ts`)
```typescript
import { chat } from "./llm/chat";
import type { Message } from "./llm/types";

const messages: Message[] = [];

while (true) {
  const userInput = prompt("You: ");
  if (userInput === "exit" || userInput === null) break;

  messages.push({ role: "user", content: userInput });

  process.stdout.write("🤖 ");

  const reply = await chat(messages, (token) => {
    process.stdout.write(token);
  });

  console.log("\n");
  messages.push({ role: "assistant", content: reply });
}
```

### 4. Types (`src/llm/types.ts`)
```typescript
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
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
```

### 5. Constants (`src/llm/constant.ts`)
```typescript
export const OLLAMA_BASE_URL = "http://localhost:11434";
export const DEFAULT_MODEL = "qwen3:8b";
```

## CONCEPTS I HAVE LEARNED SO FAR

1. **Classes** = blueprint/saancha; instances are objects made from it
2. **Constructor** = runs automatically when `new Class()` is called; initializes state
3. **private vs public** = private accessible only inside class (compile-time TS enforcement); default to private
4. **`this.` keyword** = refers to class instance properties; needed to distinguish from parameters/local vars
5. **export/import** = sharing code between files
6. **async/await & Promises** = network calls don't block whole program; `await` pauses only that function
7. **fetch API** = POST with headers + JSON.stringify body
8. **ReadableStream + getReader()** = reading response chunk-by-chunk
9. **TextDecoder** = converting binary Uint8Array chunks to strings
10. **NDJSON format** = Ollama streams newline-delimited JSON objects
11. **Callbacks (onToken)** = pass function that fires per token for typing effect
12. **process.stdout.write vs console.log** = no auto-newline, needed for streaming effect
13. **Conversation history** = push user+assistant messages into array, send full array every turn

## KEY BUGS ENCOUNTERED & FIXED (Important Lessons)

### Bug 1: Infinite recursion
I wrongly called `new LLMClient()` inside `LLMClient.chat()` itself creating infinite loop. 
Lesson: separation of concerns — client class only talks HTTP; wrapper creates clients and logs.

### Bug 2: `stream: true` + `response.json()` together
Failed to parse JSON error. Lesson: streamed responses must be read via getReader(), not .json().

### Bug 3: `line.includes('"done"')` substring bug ⭐ MOST IMPORTANT
Every Ollama chunk contains `"done":false` at the end, so `.includes('"done"')` matched EVERY line and broke immediately — zero tokens processed.
Fix: parse first, then check value:
```typescript
const parsed = JSON.parse(line);
if (parsed.done) break;   // only breaks when done is literally true
```
Lesson: never use substring matching for JSON flags; parse then check actual values.

### Bug 4: qwen3 thinking tokens
qwen3:8b sends `content: ""` with separate `thinking: "..."` field first (~20-30 lines), then real content later.
Fix: `const token = content || thinking || "";`

### Bug 5: TypeScript strict errors learned from
- `prompt()` returns `string | null` → handle null case
- Object literal role inferred as `string`, not union type → annotate arrays as `Message[]`
- `response.json()` returns `unknown` → cast with `as Type`

## IMPORTANT API KNOWLEDGE (Ollama /api/chat)

Request: `{ model, messages, stream, tools? }`
Stream chunks look like:
```json
{"model":"qwen3:8b","message":{"role":"assistant","content":"Hi","thinking":"..."},"done":false}
```
Final chunk: `{...,"done":true,"done_reason":"stop",...}`

Tool calling verified working with qwen3:8b — when `tools` array is sent (OpenAI-style function format), LLM responds with:
```json
{"message":{"role":"assistant","tool_calls":[{"id":"call_xxx","function":{"name":"getWeather","arguments":{"city":"Mumbai"}}}],"done":true}}
```
Note: Ollama parses arguments into an object already (not a JSON string).

## CURRENT ROADMAP (Where We Are)

- [x] Step 1: LLM Client basics (fetch, non-streaming)
- [x] Step 2: Interactive terminal chat (loop, history)
- [x] Step 3: Streaming (reader loop, onToken callback, typing effect)
- [ ] **Step 4: TOOLS / FUNCTION CALLING ← NEXT UP**
- [ ] Step 5: ReAct Agent (Think → Act → Observe loop)
- [ ] Step 6: Memory management (summary, sliding window)
- [ ] Step 7: Router agent (intent detection)
- [ ] Step 8: Multi-agent systems
- [ ] Step 9: RAG (retrieval augmented generation)
- [ ] Step 10: Production hardening (error handling, retries, testing, observability)

## STEP 4 PLAN (Tools/Function Calling) — WHAT I NEED GUIDANCE ON

I want to build this MYSELF with guidance (tell me what & why, I write the code):

1. **`types.ts`**: Add `ToolDefinition` (OpenAI-style: type/function/name/description/parameters schema) and `ToolCall` (id, function.name, function.arguments). Add `"tool"` to Message.role union.
2. **New folder `src/tools/`**: Create `weather.ts` (fake weather DB + `executeWeatherTool(toolCall): string`) and `calculator.ts` (`executeCalculatorTool` with add/subtract/multiply/divide, divide-by-zero handling).
3. **`client.ts`**: Add optional `tools?: ToolDefinition[]` param, spread into body `...(tools && { tools })`. Return type must change from `Promise<string>` to something like `Promise<{ content: string; toolCalls: ToolCall[] }>` because LLM may respond with tool_calls instead of content. Collect `parsed.message.tool_calls` during stream parsing.
4. **New `src/agent.ts`**: The AGENT LOOP:
   ```
   while (true):
     reply = client.chat(messages, tools)
     if reply.toolCalls is empty → return reply.content (final answer)
     for each toolCall:
       result = dispatch by name to correct execute function
       push assistant message (with empty content) + tool result message (role: "tool") into messages
     loop continues — LLM sees results and produces final answer
   ```
5. Test queries: "Mumbai ka temperature kya hai?", "25 aur 7 multiply karo"

## TEACHING STYLE RULES FOR THE ASSISTANT

1. Explain concept BEFORE code, with Hinglish + desi analogies
2. Line-by-line explanation when showing new code patterns
3. When I ask "what next" — tell me the plan/steps, let ME write code, review what I wrote
4. When I share code, check correctness and explain bugs with WHY, not just fix silently
5. Use tables for comparisons, ASCII flow diagrams for architecture
6. Keep answers focused; don't dump huge code blocks unless asked
