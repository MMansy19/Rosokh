"use client";

import { KhatmaTracker } from "@/components/quran/KhatmaTracker";

interface KhatmaClientProps {
  locale: string;
  messages: any;
}

export default function KhatmaClient({ locale, messages }: KhatmaClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <KhatmaTracker locale={locale} messages={messages} />
    </div>
  );
}
