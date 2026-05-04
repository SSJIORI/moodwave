"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmotionType, emotionThemes } from "@/types/emotion";

interface ChatScreenProps {
  onMoodSelect: (mood: EmotionType) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const VALID_MOODS: EmotionType[] = ["happy", "sad", "angry", "calm", "excited"];
const MOOD_DETECTED_REGEX = /\[MOOD_DETECTED::(\w+)\]/;
const MOOD_SIGNAL_REGEX = /\[MOOD_SIGNAL::(\w+)\]/;

const OPENING_QUESTIONS = [
  "What's living in your chest right now?",
  "How is the world feeling to you today?",
  "If today had a weather, what would it be?",
  "Tell me — how are you, really?",
  "What's the weight of this moment?",
];

function stripTags(text: string): string {
  return text.replace(MOOD_DETECTED_REGEX, "").replace(MOOD_SIGNAL_REGEX, "").trimEnd();
}

function detectFinalMood(text: string): EmotionType | null {
  const match = text.match(MOOD_DETECTED_REGEX);
  if (!match) return null;
  const mood = match[1] as EmotionType;
  return VALID_MOODS.includes(mood) ? mood : null;
}

function detectSignalMood(text: string): EmotionType | null {
  const match = text.match(MOOD_SIGNAL_REGEX);
  if (!match) return null;
  const mood = match[1] as EmotionType;
  return VALID_MOODS.includes(mood) ? mood : null;
}

type Phase = "ambient" | "bleed" | "crystallise";

export function ChatScreen({ onMoodSelect }: ChatScreenProps) {
  const openingQuestion = useRef(
    OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)]
  ).current;

  const [messages, setMessages] = useState<Message[]>([
    { id: "opening", role: "assistant", content: openingQuestion },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [ambientMood, setAmbientMood] = useState<EmotionType | null>(null);
  const [detectedMood, setDetectedMood] = useState<EmotionType | null>(null);
  const [summary, setSummary] = useState("");
  const [phase, setPhase] = useState<Phase>("ambient");
  const [openingVisible, setOpeningVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setOpeningVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

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
      let signalCaptured = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              fullText += parsed.text;
              const displayText = stripTags(fullText);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: displayText } : m
                )
              );

              if (!signalCaptured) {
                const signal = detectSignalMood(fullText);
                if (signal) {
                  signalCaptured = true;
setAmbientMood(signal);
                  setPhase("bleed");
                }
              }
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      const mood = detectFinalMood(fullText);
      if (mood) {
        const displayText = stripTags(fullText);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: displayText } : m))
        );
        setSummary(displayText);
        setDetectedMood(mood);
        setAmbientMood(mood);
        setPhase("crystallise");

        setTimeout(() => {
          onMoodSelect(mood);
        }, 3200);
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

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming || detectedMood) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    sendToAI(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const theme = ambientMood ? emotionThemes[ambientMood] : null;
  const detectedTheme = detectedMood ? emotionThemes[detectedMood] : null;

  // Show last 5 messages as floating text
  const visibleMessages = messages.slice(-5);
  const lastAiContent = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{
        background: theme ? theme.colors.background : "#000",
        transition: "background 2s ease",
      }}
    >
      {/* Ambient blobs — exact same positions as PlayerScreen */}
      <motion.div
        className="absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none"
        animate={{
          opacity: theme ? 0.25 : 0.07,
          background: theme
            ? `radial-gradient(circle, ${theme.colors.gradientFrom}, transparent 60%)`
            : "radial-gradient(circle, rgba(120,119,198,1), transparent 60%)",
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
        animate={{
          opacity: theme ? 0.15 : 0.04,
          background: theme
            ? `radial-gradient(circle, ${theme.colors.gradientTo}, transparent 60%)`
            : "radial-gradient(circle, rgba(120,119,198,1), transparent 60%)",
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Logo — same position as PlayerScreen */}
      <div className="absolute top-8 left-8 z-20">
        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "30px",
            color: "#fff",
          }}
        >
          MoodWave
        </span>
      </div>

      {/* Floating messages */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-12 pb-36">
        <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 640 }}>
          <AnimatePresence initial={false}>
            {visibleMessages.map((msg, idx) => {
              const isLast = idx === visibleMessages.length - 1;
              const isSecondLast = idx === visibleMessages.length - 2;
              const isOld = idx < visibleMessages.length - 3;

              if (msg.id === "opening" && !openingVisible) return null;

              if (msg.role === "assistant") {
                return (
                  <motion.p
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isOld ? 0.15 : isSecondLast ? 0.4 : isLast ? 0.88 : 0.6,
                      y: 0,
                      filter: isOld ? "blur(1.5px)" : "blur(0px)",
                      scale: isLast ? 1 : isSecondLast ? 0.97 : 0.94,
                    }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: isLast
                        ? "clamp(1.3rem, 2.2vw, 1.7rem)"
                        : "1.05rem",
                      lineHeight: 1.65,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    {msg.content}
                    {isStreaming && isLast && msg.content === "" && (
                      <span className="chat-cursor" />
                    )}
                  </motion.p>
                );
              } else {
                return (
                  <motion.p
                    key={msg.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{
                      opacity: isOld ? 0.1 : isSecondLast ? 0.28 : 0.48,
                      x: 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontSize: "0.95rem",
                      color: "#fff",
                      textAlign: "right",
                      lineHeight: 1.5,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {msg.content}
                  </motion.p>
                );
              }
            })}
          </AnimatePresence>

          {/* Breathing dots while waiting for first token */}
          {isStreaming && lastAiContent === "" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: theme ? theme.colors.primary : "rgba(255,255,255,0.4)",
                  }}
                  animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -4, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Ghost input */}
      <div className="absolute left-0 right-0 z-20 flex justify-center px-8" style={{ bottom: "64px" }}>
        <div style={{ maxWidth: 440, width: "100%" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={detectedMood ? "finding your music…" : "say something…"}
            disabled={isStreaming || !!detectedMood}
            className="ghost-input"
          />
        </div>
      </div>

      {/* Crystallise overlay */}
      <AnimatePresence>
        {phase === "crystallise" && detectedTheme && detectedMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: detectedTheme.colors.background }}
          >
            {/* Same blobs as PlayerScreen — visual continuity */}
            <div
              className="absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full blur-[160px] opacity-25 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${detectedTheme.colors.gradientFrom}, transparent 60%)`,
              }}
            />
            <div
              className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${detectedTheme.colors.gradientTo}, transparent 60%)`,
              }}
            />

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: 88, lineHeight: 1 }}
            >
              {detectedTheme.emoji}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 20,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                color: detectedTheme.colors.primary,
                textShadow: `0 0 60px ${detectedTheme.colors.primary}50`,
                letterSpacing: "-0.01em",
              }}
            >
              {detectedTheme.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 0.65, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 18,
                maxWidth: 480,
                textAlign: "center",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "1.15rem",
                color: "#fff",
                lineHeight: 1.65,
                padding: "0 24px",
              }}
            >
              {summary}
            </motion.p>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
