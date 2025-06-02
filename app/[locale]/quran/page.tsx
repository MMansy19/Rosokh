import { QuranClient } from './QuranClient';
import { getMessages } from '@/utils/translations';

interface QuranPageProps {
  params: Promise<{ locale: string }>;
}

export default async function QuranPage({ params }: QuranPageProps) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <QuranClient locale={locale} messages={messages} />;
}
