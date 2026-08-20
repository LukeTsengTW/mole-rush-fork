import type { Metadata } from "next";
import { Noto_Sans_TC, Rubik } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "地鼠快打｜60 秒限時挑戰",
  description: "手機優先的 60 秒打地鼠遊戲，速度會隨時間逐步加快。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${noto.variable} ${rubik.variable}`}>
        {children}
      </body>
    </html>
  );
}
