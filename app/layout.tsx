import type { Metadata } from "next";
import { Manrope, Press_Start_2P } from "next/font/google";
import "./globals.scss";

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin", "cyrillic"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Value Quest",
  description: "Стартовый экран браузерной игры про корпоративные ценности.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${pressStart2P.variable}`}>
      <body>{children}</body>
    </html>
  );
}
