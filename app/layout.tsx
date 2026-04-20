import type { Metadata } from "next";
import { Geist, Geist_Mono, Exo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Atlas",
  description: "Real-time geopolitical intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${exo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
