"use client";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatScreen } from "@/components/ChatScreen";
import { PlayerScreen, PlayerScreenHandle } from "@/components/PlayerScreen";
import { PlaylistPanel } from "@/components/PlaylistPanel";
import { MoodSwitcher } from "@/components/MoodSwitcher";
import { EmotionType, Song } from "@/types/emotion";
import { songsByMood } from "@/data/mockSongs";
import { fetchSongsByMood } from "@/data/fetchSongs";

export default function Home() {
  const playerRef = useRef<PlayerScreenHandle>(null);
  const [currentMood, setCurrentMood] = useState<EmotionType | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const handleMoodSelect = (mood: EmotionType) => {
    const fallback = songsByMood[mood];
    setCurrentMood(mood);
    setPlaylist(fallback);
    setCurrentSong(fallback[0]);
    setShowMoodPicker(false);

    fetchSongsByMood(mood)
      .then((songs) => {
        if (songs.length > 0) {
          setPlaylist(songs);
          setCurrentSong(songs[0]);
        }
      })
      .catch(() => {
        // keep mock data on error
      });
  };

  const handleSongChange = (song: Song) => {
    setCurrentSong(song);
    setIsPlaylistOpen(false);
  };

  const handleShuffle = () => {
    if (playlist.length === 0) return;
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);
    setPlaylist(shuffled);
    playerRef.current?.selectAndPlay(shuffled[0]);
    setIsPlaylistOpen(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      {/* ChatScreen and PlayerScreen cross-fade simultaneously */}
      <AnimatePresence>
        {!currentMood && (
          <motion.div
            key="chat"
            style={{ position: "fixed", inset: 0 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85 }}
          >
            <ChatScreen onMoodSelect={handleMoodSelect} />
          </motion.div>
        )}

        {currentMood && currentSong && (
          <motion.div
            key={currentMood}
            style={{ position: "fixed", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <PlayerScreen
                ref={playerRef}
                key={currentMood}
                currentMood={currentMood}
                currentSong={currentSong}
                playlist={playlist}
                onMoodChange={() => setShowMoodPicker(true)}
                onTogglePlaylist={() => setIsPlaylistOpen((o) => !o)}
                onSongChange={handleSongChange}
                onLogoClick={() => {
                  setCurrentMood(null);
                  setCurrentSong(null);
                }}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panels live above both screens */}
      {currentMood && currentSong && (
        <>
          <PlaylistPanel
            isOpen={isPlaylistOpen}
            currentMood={currentMood}
            songs={playlist}
            currentSongId={currentSong.id}
            onSongSelect={(song) => {
              playerRef.current?.selectAndPlay(song);
              setIsPlaylistOpen(false);
            }}
            onShuffle={handleShuffle}
            onClose={() => setIsPlaylistOpen(false)}
          />
          <MoodSwitcher
            isOpen={showMoodPicker}
            currentMood={currentMood}
            onMoodSelect={handleMoodSelect}
            onClose={() => setShowMoodPicker(false)}
          />
        </>
      )}
    </div>
  );
}
