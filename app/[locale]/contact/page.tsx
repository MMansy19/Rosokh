import { getMessages } from "@/utils/translations";
import ContactClient from "./ContactClient";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <ContactClient locale={locale} messages={messages} />;
}
