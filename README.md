# MoodWave

An emotion-responsive music player that detects your mood through a short AI conversation, then curates a playlist and adapts its entire visual theme to match how you feel.

**Live → [moodwave-76a5wlmpb-francines-projects-2c4465f0.vercel.app](https://moodwave-76a5wlmpb-francines-projects-2c4465f0.vercel.app)**

---

## How it works

1. **Chat** — An AI companion asks you an open-ended question about how you're feeling. It takes at most two exchanges to understand your mood.
2. **Detect** — The app parses hidden mood signals from the streamed AI response in real time. The background colour shifts as soon as a signal is read, before the conversation even ends.
3. **Crystallise** — A full-screen transition confirms the detected emotion (happy, sad, angry, calm, or excited).
4. **Play** — A playlist of royalty-free tracks matching your mood is fetched from the Jamendo API. The player's colours, gradients, and animation speed all reflect the detected emotion.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion 12 |
| Primary AI | Google Gemini 2.5 Flash (streaming SSE) |
| Fallback AI | Groq Llama 3.1 8B / OpenRouter Gemma 2 9B |
| Music | Jamendo API v3 (royalty-free, mood-tagged) |
| Deployment | Vercel |
| Language | TypeScript 5 |

---

## Project structure

```
app/
  page.tsx              # Root — screen transitions and shared state
  layout.tsx            # HTML shell, fonts, desktop-only gate
  api/
    chat/route.ts       # Proxies Gemini (+ fallback) with SSE streaming
    songs/route.ts      # Fetches Jamendo tracks by mood tag, rate-limited
components/
  ChatScreen.tsx        # Conversational mood elicitation UI
  PlayerScreen.tsx      # Music player with emotion-adaptive theme
  PlaylistPanel.tsx     # Slide-over playlist drawer
  AudioVisualizer.tsx   # Animated SVG waveform bars
  MoodSwitcher.tsx      # Manual mood override picker
types/
  emotion.ts            # EmotionType union + full theme definitions per mood
data/
  fetchSongs.ts         # Jamendo API client
  mockSongs.ts          # Immediate fallback playlist data
```

---

## Running locally

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/SSJIORI/moodwave.git
cd moodwave
npm install
```

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key        # Required — get from aistudio.google.com
OPENROUTER_API_KEY=your_key_here          # Optional fallback (OpenRouter or Groq)
JAMENDO_CLIENT_ID=your_jamendo_client_id  # Optional — defaults to a public key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is desktop-only (≥ 1024px).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash |
| `OPENROUTER_API_KEY` | No | OpenRouter key (any model) or Groq key (starts with `gsk_`) — used as automatic fallback |
| `JAMENDO_CLIENT_ID` | No | Jamendo developer client ID — a default public key is used if omitted |

---

## Deploying

The project is pre-configured for Vercel. Push to GitHub and import the repo, or use the CLI:

```bash
npm i -g vercel
vercel --yes
```

Then add your environment variables in **Vercel → Settings → Environment Variables** and redeploy.
