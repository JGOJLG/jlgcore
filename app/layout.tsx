import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CompletedVisibilityControl from "./CompletedVisibilityControl";
import PasswordGate from "./PasswordGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JLG Core",
  description: "JLG Core",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PasswordGate />
        <CompletedVisibilityControl />
      </body>
    </html>
  );
}
