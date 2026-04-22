"use client";
import { motion } from "framer-motion";
import { Smile, Frown, Flame, Sparkles, Heart } from "lucide-react";
import { EmotionType, emotionThemes } from "@/types/emotion";

interface MoodSelectionScreenProps {
  onMoodSelect: (mood: EmotionType) => void;
}

const moods: {
  type: EmotionType;
  icon: React.ElementType;
  label: string;
  desc: string;
}[] = [
  { type: "happy",   icon: Smile,    label: "Happy",   desc: "Upbeat & joyful"      },
  { type: "sad",     icon: Frown,    label: "Sad",     desc: "Melancholic & deep"   },
  { type: "angry",   icon: Flame,    label: "Angry",   desc: "Intense & raw"        },
  { type: "calm",    icon: Heart,    label: "Calm",    desc: "Peaceful & serene"    },
  { type: "excited", icon: Sparkles, label: "Excited", desc: "Energetic & electric" },
];

export function MoodSelectionScreen({ onMoodSelect }: MoodSelectionScreenProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black" style={{ backgroundImage: "radial-gradient(62.51% 83.32% at 50% 50%, rgba(120, 119, 198, 0.10) 0%, rgba(0, 0, 0, 0.00) 50%)" }}>
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo — same absolute placement as PlayerScreen */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8 z-20"
      >
        <span
          className="text-white"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "30px" }}
        >
          MoodWave
        </span>
      </motion.div>

      <div className="w-full h-full max-w-[1440px] flex flex-col items-center justify-center relative px-8">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,80,180,0.08),transparent)]" />

        {/* Text group */}
        <div className="relative z-10 flex flex-col items-center" style={{ gap: "12px", marginBottom: "64px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white leading-tight tracking-tight"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
            }}
          >
            How are you feeling right now?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/60 text-sm tracking-wide text-center"
          >
            Select your mood and let the music match your emotion
          </motion.p>
        </div>

        {/* Mood Cards */}
        <div className="relative z-10 flex flex-nowrap justify-center items-start gap-6 w-full max-w-[954px]">
          {moods.map((mood, index) => {
            const theme = emotionThemes[mood.type];
            const Icon = mood.icon;
            return (
              <motion.button
                key={mood.type}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.4 + index * 0.08,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -10, scale: 1.04, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onMoodSelect(mood.type)}
                className="group relative flex-shrink-0 w-[172px] h-[246px] cursor-pointer flex flex-col items-start overflow-hidden"
                style={{
                  padding: "41.2px 41.2px 1.24px 41.2px",
                  borderRadius: "24px",
                  border: "1.24px solid rgba(255, 255, 255, 0.10)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = theme.colors.primary + "50";
                  el.style.boxShadow = `0 0 40px ${theme.colors.primary}22`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1.24px solid rgba(255, 255, 255, 0.10)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Inner hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${theme.colors.primary}12, transparent 70%)`,
                  }}
                />

                {/* Inner content container — h:163.944px, align-self:stretch, flex-shrink:0 */}
                <div className="relative z-10 flex flex-col items-center justify-center self-stretch flex-shrink-0 h-[164px] gap-3">

                  {/* Emoji container — inline-flex, padding:0 11.4px 3.9px 11px, border-radius:104px, border:3.39px */}
                  <div
                    className="inline-flex justify-center items-center self-stretch select-none"
                    style={{ padding: "0 11.4px 3.9px 11px" }}
                  >
                    <span className="text-5xl">{theme.emoji}</span>
                  </div>

                  {/* Icon */}
                  <Icon className="w-6 h-6" stroke="white" strokeOpacity={0.6} />

                  {/* Label wrapper — inline-flex, justify-center, align-center, padding:0 16.7px */}
                  <div
                    className="inline-flex justify-center items-center self-stretch"
                    style={{ padding: "0 16.7px" }}
                  >
                    <span className="text-white font-semibold text-sm">{mood.label}</span>
                  </div>

                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 transition-all duration-300 rounded-full"
                  style={{ background: theme.colors.primary }}
                />
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-10 text-white/20 text-xs tracking-[0.2em] uppercase"
        >
          Emotion-Responsive Music · MoodWave
        </motion.p>
      </div>
    </div>
  );
}