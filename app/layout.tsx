import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import AuthGate from "./AuthGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displaySerif = Instrument_Serif({
  variable: "--font-display-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe7" },
    { media: "(prefers-color-scheme: dark)", color: "#111412" },
  ],
};

export const metadata: Metadata = {
  title: "JLG Core",
  description: "Private dashboard for the JLG ecosystem.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  applicationName: "JLG Core",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "JLG Core",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
