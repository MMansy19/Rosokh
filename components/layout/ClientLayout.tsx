"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { GlobalProvider } from "@/contexts/GlobalContext";

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export function ClientLayout({
  children,
  locale,
  messages,
}: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <div className="min-h-screen flex flex-col page-bg">
          {/* Geometric Background Pattern */}
          <div className="geometric-bg"></div>

          <Header locale={locale} messages={messages} />
          <main className="flex-1 relative z-10">
            <div className="animate-fadeIn">{children}</div>
          </main>
          <Footer locale={locale} messages={messages} />
        </div>
      </GlobalProvider>
    </ThemeProvider>
  );
}
