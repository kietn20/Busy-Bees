import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- NEW: Import the Header component ---
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Busy Bee",
  description: "Collaborative study platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}