import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SecureSDLC Guardian | Security at Every Phase",
  description: "Comprehensive security platform covering every SDLC phase — from architecture to deployment. Auth, API, secrets, compliance, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider>
          <div className="scanline-overlay" />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}