import { getMessages } from '@/utils/translations';
import KhatmaClient from './KhatmaClient';

export default async function KhatmaPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <KhatmaClient locale={params.locale} messages={messages} />
  );
}
