import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_TC, Rubik } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_TC({ variable: "--font-noto", subsets: ["latin"], weight: ["400", "500", "700", "900"] });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"], weight: ["600", "700", "800", "900"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  const title = "地鼠快打｜60 秒限時挑戰";
  const description = "手機優先的 60 秒打地鼠遊戲，速度會隨時間逐步加快。";

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: imageUrl, width: 1200, height: 630, alt: "地鼠快打遊戲" }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${noto.variable} ${rubik.variable}`}>{children}</body>
    </html>
  );
}
