import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ConditionalHeader from "@/components/ConditionalHeader";

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
      <body>
        <AuthProvider>
          <ConditionalHeader />
          <main>{children}</main>
          <Toaster position="bottom-right"/>
        </AuthProvider>
      </body>
    </html>
  );
}
