import type { Metadata } from "next";
import { Zilla_Slab, Public_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sevantra | Civic Engagement Platform",
  description: "Connect with citizens, NGOs, schools, and government bodies for community development.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#E9501B",
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { I18nProvider } from '@/components/I18nProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${zillaSlab.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false} themes={['light', 'dark', 'ocean', 'sunset', 'earth']}>
          <AnimatedBackground />
          <QueryProvider>
            <AuthProvider>
              <I18nProvider>
                {children}
              </I18nProvider>
            </AuthProvider>
          </QueryProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
