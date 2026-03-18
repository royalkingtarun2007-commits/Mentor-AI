import { apiRequest } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  context_used: string[];
  chat_id: number;
  chat_title: string;
}

export async function chatWithNotes(
  message: string,
  chat_id: number | null = null
): Promise<ChatResponse> {
  return apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, chat_id }),
  });
}

export async function getChatHistory(chatId: number): Promise<ChatMessage[]> {
  return apiRequest(`/ai/history/${chatId}`);
}

export async function summarizeNote(noteId: number) {
  return apiRequest(`/ai/summarize?note_id=${noteId}`, { method: "POST" });
}