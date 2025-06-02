import { getMessages } from "@/utils/translations";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <AnalyticsClient locale={locale} messages={messages} />;
}
