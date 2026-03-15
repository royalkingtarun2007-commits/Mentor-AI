"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Only run on client, only if token exists
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (token) {
      checkAuth();
    } else {
      setUser(null);
    }
  }, [checkAuth, setUser]);

  return (
    <html lang="en">
      <head>
        <title>MentorAI — Chat with your notes</title>
        <meta name="description" content="AI-powered knowledge assistant. Save notes, ask questions, get answers from your own knowledge base." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#030308", color: "#f0f0ff" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
