"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Menu,
  X,
  Sun,
  Moon,
  BookOpen,
  Headphones,
  Video,
  Gamepad2,
  Calendar,
  BarChart3,
  Mail,
  Home,
} from "lucide-react";

interface HeaderProps {
  locale: string;
  messages: any;
}

const navigation = [
  { key: "home", href: "/", icon: Home },
  { key: "quran", href: "/quran", icon: BookOpen },
  { key: "audio", href: "/audio", icon: Headphones },
  { key: "video", href: "/videos", icon: Video },
  { key: "khatma", href: "/khatma", icon: Gamepad2 },
  { key: "calendar", href: "/calendar", icon: Calendar },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "contact", href: "/contact", icon: Mail },
];

const languages = [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" },
  { code: "ru", name: "Русский", dir: "ltr" },
];

export function Header({ locale, messages }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const currentLang = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
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
      dir={currentLang?.dir || "ltr"}
      className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 rtl:space-x-reverse shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">ر</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-foreground">
                {messages?.common?.brand?.name || "Rosokh"}
              </span>
              <span className="text-xs text-muted -mt-1 hidden xs:block">
                {messages?.common?.brand?.name_arabic || "رسوخ"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href === "/" ? "" : item.href}`}
                  className="flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-sm lg:text-base">
                    {messages?.common?.navigation?.[item.key] || item.key}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse p-1.5 lg:p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label={messages?.common?.actions?.language || "Language"}
              >
                <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
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
                  <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-surface border border-border rounded-lg shadow-lg min-w-[120px] animate-fadeIn z-20">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={messages?.common?.actions?.toggle_menu || "Toggle menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 top-14 sm:top-16 z-30 bg-black/50 backdrop-blur-md"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Mobile Menu Panel */}
          <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 z-40 bg-background/98 backdrop-blur-md border-t border-border shadow-lg max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-2 space-y-3">
              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-2">
                  {messages?.common?.navigation?.menu || "Menu"}
                </div>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      href={`/${locale}${item.href === "/" ? "" : item.href}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl hover:bg-secondary transition-all duration-200 group active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                        <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground block">
                          {messages?.common?.navigation?.[item.key] || item.key}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-border space-y-4">
                {/* Language Selector */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider px-3">
                    {messages?.common?.actions?.language || "Language"}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`p-3 rounded-lg transition-all duration-200 text-center active:scale-95 ${
                          locale === lang.code
                            ? "bg-primary text-white font-medium shadow-md"
                            : "bg-secondary text-foreground hover:bg-border"
                        }`}
                      >
                        <div className="text-sm font-medium">{lang.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider px-3">
                    {messages?.common?.actions?.appearance || "Appearance"}
                  </div>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-border transition-all duration-200 group active:scale-95"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {mounted ? (
                        theme === "light" ? (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Moon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">
                              {messages?.common?.actions?.dark_mode || "Dark Mode"}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Sun className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">
                              {messages?.common?.actions?.light_mode || "Light Mode"}
                            </span>
                          </>
                        )
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">
                            {messages?.common?.actions?.light_mode || "Light Mode"}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
