import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capsule Learning Platform",
  description: "Platform e-learning adaptasi mahasiswa farmasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/mascot/mascot capsule.webp" as="image" />
        <link rel="preload" href="/logo/logo capsule.png" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="page-shell">
          <Header />
          <main className="site-main page-wrap">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
