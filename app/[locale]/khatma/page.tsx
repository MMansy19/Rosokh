import { getMessages } from "@/utils/translations";
import KhatmaClient from "./KhatmaClient";

export default async function KhatmaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <KhatmaClient locale={locale} messages={messages} />;
}
