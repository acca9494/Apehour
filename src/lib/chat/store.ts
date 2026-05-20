export const CHAT_CITIES = [
  "Tutte",
  "Milano",
  "Roma",
  "Firenze",
  "Torino",
  "Napoli",
  "Bologna",
  "Venezia",
  "Genova",
  "Palermo",
  "Bari",
] as const;

export type ChatCity = (typeof CHAT_CITIES)[number];

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  city: ChatCity;
  createdAt: string;
}

const KEY = "appape_chat_messages";
const MAX = 120;

export function getMessages(city: ChatCity = "Tutte"): ChatMessage[] {
  try {
    const raw = localStorage.getItem(KEY);
    const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
    if (city === "Tutte") return all;
    return all.filter((m) => m.city === city || m.city === "Tutte");
  } catch {
    return [];
  }
}

export function addMessage(msg: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  try {
    const raw = localStorage.getItem(KEY);
    const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
    const newMsg: ChatMessage = {
      ...msg,
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...all, newMsg].slice(-MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return newMsg;
  } catch {
    return msg as ChatMessage;
  }
}
