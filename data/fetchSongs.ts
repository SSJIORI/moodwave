import { Song, EmotionType } from "@/types/emotion";

export async function fetchSongsByMood(mood: EmotionType): Promise<Song[]> {
  const res = await fetch(`/api/songs?mood=${mood}`);
  if (!res.ok) throw new Error("Songs fetch failed");
  const songs: Song[] = await res.json();
  return songs;
}
