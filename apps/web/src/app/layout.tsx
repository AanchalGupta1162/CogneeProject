import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import NotificationToast from "@/components/NotificationToast";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartTicket AI",
  description: "AI-powered bug tracking and automated assignment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <Providers>
          <Navigation />
          <main
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px 48px",
            }}
          >
            {children}
          </main>
          <NotificationToast />
        </Providers>
      </body>
    </html>
  );
}
