"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/features/chatbot/api/chatbot-client";
import type { ChatMessage } from "@/types/chat";

type DisplayMessage = ChatMessage & { streaming?: boolean };

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const WELCOME: DisplayMessage = {
  id: "welcome",
  role: "bot",
  content:
    "Hi! I'm Dr. Schedula. Tell me a symptom (headache, fever, stomach ache, cough...) and I'll ask a couple of quick questions before giving you care advice. I can also help with your appointments, prescriptions, or finding a doctor.",
  createdAt: new Date().toISOString(),
};

// How fast the bot "types" its reply, in characters revealed per tick.
const REVEAL_CHARS_PER_TICK = 2;
const REVEAL_TICK_MS = 18;

export function useChatbot(patientId: string | undefined) {
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string>();
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearInterval(revealTimer.current);
    };
  }, []);

  const revealMessage = useCallback((id: string, fullText: string) => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    let shown = 0;
    revealTimer.current = setInterval(() => {
      shown = Math.min(fullText.length, shown + REVEAL_CHARS_PER_TICK);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id
            ? { ...message, content: fullText.slice(0, shown), streaming: shown < fullText.length }
            : message,
        ),
      );
      if (shown >= fullText.length && revealTimer.current) {
        clearInterval(revealTimer.current);
        revealTimer.current = null;
      }
    }, REVEAL_TICK_MS);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !patientId) return;

      setError(undefined);
      const userMessage: DisplayMessage = {
        id: makeId("user"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);

      try {
        const reply = await sendChatMessage(patientId, trimmed);
        const botId = makeId("bot");
        setMessages((prev) => [...prev, { id: botId, role: "bot", content: "", createdAt: new Date().toISOString(), streaming: true }]);
        setIsThinking(false);
        revealMessage(botId, reply);
      } catch (err) {
        setIsThinking(false);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    },
    [patientId, revealMessage],
  );

  return { messages, send, isThinking, error };
}
