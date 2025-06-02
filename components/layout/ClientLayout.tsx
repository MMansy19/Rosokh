'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export function ClientLayout({ children, locale, messages }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <Header locale={locale} messages={messages} />
      <main className="flex-1">
        <div className="animate-fadeIn">{children}</div>
      </main>
      <Footer locale={locale} messages={messages} />
    </ThemeProvider>
  );
}
