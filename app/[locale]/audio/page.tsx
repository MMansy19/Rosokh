import { getMessages } from '@/utils/translations';
import AudioClient from './AudioClient';

export default async function AudioPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <AudioClient locale={params.locale} messages={messages} />
  );
}
