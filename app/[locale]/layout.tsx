import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  weight: ['400', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rosokh - Islamic Multimedia Platform | منصة رسوخ الإسلامية",
  description: "Rosokh is a modern Islamic multimedia platform for Quran reading, audio recitations, and spiritual learning. Free, fast, and available in Arabic, English, and Russian.",
  keywords: "Quran, Islamic, Audio, Recitation, Hijri Calendar, Prayer Times, Khatma, Islamic Learning",
  openGraph: {
    title: "Rosokh - Islamic Multimedia Platform",
    description: "Your comprehensive Islamic platform for Quran, audio, and spiritual growth",
    type: "website",
    locale: "en_US",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${amiri.variable} ${inter.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
