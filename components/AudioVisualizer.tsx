"use client";
import { useEffect, useRef } from "react";
import { EmotionTheme } from "@/types/emotion";

interface AudioVisualizerProps {
  isPlaying: boolean;
  theme: EmotionTheme;
  analyserRef: React.RefObject<AnalyserNode | null>;
}

const BAR_COUNT = 40;

export function AudioVisualizer({ isPlaying, theme, analyserRef }: AudioVisualizerProps) {
  const barsRef    = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef     = useRef<number | null>(null);
  const heightsRef = useRef<number[]>(Array(BAR_COUNT).fill(0.08));
  const targetsRef = useRef<number[]>(Array(BAR_COUNT).fill(0.08));
  const dataRef    = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    function tick() {
      const analyser = analyserRef.current;

      if (analyser && isPlaying) {
        // Real frequency data
        if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
          dataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataRef.current);
        const bins = dataRef.current;
        for (let i = 0; i < BAR_COUNT; i++) {
          const idx = Math.floor((i / BAR_COUNT) * bins.length);
          targetsRef.current[i] = Math.max(0.04, bins[idx] / 255);
        }
      } else if (isPlaying) {
        // Structured fake: bass / low-mid / mid / high-mid / treble bands
        const t = Date.now() / 1000;
        const bpm      = 118;
        const beat     = (t % (60 / bpm)) / (60 / bpm); // 0–1 per beat
        const pulse    = Math.pow(Math.sin(beat * Math.PI), 2); // smooth kick

        for (let i = 0; i < BAR_COUNT; i++) {
          const n = i / BAR_COUNT;
          let target: number;

          if (n < 0.2) {
            // Bass — beat-driven
            target = 0.18 + pulse * 0.65 + Math.sin(t * 2.8 + i) * 0.08;
          } else if (n < 0.45) {
            // Low-mid — melodic movement
            target = 0.22 + Math.sin(t * 1.4 + i * 0.9) * 0.28 + Math.random() * 0.12;
          } else if (n < 0.65) {
            // Mid — vocal steadiness
            target = 0.20 + Math.sin(t * 2.1 + i * 1.3) * 0.22 + pulse * 0.18;
          } else if (n < 0.82) {
            // High-mid — instrument sparkle
            target = 0.10 + Math.abs(Math.sin(t * 3.6 + i * 1.6)) * 0.25 + Math.random() * 0.14;
          } else {
            // Treble — shimmer
            target = 0.05 + Math.random() * 0.28 + pulse * 0.08;
          }

          targetsRef.current[i] = Math.max(0.04, Math.min(0.95, target));
        }
      } else {
        // Idle — low flat resting state
        for (let i = 0; i < BAR_COUNT; i++) {
          targetsRef.current[i] = 0.06 + ((i * 13) % 7) * 0.012;
        }
      }

      // Lerp current heights toward targets
      const speed = isPlaying ? 0.16 : 0.06;
      for (let i = 0; i < BAR_COUNT; i++) {
        heightsRef.current[i] += (targetsRef.current[i] - heightsRef.current[i]) * speed;
        const bar = barsRef.current[i];
        if (bar) bar.style.transform = `scaleY(${heightsRef.current[i]})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, analyserRef]);

  return (
    <div className="flex items-end gap-[3px] h-14 justify-center w-full px-4">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className="flex-1 rounded-full origin-bottom"
          style={{
            background: `linear-gradient(to top, ${theme.colors.primary}, ${theme.colors.accent})`,
            minWidth: 2,
            height: "100%",
            transform: "scaleY(0.08)",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
