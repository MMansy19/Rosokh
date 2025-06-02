import { getMessages } from '@/utils/translations';
import ContactClient from './ContactClient';

export default async function ContactPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <ContactClient locale={params.locale} messages={messages} />
  );
}
