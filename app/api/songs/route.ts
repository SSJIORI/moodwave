import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache<string, number[]>({ max: 500, ttl: 60 * 1000 });

const moodTags: Record<string, string> = {
  happy:   'happy',
  sad:     'sad',
  angry:   'angry',
  calm:    'calm',
  excited: 'energetic',
};

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const tokens = (rateLimit.get(ip) ?? [0]) as number[];
  if (tokens[0] > 20) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  rateLimit.set(ip, [tokens[0] + 1]);

  const { searchParams } = new URL(request.url);
  const mood     = searchParams.get('mood') ?? 'happy';
  const tag      = moodTags[mood] ?? 'happy';
  const clientId = process.env.JAMENDO_CLIENT_ID ?? 'cc7927d9';

  const url =
    `https://api.jamendo.com/v3.0/tracks/` +
    `?client_id=${clientId}` +
    `&format=json` +
    `&limit=6` +
    `&tags=${tag}` +
    `&audioformat=mp32` +
    `&imagesize=300` +
    `&order=popularity_total`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'Jamendo fetch failed' }, { status: 502 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  if (!data.results?.length) {
    return NextResponse.json({ error: 'No songs found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const songs = data.results.map((track: any) => ({
    id:         String(track.id),
    title:      track.name,
    artist:     track.artist_name,
    album:      track.album_name || 'Jamendo',
    duration:   fmt(track.duration ?? 0),
    coverUrl:   track.image || '',
    previewUrl: track.audio,
  }));

  return NextResponse.json(songs);
}
