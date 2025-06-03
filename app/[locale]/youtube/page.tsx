import YoutubeClient from "./YoutubeClient";
import { getMessages } from "@/utils/translations";

interface YoutubePageProps {
  params: Promise<{ locale: string }>;
}

export default async function YoutubePage({ params }: YoutubePageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <YoutubeClient locale={locale} messages={messages} />;
}
