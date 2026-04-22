"use client";
import { motion, AnimatePresence } from "framer-motion";
import { EmotionType, emotionThemes } from "@/types/emotion";

interface MoodSwitcherProps {
  isOpen: boolean;
  currentMood: EmotionType;
  onMoodSelect: (mood: EmotionType) => void;
  onClose: () => void;
}

const moods: EmotionType[] = ["happy", "sad", "angry", "calm", "excited"];

export function MoodSwitcher({
  isOpen,
  currentMood,
  onMoodSelect,
  onClose,
}: MoodSwitcherProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent backdrop to catch outside clicks */}
          <motion.div
            key="ms-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Pill — positioned above the Change Mood button */}
          <motion.div
            key="ms-pill"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
            style={{
              bottom: "calc(32px + 54px + 14px)",
              width: "354px",
              height: "82px",
              borderRadius: "9999px",
              border: "1.24px solid rgba(255, 255, 255, 0.20)",
              background: "rgba(0, 0, 0, 0.60)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              gap: "10px",
            }}
          >
            {moods.map((type) => {
              const theme = emotionThemes[type];
              const isActive = type === currentMood;

              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { onMoodSelect(type); onClose(); }}
                  className="flex justify-center items-center flex-shrink-0"
                  style={{
                    width: isActive ? "61.6px" : "56px",
                    height: isActive ? "61.6px" : "56px",
                    borderRadius: "9999px",
                    background: isActive
                      ? `linear-gradient(135deg, ${theme.colors.gradientFrom} 0%, ${theme.colors.gradientTo} 100%)`
                      : `${theme.colors.gradientFrom}30`,
                    boxShadow: isActive
                      ? "0 0 0 2.2px rgba(255, 255, 255, 0.40)"
                      : "none",
                    transition: "width 0.2s ease, height 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: isActive ? "1.75rem" : "1.5rem" }}>
                    {theme.emoji}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
