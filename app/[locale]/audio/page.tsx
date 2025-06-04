import { getMessages } from "@/utils/translations";
import { AudioClient } from "@/components/audio";

export default async function AudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <AudioClient />;
}
