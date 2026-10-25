import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-noto-sans-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TNPSC Practice Platform",
  description: "Bilingual practice platform for TNPSC Group 4 and Group 2/2A Prelims with Spaced Repetition Mistake Vault.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoSansTamil.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
