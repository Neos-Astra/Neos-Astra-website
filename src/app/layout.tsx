import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import ClientLayout from "./components/ClientLayout";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neos Astra | School of Innovation",
  description: "Neos Astra - School of Innovation. Empowers students with STEM, Coding, and cutting-edge learning.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.jpg",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090C14] text-[#F3F6FB] min-h-screen">
        <SessionProvider>
            <SmoothScroll>
              <ClientLayout>
                {children}
              </ClientLayout>
            </SmoothScroll>
        </SessionProvider>
      </body>
    </html>
  );
}
