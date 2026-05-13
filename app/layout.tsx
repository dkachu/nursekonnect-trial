import type { Metadata, Viewport } from "next";
import { Ubuntu, Geist } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import Footer from "@/components/footer/Footer";
import NavBarContainer from "@/components/NavBarContainer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext"; 
import { cn } from "@/lib/utils";

/**
 * Registry Font Configuration
 * geistSans: Industrial utility
 * ubuntu: Medical clean
 */
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
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary",
        ubuntu.className
      )}>
        
        {/* Identity & Protocol Provider */}
        <AuthProvider>
          
          {/* Registry Notification Ledger */}
          <Toaster 
            position="top-center" 
            richColors 
            expand={false}
            closeButton 
            toastOptions={{
              style: {
                borderRadius: '1.5rem',
                padding: '1.25rem 1.5rem',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
                fontFamily: 'var(--font-ubuntu)'
              },
              className: "font-black uppercase text-[10px] tracking-widest italic",
            }}
          />
          
          <div className="relative flex flex-col min-h-screen overflow-x-hidden">
            {/* Real-time Navigation Handshake */}
            <NavBarContainer />
            
            <main className="flex-grow">
              {children}
            </main>
            
            {/* Legal & Social Footer */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
