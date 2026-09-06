"use client";
import { useEffect, useRef, useState } from "react";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { useChatbot } from "@/features/chatbot/hooks/use-chatbot";
import { CloseIcon, SendIcon, StethoscopeIcon } from "@/components/ui/icons";

export function ChatbotWidget() {
  const { session } = usePatientSession();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, send, isThinking, error } = useChatbot(session?.patient.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, open]);

  if (!session) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || isThinking) return;
    send(draft);
    setDraft("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Dr. Schedula health assistant"
          className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">
                <StethoscopeIcon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dr. Schedula</p>
                <p className="text-xs text-[var(--muted)]">Symptom check, appointments &amp; prescriptions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-7 place-items-center rounded-full text-[var(--muted)] hover:bg-stone-100 hover:text-[var(--ink)]"
            >
              <CloseIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "bot" && (
                  <div className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">
                    <StethoscopeIcon className="size-3.5" aria-hidden="true" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    message.role === "user"
                      ? "rounded-br-sm bg-[var(--brand)] text-white"
                      : "rounded-bl-sm bg-stone-100 text-[var(--ink)]"
                  }`}
                >
                  {message.content}
                  {message.streaming && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle" />}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-end justify-start gap-2" aria-live="polite" aria-label="Assistant is typing">
                <div className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-white">
                  <StethoscopeIcon className="size-3.5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-stone-100 px-3.5 py-2.5">
                  <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-stone-400" />
                </div>
              </div>
            )}

            {error && <p className="text-xs font-medium text-red-700">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--line)] p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message..."
              aria-label="Message"
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isThinking}
              aria-label="Send message"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)] disabled:bg-stone-300"
            >
              <SendIcon className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open Dr. Schedula health assistant"}
        className="grid size-14 place-items-center rounded-full bg-[var(--brand)] text-white shadow-lg hover:bg-[var(--brand-deep)]"
      >
        {open ? <CloseIcon className="size-6" aria-hidden="true" /> : <StethoscopeIcon className="size-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
