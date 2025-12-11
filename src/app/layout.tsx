import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import SnowEffect from "@/components/effects/SnowEffect";

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
        <SnowEffect density={60} />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
