import { getMessages } from "@/utils/translations";
import MawaqitClient from "./MawaqitClient";

export default async function MawaqitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <MawaqitClient locale={locale} messages={messages} />;
}