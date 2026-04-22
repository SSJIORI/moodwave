"use client";
import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { MoodSelectionScreen } from "@/components/MoodSelectionScreen";
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
    // Show player immediately with mock data
    const fallback = songsByMood[mood];
    setCurrentMood(mood);
    setPlaylist(fallback);
    setCurrentSong(fallback[0]);
    setShowMoodPicker(false);

    // Fetch real songs in background and swap in
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

  if (!currentMood || !currentSong) {
    return <MoodSelectionScreen onMoodSelect={handleMoodSelect} />;
  }

  return (
    <div className="relative">
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
          onLogoClick={() => { setCurrentMood(null); setCurrentSong(null); }}
        />
      </AnimatePresence>

      <PlaylistPanel
        isOpen={isPlaylistOpen}
        currentMood={currentMood}
        songs={playlist}
        currentSongId={currentSong.id}
        onSongSelect={(song) => { playerRef.current?.selectAndPlay(song); setIsPlaylistOpen(false); }}
        onShuffle={handleShuffle}
        onClose={() => setIsPlaylistOpen(false)}
      />

      <MoodSwitcher
        isOpen={showMoodPicker}
        currentMood={currentMood}
        onMoodSelect={handleMoodSelect}
        onClose={() => setShowMoodPicker(false)}
      />
    </div>
  );
}
