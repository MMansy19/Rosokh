import { getMessages } from "@/utils/translations";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <CalendarClient locale={locale} messages={messages} />;
}
