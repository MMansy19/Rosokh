"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";
import { ThemeProvider, useTheme } from "@/components/providers/ThemeProvider";
import { GlobalProvider } from "@/contexts/GlobalContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationContainer } from "@/components/common/NotificationContainer";
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from "@/hooks/useKeyboardShortcuts";

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

function ClientLayoutInner({ children, locale, messages }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  const shortcuts = createCommonShortcuts({
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    focusSearch: () => {
      // Try to focus the search input in the header
      const searchInput = document.querySelector(
        'input[type="search"]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    toggleTheme,
    goHome: () => router.push(`/${locale}`),
  });

  // Add help shortcut
  shortcuts.push({
    key: "?",
    action: () => setIsShortcutsModalOpen(true),
    description: "Show keyboard shortcuts",
  });

  // Add sidebar collapse shortcut
  shortcuts.push({
    key: "b",
    ctrlKey: true,
    action: () => setIsSidebarCollapsed(!isSidebarCollapsed),
    description: "Toggle sidebar collapse",
  });

  useKeyboardShortcuts({ shortcuts });

  return (
    <div className="min-h-screen flex page-bg relative">
      {/* Geometric Background Pattern */}
      <div className="geometric-bg"></div>

      {/* Sidebar */}
      <Sidebar
        locale={locale}
        messages={messages}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onCollapse={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } ml-0`}
      >
        <Header
          locale={locale}
          messages={messages}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Breadcrumb Navigation */}
            <Breadcrumb locale={locale} messages={messages} />

            {/* Page Content */}
            <div className="animate-fadeIn">{children}</div>
          </div>
        </main>

        <Footer locale={locale} messages={messages} />
      </div>

      {/* Global Notification Container */}
      <NotificationContainer />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        messages={messages}
      />
    </div>
  );
}

export function ClientLayout({
  children,
  locale,
  messages,
}: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <SearchProvider locale={locale}>
          <ClientLayoutInner
            children={children}
            locale={locale}
            messages={messages}
          />
        </SearchProvider>
      </GlobalProvider>
    </ThemeProvider>
  );
}
