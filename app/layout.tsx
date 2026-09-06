import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinMate — 유학생을 위한 금융 동반자",
  description: "고지서 판독, 해외송금, 계좌개설, 보증금 검증까지 목적 기반으로 한도를 여는 유학생 금융 앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
