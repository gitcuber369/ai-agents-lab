import { retriveDocuments } from "../rag/retriever"
import { chat } from "../llm/chat"
import type { Message } from "../llm/types"


export async function runRagAgent(userQuery: string): Promise<string> {
  const context = retriveDocuments(userQuery);

  const messages: Message[] = [
    {
      role: "system",
      content: `Answer the user's question using only this context: "${context}". If the context doesn't contain the answer, say you don't know.`,
    },
    { role: "user", content: userQuery },
  ];

  const reply = await chat(messages);
  return reply.content;
}
