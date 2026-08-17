import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Webhook Hub | Enterprise Delivery Platform",
  description: "High-throughput distributed webhook event gateway and delivery engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-[#090d16] text-[#f8fafc] antialiased selection:bg-blue-600 selection:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}