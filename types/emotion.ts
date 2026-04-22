export type EmotionType = "happy" | "sad" | "angry" | "calm" | "excited";

export interface EmotionTheme {
  name: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    gradientFrom: string;
    gradientTo: string;
  };
  animation: {
    duration: number;
    intensity: "slow" | "medium" | "fast";
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  previewUrl?: string;
  videoId?: string;
}

export const emotionThemes: Record<EmotionType, EmotionTheme> = {
  happy: {
    name: "Happy",
    emoji: "😊",
    colors: {
      primary: "#FDB813",
      secondary: "#FF9500",
      accent: "#FFCC00",
      background: "#1a1200",
      gradientFrom: "#FDB813",
      gradientTo: "#FF6B00",
    },
    animation: { duration: 0.6, intensity: "fast" },
  },
  sad: {
    name: "Sad",
    emoji: "😢",
    colors: {
      primary: "#5B7C99",
      secondary: "#8B7BA8",
      accent: "#A8C5E2",
      background: "#0a0e1a",
      gradientFrom: "#5B7C99",
      gradientTo: "#6B5B95",
    },
    animation: { duration: 1.2, intensity: "slow" },
  },
  angry: {
    name: "Angry",
    emoji: "😠",
    colors: {
      primary: "#FF3030",
      secondary: "#1C1C1C",
      accent: "#FF5252",
      background: "#0d0000",
      gradientFrom: "#D32F2F",
      gradientTo: "#8B0000",
    },
    animation: { duration: 0.4, intensity: "fast" },
  },
  calm: {
    name: "Calm",
    emoji: "😌",
    colors: {
      primary: "#8BA888",
      secondary: "#C8D5B9",
      accent: "#A8DADC",
      background: "#0a120a",
      gradientFrom: "#8BA888",
      gradientTo: "#A8DADC",
    },
    animation: { duration: 3.0, intensity: "slow" },
  },
  excited: {
    name: "Excited",
    emoji: "🤩",
    colors: {
      primary: "#00D9FF",
      secondary: "#FF00FF",
      accent: "#00FFAA",
      background: "#0a001a",
      gradientFrom: "#00D9FF",
      gradientTo: "#FF00FF",
    },
    animation: { duration: 0.3, intensity: "fast" },
  },
};