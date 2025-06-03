"use client";

import { KhatmaTracker } from "@/components/quran/KhatmaTracker";

interface KhatmaClientProps {
  locale: string;
  messages: any;
}

export default function KhatmaClient({ locale, messages }: KhatmaClientProps) {
  return (
    <div className="min-h-screen">
      <KhatmaTracker locale={locale} messages={messages} />
    </div>
  );
}
