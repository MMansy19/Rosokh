// filepath: d:\WORK\Projects\islamic\rosokh\app\[locale]\calendar\page.tsx
import { getMessages } from '@/utils/translations';
import CalendarClient from './CalendarClient';

export default async function CalendarPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <CalendarClient locale={params.locale} messages={messages} />
  );
}
