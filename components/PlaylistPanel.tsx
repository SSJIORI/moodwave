"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shuffle } from "lucide-react";
import { EmotionType, Song, emotionThemes } from "@/types/emotion";

interface PlaylistPanelProps {
  isOpen: boolean;
  currentMood: EmotionType;
  songs: Song[];
  currentSongId: string;
  onSongSelect: (song: Song) => void;
  onShuffle: () => void;
  onClose: () => void;
}

export function PlaylistPanel({
  isOpen,
  currentMood,
  songs,
  currentSongId,
  onSongSelect,
  onShuffle,
  onClose,
}: PlaylistPanelProps) {
  const theme = emotionThemes[currentMood];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="pl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Slide-in panel */}
          <motion.div
            key="pl-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 z-50 flex flex-col overflow-hidden"
            style={{
              width: "480px",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.60)",
              backdropFilter: "blur(40px)",
              borderLeft: "1.24px solid rgba(255, 255, 255, 0.10)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Top container — header + shuffle */}
            <div
              className="flex-shrink-0 flex flex-col items-start"
              style={{
                width: "479px",
                padding: "24.149px 24px 16.216px 24px",
                gap: "16.216px",
                borderBottom: "1.24px solid rgba(255, 255, 255, 0.10)",
              }}
            >
              {/* Title row */}
              <div className="flex items-start justify-between w-full">
                <h3 className="text-white text-lg font-semibold leading-snug">
                  Songs for when you&apos;re{" "}
                  <span style={{ color: theme.colors.primary }}>{theme.name}</span>
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shuffle button — full width pill */}
              <button
                onClick={onShuffle}
                className="flex justify-center items-center self-stretch"
                style={{
                  padding: "9.277px 0 12.723px 0",
                  gap: "5.982px",
                  borderRadius: "9999px",
                  border: `1.24px solid ${theme.colors.primary}40`,
                  background: `${theme.colors.primary}21`,
                  color: theme.colors.primary,
                }}
              >
                <Shuffle className="w-4 h-4" />
                <span className="text-sm font-medium">Shuffle by Mood</span>
              </button>
            </div>

            {/* Song list container */}
            <div
              className="flex flex-col items-start flex-shrink-0 self-stretch overflow-y-auto"
              style={{
                padding: "16.126px 16px 0 16px",
                gap: "8.437px",
              }}
            >
              {songs.map((song, index) => {
                const isActive = song.id === currentSongId;
                return (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    onClick={() => onSongSelect(song)}
                    className="flex justify-center items-center flex-shrink-0 self-stretch text-left"
                    style={{
                      height: "74px",
                      padding: "13px 13.5px",
                      gap: "12.167px",
                      borderRadius: "14px",
                      border: isActive
                        ? `1.24px solid ${theme.colors.primary}61`
                        : "1.24px solid rgba(255, 255, 255, 0.05)",
                      background: isActive
                        ? `${theme.colors.primary}14`
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {/* Cover */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.gradientFrom}40, transparent)`,
                            mixBlendMode: "overlay",
                          }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate text-sm leading-snug"
                        style={{
                          color: isActive ? theme.colors.primary : "rgba(255,255,255,0.85)",
                        }}
                      >
                        {song.title}
                      </p>
                      <p className="text-white/40 text-xs truncate mt-0.5">
                        {song.artist}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="text-white/30 text-xs font-mono flex-shrink-0">
                      {song.duration}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
