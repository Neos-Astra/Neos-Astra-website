import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import ClientLayout from "./components/ClientLayout";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neos Astra | School of Innovation",
  description: "Neos Astra - School of Innovation. Empowers students with STEM, Coding, Robotics, AI, and cutting-edge learning.",
  metadataBase: new URL("https://neosastra.com"),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Neos Astra | School of Innovation",
    description: "Empowers students with STEM, Coding, Robotics, AI, and cutting-edge learning.",
    url: "https://neosastra.com",
    siteName: "Neos Astra",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "Neos Astra Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Neos Astra | School of Innovation",
    description: "Empowers students with STEM, Coding, Robotics, AI, and cutting-edge learning.",
    images: ["/logo.png"],
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
