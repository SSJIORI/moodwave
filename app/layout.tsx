import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodWave – Emotion-Responsive Music Player",
  description:
    "An immersive music player that adapts its theme and playlist to your emotional state.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black antialiased">
        {/* Desktop-only gate */}
        <div className="lg:hidden fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-6 px-8 text-center">
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "28px", color: "#ffffff" }}>
            MoodWave
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            MoodWave is designed for desktop screens. Please open it on a larger display for the best experience.
          </p>
        </div>
        {/* App — hidden on small screens */}
        <div className="hidden lg:block">{children}</div>
      </body>
    </html>
  );
}