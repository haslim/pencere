import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem SaaS - PVC & Alüminyum Pencere Otomasyonu",
  description: "PVC pencere ve kapı imalat hesaplama, 1D kesim optimizasyonu ve müşteri teklif otomasyonu.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sistem SaaS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased selection:bg-blue-500 selection:text-white`}
    >
      <body className="min-h-full flex flex-col font-sans touch-manipulation">{children}</body>
    </html>
  );
}
