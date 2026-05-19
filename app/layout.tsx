"use client";

import React from "react";
import "./globals.css";

import Footer from "@/components/marketing/Footer";
import NavBarContainer from "@/components/NavBarContainer";
import BroadcastNotificationOverlay from "@/components/dashboard/BroadcastNotificationOverlay";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en-KE" 
      className="h-full bg-white font-sans" 
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white text-zinc-900 antialiased font-sans">
        <AuthProvider>
          {/* Stateless background listener processing medical telemetry chimes globally */}
          <BroadcastNotificationOverlay />
          
          <Toaster 
            position="top-center" 
            richColors 
            expand={false}
            closeButton 
            toastOptions={{
              style: {
                borderRadius: '1rem',
                padding: '1rem',
              },
              className: "font-bold uppercase text-[10px] tracking-widest",
            }}
          />
          
          <div className="relative flex flex-col min-h-screen overflow-x-hidden">
            <NavBarContainer />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
