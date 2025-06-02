'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe, 
  BookOpen, 
  Headphones, 
  Video, 
  Gamepad2, 
  Calendar, 
  BarChart3, 
  Mail,
  Home
} from 'lucide-react';

interface HeaderProps {
  locale: string;
  messages: any;
}

const navigation = [
  { key: 'home', href: '/', icon: Home },
  { key: 'quran', href: '/quran', icon: BookOpen },
  { key: 'audio', href: '/audio', icon: Headphones },
  { key: 'video', href: '/videos', icon: Video },
  { key: 'khatma', href: '/khatma', icon: Gamepad2 },
  { key: 'calendar', href: '/calendar', icon: Calendar },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'contact', href: '/contact', icon: Mail },
];

const languages = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
];

export function Header({ locale, messages }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const currentLang = languages.find(lang => lang.code === locale);
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '');
    window.location.href = `/${langCode}${pathWithoutLocale}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ر</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Rosokh</span>
              <span className="text-xs text-muted -mt-1">رسوخ</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href === '/' ? '' : item.href}`}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{messages?.common?.navigation?.[item.key] || item.key}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label={messages?.common?.actions?.language || "Language"}
              >
                <Globe className="w-5 h-5 text-muted" />
                <span className="text-sm font-medium text-muted">{currentLang?.name}</span>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-surface border border-border rounded-lg shadow-lg min-w-[120px] animate-fadeIn">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-secondary transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                        locale === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              aria-label={messages?.common?.actions?.toggle_theme || "Toggle theme"}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-muted" />
              ) : (
                <Sun className="w-5 h-5 text-muted" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm">
          <div className="p-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href === '/' ? '' : item.href}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-secondary transition-colors duration-200 group"
                  >
                    <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-foreground">{messages?.common?.navigation?.[item.key] || item.key}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-border space-y-2">
              {/* Language Selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted px-3">{messages?.common?.actions?.language || "Language"}</p>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg transition-colors duration-200 ${
                      locale === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-secondary transition-colors duration-200"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
