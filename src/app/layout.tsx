import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스마트 등교 대시보드",
  description: "초등학생을 위한 스마트 등교 대시보드 - 시간표, 급식, 날씨, 준비물을 한눈에!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
