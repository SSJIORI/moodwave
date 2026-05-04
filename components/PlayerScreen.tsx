"use client";
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, ListMusic, Sparkles,
} from "lucide-react";
import { EmotionType, Song, emotionThemes } from "@/types/emotion";
import { AudioVisualizer } from "./AudioVisualizer";

interface PlayerScreenProps {
  currentMood: EmotionType;
  currentSong: Song;
  playlist: Song[];
  onMoodChange: () => void;
  onTogglePlaylist: () => void;
  onSongChange: (song: Song) => void;
  onLogoClick: () => void;
}

export interface PlayerScreenHandle {
  selectAndPlay: (song: Song) => void;
}

export const PlayerScreen = forwardRef<PlayerScreenHandle, PlayerScreenProps>(function PlayerScreen({
  currentMood,
  currentSong,
  playlist,
  onMoodChange,
  onTogglePlaylist,
  onSongChange,
  onLogoClick,
}, ref) {
  const theme = emotionThemes[currentMood];
  const [isPlaying, setIsPlaying]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [duration, setDuration]       = useState(0);
  const [currentSecs, setCurrentSecs] = useState(0);
  const [volume, setVolume]           = useState(70);
  const [isMuted, setIsMuted]         = useState(false);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoPlayRef     = useRef(false);
  const isMountedRef    = useRef(true);
  const onSongChangeRef = useRef(onSongChange);
  const playlistRef     = useRef(playlist);
  const currentSongRef  = useRef(currentSong);

  useImperativeHandle(ref, () => ({
    selectAndPlay(song: Song) {
      autoPlayRef.current = true;
      onSongChangeRef.current(song);
    },
  }));

  useEffect(() => { onSongChangeRef.current = onSongChange; }, [onSongChange]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // Create Audio element once and wire persistent listeners
  useEffect(() => {
    isMountedRef.current = true; // reset here so StrictMode remount sees true
    const audio = new Audio();
    audio.volume = 0.7;
    audio.preload = "metadata";
    audioRef.current = audio;
    autoPlayRef.current = true; // always auto-play the first song on mount

    const onTimeUpdate = () => {
      if (!isMountedRef.current || !audio.duration) return;
      setCurrentSecs(Math.floor(audio.currentTime));
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoaded = () => {
      if (!isMountedRef.current) return;
      setDuration(Math.floor(audio.duration));
    };
    const onEnded = () => {
      if (!isMountedRef.current) return;
      autoPlayRef.current = true;
      const pl  = playlistRef.current;
      const cur = currentSongRef.current;
      const idx = pl.findIndex((s) => s.id === cur.id);
      onSongChangeRef.current(pl[(idx + 1) % pl.length]);
    };

    audio.addEventListener("timeupdate",     onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended",          onEnded);

    return () => {
      isMountedRef.current = false;
      audio.pause();
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended",          onEnded);
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new track when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setProgress(0); setCurrentSecs(0); setDuration(0);

    if (!currentSong.previewUrl) {
      audio.pause();
      setIsPlaying(false);
      return;
      // autoPlayRef is NOT consumed — preserved for when real songs arrive
    }

    const shouldAutoPlay = autoPlayRef.current;
    autoPlayRef.current  = false;

    audio.src = currentSong.previewUrl;

    if (shouldAutoPlay) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.load();
      setIsPlaying(false);
    }
  }, [currentSong.id, currentSong.previewUrl]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume / mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted  = isMuted;
    audio.volume = volume / 100;
  }, [volume, isMuted]);

  const handlePrev = useCallback(() => {
    autoPlayRef.current = true;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    onSongChange(playlist[(idx - 1 + playlist.length) % playlist.length]);
  }, [playlist, currentSong, onSongChange]);

  const handleNext = useCallback(() => {
    autoPlayRef.current = true;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    onSongChange(playlist[(idx + 1) % playlist.length]);
  }, [playlist, currentSong, onSongChange]);

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    setProgress(value);
    if (audio?.duration) audio.currentTime = (value / 100) * audio.duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const effectiveVol = isMuted ? 0 : volume;

  return (
    <motion.div
      key={currentMood}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* ── Ambient background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full blur-[160px] opacity-25"
          style={{ background: `radial-gradient(circle, ${theme.colors.gradientFrom}, transparent 60%)` }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-15"
          style={{ background: `radial-gradient(circle, ${theme.colors.gradientTo}, transparent 60%)` }}
        />
      </div>

      {/* ── Header ── */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={onLogoClick}
          className="text-white hover:text-white/70 transition-colors duration-200"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "30px" }}
        >
          MoodWave
        </button>
      </div>

      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        <motion.div
          key={currentMood}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center flex-shrink-0"
          style={{
            height: "50.45px",
            padding: "10px 20px",
            gap: "7.982px",
            borderRadius: "9999px",
            border: `1.24px solid ${theme.colors.primary}40`,
            background: `${theme.colors.primary}21`,
            color: theme.colors.primary,
          }}
        >
          <span>{theme.emoji}</span>
          <span className="text-sm font-medium">{theme.name}</span>
        </motion.div>

        <button
          onClick={onTogglePlaylist}
          className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Open playlist"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-[480px] flex flex-col items-center gap-4">

          {/* Album Art */}
          <div className="relative flex items-center justify-center flex-shrink-0"
            style={{ width: "clamp(180px, 22vh, 260px)", height: "clamp(180px, 22vh, 260px)" }}
          >
            <div
              className="absolute"
              style={{
                width: "320px", height: "320px",
                borderRadius: "24.71px", opacity: 0.42,
                background: `linear-gradient(135deg, ${theme.colors.gradientFrom} 0%, ${theme.colors.gradientTo} 100%)`,
                filter: "blur(65.8924789428711px)", pointerEvents: "none",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSong.id}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex-shrink-0"
                style={{
                  width: "clamp(180px, 22vh, 260px)",
                  height: "clamp(180px, 22vh, 260px)",
                  borderRadius: "24px",
                  border: `3.72px solid ${theme.colors.primary}61`,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: "20px" }}>
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.gradientFrom}50, ${theme.colors.gradientTo}30)`,
                      mixBlendMode: "overlay",
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Song info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSong.id + "-info"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-1"
            >
              <h2
                className="font-bold tracking-tight"
                style={{
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  fontFamily: "'Georgia', serif",
                  color: "#ffffff",
                }}
              >
                {currentSong.title}
              </h2>
              <p className="text-white/50 text-sm">{currentSong.artist}</p>
              <p className="text-white/25 text-xs">{currentSong.album}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <div className="relative w-full h-1.5 group cursor-pointer">
              <div className="absolute inset-0 rounded-full bg-white/10" />
              <div
                className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(to right, ${theme.colors.gradientFrom}, ${theme.colors.primary})`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progress}%`, backgroundColor: theme.colors.primary }}
              />
              <input
                type="range" min={0} max={100} value={progress}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-white/30 text-xs">
              <span>{fmt(currentSecs)}</span>
              <span>{duration > 0 ? fmt(duration) : currentSong.duration}</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white transition-all duration-200"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gradientFrom}, ${theme.colors.gradientTo})`,
                boxShadow: `0 0 40px ${theme.colors.primary}60`,
              }}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.12 }}>
                    <Pause className="w-8 h-8 text-white" fill="currentColor" strokeWidth={0} />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.12 }}>
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" strokeWidth={0} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white transition-all duration-200"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full max-w-[280px]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="relative flex-1 h-1 group cursor-pointer">
              <div className="absolute inset-0 rounded-full bg-white/10" />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${effectiveVol}%`, background: theme.colors.primary }}
              />
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-white/20 text-xs w-7 text-right flex-shrink-0">{effectiveVol}</span>
          </div>

          {/* Visualizer */}
          <div className="w-full">
            <AudioVisualizer isPlaying={isPlaying} theme={theme} analyserRef={analyserRef} />
          </div>

        </div>
      </main>

      {/* Change Mood */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onMoodChange}
          className="flex items-center flex-shrink-0 text-white font-semibold text-sm"
          style={{
            width: "181px", height: "54px",
            padding: "14px 24px 14px 23.775px",
            gap: "7.979px", borderRadius: "9999px",
            border: `1.24px solid ${theme.colors.gradientFrom}61`,
            background: `linear-gradient(135deg, ${theme.colors.gradientFrom}80 0%, ${theme.colors.gradientTo}80 100%)`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Sparkles className="w-5 h-5" />
          Change Mood
        </motion.button>
      </div>
    </motion.div>
  );
});
