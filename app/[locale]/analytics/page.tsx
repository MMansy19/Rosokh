import { getMessages } from '@/utils/translations';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <AnalyticsClient locale={params.locale} messages={messages} />
  );
}
