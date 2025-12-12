import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import LayeredBackground from "@/components/effects/LayeredBackground";
import SnowEffect from "@/components/effects/SnowEffect";
import FireworksEffect from "@/components/effects/FireworksEffect";
import ScanlineOverlay from "@/components/effects/ScanlineOverlay";

const pixelFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Secret Santa 2026",
  description: "A fun gift exchange game for friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} font-pixel antialiased`}>
        {/* Layered pixel art background */}
        <LayeredBackground />

        {/* Falling snow */}
        <SnowEffect density={60} />

        {/* Fireworks from island */}
        <FireworksEffect />

        {/* Main content */}
        <div className="relative z-10">{children}</div>

        {/* CRT overlay effects (on top) */}
        <ScanlineOverlay intensity="light" animated={true} />
      </body>
    </html>
  );
}
