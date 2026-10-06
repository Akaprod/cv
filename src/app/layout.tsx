import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BRAND, DOMAIN } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND} — CV en ligne avec lien personnel`,
  description:
    `Créez un CV magnifique en quelques minutes, générez votre accroche avec l'IA et partagez votre lien personnel ${DOMAIN}/@vous. Gratuit pour commencer. FR · EN · ES · DE · IT.`,
  keywords: ["CV en ligne", "créer un CV", "générateur de CV", "CV IA", "resume builder", "CV QHSE", "CV métier"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: `${BRAND} — Votre CV en ligne, avec un lien personnel`,
    description: "CV en ligne avec lien personnel @pseudo, assistant IA, 5 modèles × 5 couleurs, branches métiers, multilingue.",
    siteName: BRAND,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
