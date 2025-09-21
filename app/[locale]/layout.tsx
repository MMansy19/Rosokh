import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
import "../globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { getMessages } from "@/utils/translations";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  weight: ["400", "700"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

// Define the metadata with dynamic locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);

  const siteUrl = "https://rosokh.vercel.app";
  const currentPath = `/${locale}`;
  const fullUrl = `${siteUrl}${currentPath}`;

  return {
    title: {
      template: `%s | ${locale === "ar" ? "منصة رسوخ الإسلامية" : "Rosokh - Islamic Platform"}`,
      default: messages?.home?.title || "Rosokh - Islamic Multimedia Platform",
    },
    description:
      messages?.home?.description ||
      "Rosokh is a comprehensive Islamic multimedia platform featuring Quran reading, audio recitations, educational videos, articles, and spiritual learning tools for the global Muslim community.",
    keywords: [
      "Quran", "Islamic", "Audio", "Recitation", "Hijri Calendar", "Prayer Times", 
      "Khatma", "Islamic Learning", "Muslim", "Tafsir", "Hadith", "Islamic Education",
      "Quran Reader", "Islamic Videos", "Nasheeds", "Islamic Articles", "Dua",
      "Surah", "Ayah", "Islamic Platform", "Muslim Community", "Islamic Resources"
    ].join(", "),
    authors: [{ name: "Mahmoud Mansy" }],
    creator: "Mahmoud Mansy",
    publisher: "Rosokh",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
        ru: `${siteUrl}/ru`,
        "x-default": `${siteUrl}/en`,
      },
    },
    icons: {
      icon: [
        { url: "/logo/no-bg.png", sizes: "32x32", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "16x16", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "192x192", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/logo/no-bg.png",
      apple: [
        { url: "/logo/no-bg.png", sizes: "180x180", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "152x152", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "144x144", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "120x120", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "114x114", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "76x76", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "72x72", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "60x60", type: "image/png" },
        { url: "/logo/no-bg.png", sizes: "57x57", type: "image/png" },
      ],
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/logo/no-bg.png",
        },
      ],
    },
    manifest: "/manifest.json",
    openGraph: {
      title: messages?.seo?.title || "Rosokh - Islamic Multimedia Platform",
      description:
        messages?.seo?.description ||
        "Your comprehensive Islamic platform for Quran, audio recitations, educational videos, and spiritual growth",
      type: "website",
      locale: locale === "ar" ? "ar_SA" : locale === "ru" ? "ru_RU" : "en_US",
      url: fullUrl,
      siteName: "Rosokh",
      images: [
        {
          url: `${siteUrl}/logo/no-bg.png`,
          width: 1200,
          height: 630,
          alt: "Rosokh - Islamic Multimedia Platform",
        },
        {
          url: `${siteUrl}/logo/no-bg.png`,
          width: 800,
          height: 600,
          alt: "Rosokh Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: messages?.seo?.title || "Rosokh - Islamic Multimedia Platform",
      description:
        messages?.seo?.description ||
        "Your comprehensive Islamic platform for Quran, audio, and spiritual growth",
      images: [`${siteUrl}/logo/no-bg.png`],
      creator: "@rosokh_platform",
      site: "@rosokh_platform",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      other: {
        me: ["your-social-profile-urls"],
      },
    },
    category: "religion",
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
  const fontClass = locale === "ar" ? `${amiri.variable}` : `${inter.variable}`;
  const messages = await getMessages(locale);

  return (
    <html className={`${fontClass}`} lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10B981" />
        <meta name="application-name" content="Rosokh" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rosokh" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#10B981" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Rosokh",
              alternateName: "رسوخ",
              description:
                "Comprehensive Islamic multimedia platform for Quran reading, audio recitations, educational videos, and spiritual learning",
              url: "https://rosokh.vercel.app",
              applicationCategory: "EducationalApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Mahmoud Mansy",
              },
              publisher: {
                "@type": "Organization",
                name: "Rosokh",
                logo: {
                  "@type": "ImageObject",
                  url: "https://rosokh.vercel.app/logo/no-bg.png",
                },
              },
              featureList: [
                "Quran Reading",
                "Audio Recitations",
                "Islamic Videos",
                "Educational Articles",
                "Prayer Times",
                "Hijri Calendar",
                "Khatma Tracking",
                "Multi-language Support",
              ],
              inLanguage: [
                {
                  "@type": "Language",
                  name: "Arabic",
                  alternateName: "ar",
                },
                {
                  "@type": "Language",
                  name: "English",
                  alternateName: "en",
                },
                {
                  "@type": "Language",
                  name: "Russian",
                  alternateName: "ru",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        lang={locale}
        dir={dir}
        className="antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300"
      >
        <ClientLayout locale={locale} messages={messages}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
