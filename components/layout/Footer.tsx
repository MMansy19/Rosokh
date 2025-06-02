'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Heart, Github, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('common');
  const tFooter = useTranslations('footer');
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ر</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground">Rosokh</span>
                <span className="text-xs text-muted -mt-1">رسوخ</span>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              {tFooter('description')}
            </p>
            <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted">
              <span>{tFooter('made_with')}</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{tFooter('for_ummah')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{tFooter('quick_links')}</h3>
            <ul className="space-y-2">
              {[
                { key: 'quran', href: '/quran' },
                { key: 'audio', href: '/audio' },
                { key: 'calendar', href: '/calendar' },
                { key: 'khatma', href: '/khatma' },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-muted hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {t(`navigation.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{tFooter('features')}</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>{tFooter('feature_free')}</li>
              <li>{tFooter('feature_multilingual')}</li>
              <li>{tFooter('feature_offline')}</li>
              <li>{tFooter('feature_responsive')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{tFooter('contact')}</h3>
            <div className="space-y-3">
              <a
                href="mailto:info@rosokh.com"
                className="flex items-center space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>info@rosokh.com</span>
              </a>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-muted text-sm">
                <MapPin className="w-4 h-4" />
                <span>{tFooter('location')}</span>
              </div>
              <a
                href="https://github.com/rosokh-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted">
              © {currentYear} Rosokh Platform. {tFooter('rights_reserved')}
            </div>
            <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm">
              <Link
                href={`/${locale}/privacy`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {tFooter('privacy')}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {tFooter('terms')}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {tFooter('about')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
