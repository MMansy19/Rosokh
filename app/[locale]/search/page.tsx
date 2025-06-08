import { notFound } from "next/navigation";
import { Metadata } from "next";
import SearchClient from "./SearchClient";
import { getMessages } from "@/utils/translations";

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    context?: string;
  }>;
}

// Valid locales for the app
const VALID_LOCALES = ["en", "ar", "ru"];

function isValidLocale(locale: string): boolean {
  return VALID_LOCALES.includes(locale);
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q, context } = await searchParams;
  
  if (!isValidLocale(locale)) {
    return {
      title: "Search | Rosokh",
      description: "Search across Quran verses, audio recitations, and educational YouTube content",
    };
  }

  const messages = await getMessages(locale);
  const query = q || "";
  
  const title = query 
    ? `${query} - ${messages.search?.results?.title || "Search Results"} | Rosokh`
    : `${messages.search?.title || "Search"} | Rosokh`;
    
  const description = query
    ? `${messages.search?.results?.for || "Search results for"} "${query}" ${messages.search?.results?.description || "across Quran, Audio, and YouTube content"}`
    : messages.search?.description || "Search across Quran verses, audio recitations, and educational YouTube content";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_SA" : locale === "ru" ? "ru_RU" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      languages: {
        "en": `/en/search${q ? `?q=${encodeURIComponent(q)}` : ""}${context ? `&context=${context}` : ""}`,
        "ar": `/ar/search${q ? `?q=${encodeURIComponent(q)}` : ""}${context ? `&context=${context}` : ""}`,
        "ru": `/ru/search${q ? `?q=${encodeURIComponent(q)}` : ""}${context ? `&context=${context}` : ""}`,
      },
    },
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <div className="min-h-screen">
      <SearchClient locale={locale} messages={messages} />
    </div>
  );
}
