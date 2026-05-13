import type { Metadata, Viewport } from "next";
import { Ubuntu, Geist } from "next/font/google";
import "./globals.css";

import Footer from "@/components/marketing/Footer";
import NavBarContainer from "@/components/NavBarContainer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext"; 
import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans'
});

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: '--font-ubuntu'
});

export const metadata: Metadata = {
  title: {
    template: '%s | NurseKonnekt Registry',
    default: 'NurseKonnekt | Professional Health Discovery',
  },
  description: "Licensed Kenyan health professionals at your fingertips.",
  icons: { icon: '/favicon.ico' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={cn(ubuntu.variable, geistSans.variable)} 
      suppressHydrationWarning
    >
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        ubuntu.className
      )}>
        <AuthProvider>
          <Toaster 
            position="top-center" 
            richColors 
            expand={false}
            closeButton 
            toastOptions={{
              style: {
                borderRadius: '1rem',
                padding: '1rem',
                fontFamily: 'var(--font-ubuntu)'
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
