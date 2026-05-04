"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { EmotionType } from "@/types/emotion";

interface ChatScreenProps {
  onMoodSelect: (mood: EmotionType) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const VALID_MOODS: EmotionType[] = ["happy", "sad", "angry", "calm", "excited"];
const MOOD_TAG_REGEX = /\[MOOD_DETECTED::(\w+)\]/;

function stripMoodTag(text: string): string {
  return text.replace(MOOD_TAG_REGEX, "").trimEnd();
}

function detectMood(text: string): EmotionType | null {
  const match = text.match(MOOD_TAG_REGEX);
  if (!match) return null;
  const mood = match[1] as EmotionType;
  return VALID_MOODS.includes(mood) ? mood : null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const SUGGESTIONS = [
  { label: "😊 I'm feeling great", text: "I'm feeling really great today!" },
  { label: "😔 Not so good", text: "I'm not feeling so good today..." },
  { label: "⚡ Full of energy", text: "I'm full of energy right now!" },
  { label: "😌 Peaceful & calm", text: "I'm feeling very peaceful and calm." },
  { label: "😤 Frustrated", text: "I'm feeling kind of frustrated right now." },
];

export function ChatScreen({ onMoodSelect }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectedMood, setDetectedMood] = useState<EmotionType | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasConversation = messages.length > 0;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  }, [input]);

  async function sendToAI(conversationMessages: Message[]) {
    setIsStreaming(true);

    const aiMsgId = "ai-" + Date.now();
    setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

    try {
      const apiMessages = conversationMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: errMsg } : m))
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              fullText += parsed.text;
              const displayText = stripMoodTag(fullText);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: displayText } : m
                )
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Check for mood detection
      const mood = detectMood(fullText);
      if (mood) {
        const displayText = stripMoodTag(fullText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: displayText } : m
          )
        );
        setDetectedMood(mood);

        setTimeout(() => {
          setShowTransition(true);
          setTimeout(() => {
            onMoodSelect(mood);
          }, 1200);
        }, 1500);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: "Sorry, I'm having trouble connecting. Please try again." }
            : m
        )
      );
    }

    setIsStreaming(false);
  }

  function handleSend(overrideText?: string) {
    const text = overrideText ?? input.trim();
    if (!text || isStreaming || detectedMood) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    sendToAI(updatedMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ─── Landing View (no messages yet) ───
  if (!hasConversation) {
    return (
      <div
        className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-black"
        style={{
          backgroundImage:
            "radial-gradient(62.51% 83.32% at 50% 50%, rgba(120, 119, 198, 0.10) 0%, rgba(0, 0, 0, 0.00) 50%)",
        }}
      >
        {/* Noise texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 left-8 z-20"
        >
          <span
            className="text-white"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "30px",
            }}
          >
            MoodWave
          </span>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[680px] px-6">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-10"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7877C6, #9B8EC4)",
                boxShadow: "0 0 30px rgba(120, 119, 198, 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-white"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              }}
            >
              {getGreeting()}
            </h1>
          </motion.div>

          {/* Input box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="w-full"
          >
            <div className="chat-input-container-landing">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me how you're feeling..."
                rows={1}
                className="chat-textarea"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="chat-send-btn"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Suggestion pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSend(s.text)}
                className="suggestion-pill"
              >
                {s.label}
              </button>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-white/20 text-xs tracking-[0.2em] uppercase mt-12"
          >
            Emotion-Responsive Music · MoodWave
          </motion.p>
        </div>

        {/* Transition overlay */}
        <AnimatePresence>
          {showTransition && <TransitionOverlay />}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Conversation View ───
  return (
    <div
      className="relative h-screen w-full overflow-hidden flex flex-col bg-black"
      style={{
        backgroundImage:
          "radial-gradient(62.51% 83.32% at 50% 50%, rgba(120, 119, 198, 0.06) 0%, rgba(0, 0, 0, 0.00) 50%)",
      }}
    >
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
      />

      {/* Header — centered like Claude */}
      <div className="relative z-20 flex items-center justify-center px-8 pt-8 pb-4">
        <span
          className="text-white"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "30px",
          }}
        >
          MoodWave
        </span>
      </div>

      {/* Messages — centered column */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-44 px-6">
        <div className="flex flex-col gap-6 pt-4" style={{ maxWidth: "680px", marginLeft: "auto", marginRight: "auto" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {msg.role === "user" ? (
                  /* User message — right-aligned pill */
                  <div className="flex justify-end">
                    <div className="chat-bubble-user">
                      <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* AI message — left-aligned, no bubble, like Claude */
                  <div className="flex gap-3">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, #7877C6, #9B8EC4)",
                        boxShadow: "0 0 16px rgba(120, 119, 198, 0.25)",
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-[15px] leading-[1.75] whitespace-pre-wrap">
                        {msg.content}
                        {isStreaming &&
                          msg.id === messages[messages.length - 1]?.id &&
                          msg.role === "assistant" && (
                            <span className="chat-cursor" />
                          )}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator — sparkle icon pulsing (like Claude's asterisk) */}
          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            messages[messages.length - 1].content === "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center sparkle-pulse"
                  style={{
                    background: "linear-gradient(135deg, #7877C6, #9B8EC4)",
                    boxShadow: "0 0 16px rgba(120, 119, 198, 0.25)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom input — centered */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div
          className="h-16 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.85) 50%, #000)",
          }}
        />
        <div className="bg-black pb-6 px-6">
          <div style={{ maxWidth: "680px", marginLeft: "auto", marginRight: "auto", width: "100%" }}>
            <div className="chat-input-container">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  detectedMood
                    ? "Mood detected! Loading your music..."
                    : "Write a message..."
                }
                disabled={isStreaming || !!detectedMood}
                rows={1}
                className="chat-textarea"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming || !!detectedMood}
                className="chat-send-btn"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-white/15 text-xs mt-3">
              MoodWave AI determines your mood to find the perfect music.
            </p>
          </div>
        </div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {showTransition && <TransitionOverlay />}
      </AnimatePresence>
    </div>
  );
}

/* ── Transition overlay shown when mood is detected ── */
function TransitionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center sparkle-pulse"
          style={{
            background: "linear-gradient(135deg, #7877C6, #9B8EC4)",
            boxShadow: "0 0 60px rgba(120, 119, 198, 0.5)",
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p
          className="text-white/80 text-lg"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Finding your perfect soundtrack...
        </p>
      </motion.div>
    </motion.div>
  );
}
