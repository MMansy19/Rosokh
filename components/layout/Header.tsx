"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";
import { GlobalSearch } from "@/components/search";
import {
  Menu,
  Sun,
  Moon,
  Languages,
  Search,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface HeaderProps {
  locale: string;
  messages: any;
  onSidebarToggle: () => void;
  isSidebarCollapsed?: boolean;
  onSidebarCollapse?: () => void;
}

const languages = [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" },
  { code: "ru", name: "Русский", dir: "ltr" },
];

interface HeaderProps {
  locale: string;
  messages: any;
  onSidebarToggle: () => void;
  isSidebarCollapsed?: boolean;
  onSidebarCollapse?: () => void;
}

export function Header({
  locale,
  messages,
  onSidebarToggle,
  isSidebarCollapsed = false,
  onSidebarCollapse,
}: HeaderProps) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme } = useTheme();
  const currentLang = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll behavior for hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show
      
      // Don't hide header if we're at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [lastScrollY]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      if (!target.closest("[data-dropdown]")) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, "");
    window.location.href = `/${langCode}${pathWithoutLocale}`;
  };

  return (
    <header
      ref={headerRef}
      dir={currentLang?.dir || "ltr"}
      className={`fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Sidebar Toggle & Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={
                messages?.common?.actions?.toggle_menu || "Toggle menu"
              }
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>

            {/* Desktop Sidebar Collapse Button */}
            {onSidebarCollapse && (
              <button
                onClick={onSidebarCollapse}
                className="hidden lg:flex p-2 rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
                title={
                  isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-5 h-5 text-muted" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-muted" />
                )}
              </button>
            )}

            {/* Logo */}
            <Link
              href={`/${locale}`}
              className={`${isSidebarCollapsed ? "flex" : "flex md:hidden"} items-center space-x-2 rtl:space-x-reverse shrink-0`}
            >
              <Image
                src="/logo/no-bg.png"
                alt={messages?.common?.brand?.name || "Rosokh"}
                width={32}
                height={32}
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                priority
              />
              {/* <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-foreground">
                  {messages?.common?.brand?.name || "Rosokh"}
                </span>
              </div> */}
            </Link>
          </div>

          {/* Global Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-3xl mx-6">
            <GlobalSearch
              locale={locale}
              messages={messages}
              isExpanded={true}
              className="w-full"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse p-1.5 lg:p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label={messages?.common?.actions?.language || "Language"}
              >
                <Languages className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
                <span className="text-sm font-medium text-muted">
                  {currentLang?.name}
                </span>
              </button>

              {isLangMenuOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-10 md:hidden"
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 bg-black/50 backdrop-blur-md rtl:right-auto rtl:left-0 bg-surface border border-border rounded-lg shadow-lg min-w-[120px] animate-fadeIn z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-secondary transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                          locale === lang.code
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 lg:p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              aria-label={
                messages?.common?.actions?.toggle_theme || "Toggle theme"
              }
            >
              {mounted ? (
                theme === "light" ? (
                  <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
                ) : (
                  <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
                )
              ) : (
                <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-1">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              aria-label={messages?.common?.actions?.search || "Search"}
            >
              <Search className="w-5 h-5 text-muted" />
            </button>
            {/* Language Selector */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label={messages?.common?.actions?.language || "Language"}
              >
                <Languages className="w-5 h-5 text-muted" />
              </button>

              {isLangMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-lg shadow-lg min-w-[120px] animate-fadeIn z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-secondary transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                          locale === lang.code
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              aria-label={
                messages?.common?.actions?.toggle_theme || "Toggle theme"
              }
            >
              {mounted ? (
                theme === "light" ? (
                  <Moon className="w-5 h-5 text-muted" />
                ) : (
                  <Sun className="w-5 h-5 text-muted" />
                )
              ) : (
                <Sun className="w-5 h-5 text-muted" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {isSearchExpanded && (
        <>
          {/* Search Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-14 sm:top-16 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSearchExpanded(false)}
            style={{ top: headerRef.current?.offsetHeight || 64 }}
          />
          {/* Search Panel */}
          <div 
            className="md:hidden fixed inset-x-0 z-40 bg-surface border-t border-border shadow-2xl"
            style={{ top: headerRef.current?.offsetHeight || 64 }}
          >
            <div className="p-4">
              <GlobalSearch
                locale={locale}
                messages={messages}
                isExpanded={true}
                onToggle={() => setIsSearchExpanded(false)}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
