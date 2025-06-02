import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
import "../globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { getMessages } from "@/utils/translations";

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  weight: ['400', '700'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

// Define the metadata with dynamic locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return {
    title: {
      template: `%s | ${locale === "ar" ? "منصة رسوخ الإسلامية" : "Rosokh - Islamic Platform"}`,
      default: messages?.home?.title || "Rosokh - Islamic Multimedia Platform",
    },
    description: messages?.home?.description || "Rosokh is a modern Islamic multimedia platform for Quran reading, audio recitations, and spiritual learning.",
    keywords: messages?.seo?.keywords || "Quran, Islamic, Audio, Recitation, Hijri Calendar, Prayer Times, Khatma, Islamic Learning",
    alternates: {
      canonical: `/`,
      languages: {
        en: `/en`,
        ar: `/ar`,
        ru: `/ru`,
      },
    },
    openGraph: {
      title: "Rosokh - Islamic Multimedia Platform",
      description: "Your comprehensive Islamic platform for Quran, audio, and spiritual growth",
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  const dir = 
    // locale === "ar" ? "rtl" :
  "ltr";
  const fontClass = locale === "ar" ? 
    `${amiri.variable}` : 
    `${inter.variable}`;
  const messages = await getMessages(locale);

  return (
    <html  className={`${fontClass}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body lang={locale} dir={dir} className="antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <ClientLayout locale={locale} messages={messages}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
