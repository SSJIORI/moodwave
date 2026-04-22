import { Song, EmotionType } from "@/types/emotion";

export const songsByMood: Record<EmotionType, Song[]> = {
  happy: [
    {
      id: "h1",
      title: "Good Vibes",
      artist: "Sunshine Band",
      album: "Uplifting Moments",
      duration: "3:45",
      coverUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    },
    {
      id: "h2",
      title: "Dancing Days",
      artist: "Happy Feet",
      album: "Pure Joy",
      duration: "4:12",
      coverUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
    },
    {
      id: "h3",
      title: "Sunrise Energy",
      artist: "Morning Crew",
      album: "Bright Start",
      duration: "3:28",
      coverUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
    },
    {
      id: "h4",
      title: "Feel the Beat",
      artist: "Joyful Noise",
      album: "Celebration",
      duration: "4:01",
      coverUrl:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&q=80",
    },
    {
      id: "h5",
      title: "Summer Bounce",
      artist: "The Radiance",
      album: "Golden Hours",
      duration: "3:55",
      coverUrl:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80",
    },
    {
      id: "h6",
      title: "Let's Go",
      artist: "Peak Energy",
      album: "Momentum",
      duration: "3:18",
      coverUrl:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80",
    },
  ],
  sad: [
    {
      id: "s1",
      title: "Rainy Window",
      artist: "Mellow Soul",
      album: "Quiet Tears",
      duration: "5:02",
      coverUrl:
        "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=500&q=80",
    },
    {
      id: "s2",
      title: "Empty Halls",
      artist: "Blue Echo",
      album: "Solitude",
      duration: "4:45",
      coverUrl:
        "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=500&q=80",
    },
    {
      id: "s3",
      title: "Fading Light",
      artist: "The Dusk",
      album: "Twilight Hours",
      duration: "4:33",
      coverUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
    },
    {
      id: "s4",
      title: "Missing You",
      artist: "Distant Shores",
      album: "Gone Away",
      duration: "3:58",
      coverUrl:
        "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500&q=80",
    },
    {
      id: "s5",
      title: "Broken Chords",
      artist: "Minor Keys",
      album: "Sorrow Suite",
      duration: "5:14",
      coverUrl:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&q=80",
    },
    {
      id: "s6",
      title: "Old Letters",
      artist: "Nostalgic",
      album: "Memories",
      duration: "4:20",
      coverUrl:
        "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=500&q=80",
    },
  ],
  angry: [
    {
      id: "a1",
      title: "Rage Protocol",
      artist: "Iron Fist",
      album: "No Mercy",
      duration: "3:12",
      coverUrl:
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80",
    },
    {
      id: "a2",
      title: "Break the Walls",
      artist: "Shatter Point",
      album: "Demolition",
      duration: "2:58",
      coverUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    },
    {
      id: "a3",
      title: "Controlled Fury",
      artist: "Tempest",
      album: "Storm Rising",
      duration: "3:45",
      coverUrl:
        "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=500&q=80",
    },
    {
      id: "a4",
      title: "Blood Pressure",
      artist: "The Red Line",
      album: "Critical Mass",
      duration: "3:29",
      coverUrl:
        "https://images.unsplash.com/photo-1493225255440-71e6d4173832?w=500&q=80",
    },
    {
      id: "a5",
      title: "Detonation",
      artist: "Ground Zero",
      album: "Impact",
      duration: "2:44",
      coverUrl:
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    },
    {
      id: "a6",
      title: "Scorched Earth",
      artist: "Inferno",
      album: "Burn It Down",
      duration: "4:01",
      coverUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    },
  ],
  calm: [
    {
      id: "c1",
      title: "Morning Mist",
      artist: "Serene Waves",
      album: "Still Water",
      duration: "6:12",
      coverUrl:
        "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&q=80",
    },
    {
      id: "c2",
      title: "Forest Breathe",
      artist: "Nature Sound",
      album: "Green Canopy",
      duration: "7:30",
      coverUrl:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80",
    },
    {
      id: "c3",
      title: "Gentle Rain",
      artist: "Ambient Drift",
      album: "Soft Patterns",
      duration: "8:15",
      coverUrl:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80",
    },
    {
      id: "c4",
      title: "Still Pond",
      artist: "Quiet Mind",
      album: "Inner Peace",
      duration: "5:44",
      coverUrl:
        "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=500&q=80",
    },
    {
      id: "c5",
      title: "Dusk Breeze",
      artist: "Twilight Tone",
      album: "Evening Ritual",
      duration: "6:08",
      coverUrl:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80",
    },
    {
      id: "c6",
      title: "Slow Exhale",
      artist: "Breathwork",
      album: "Reset",
      duration: "9:00",
      coverUrl:
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80",
    },
  ],
  excited: [
    {
      id: "e1",
      title: "Neon Rush",
      artist: "Voltage",
      album: "Electric Dreams",
      duration: "3:22",
      coverUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&q=80",
    },
    {
      id: "e2",
      title: "Hyperdrive",
      artist: "Quantum Beat",
      album: "Warp Speed",
      duration: "2:58",
      coverUrl:
        "https://images.unsplash.com/photo-1550684376-efbf4a9c6630?w=500&q=80",
    },
    {
      id: "e3",
      title: "Laser Focus",
      artist: "Synthetic High",
      album: "Neural Link",
      duration: "3:44",
      coverUrl:
        "https://images.unsplash.com/photo-1549013927-e4a9d52ea4db?w=500&q=80",
    },
    {
      id: "e4",
      title: "Drop Zone",
      artist: "Bass Cannon",
      album: "Freefall",
      duration: "3:10",
      coverUrl:
        "https://images.unsplash.com/photo-1493225255440-71e6d4173832?w=500&q=80",
    },
    {
      id: "e5",
      title: "Into the Grid",
      artist: "Cyber Wave",
      album: "Digital Pulse",
      duration: "4:05",
      coverUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    },
    {
      id: "e6",
      title: "Maximum Overdrive",
      artist: "Supercollider",
      album: "Apex",
      duration: "3:33",
      coverUrl:
        "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=500&q=80",
    },
  ],
};