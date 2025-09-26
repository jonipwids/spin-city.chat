import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ChatProvider } from "@/contexts/ChatContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Customer Service Portal",
  description: "Telegram-inspired customer service chat interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <SettingsProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
