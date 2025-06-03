"use client";

import Link from "next/link";
import { Heart, Github, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  locale: string;
  messages: any;
}

export function Footer({ locale, messages }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-surface border-t border-border mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ر</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground">
                  {messages?.common?.brand?.name || "Rosokh"}
                </span>
                <span className="text-xs text-muted -mt-1">
                  {messages?.common?.brand?.name_arabic || "رسوخ"}
                </span>
              </div>
            </div>{" "}
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              {messages?.footer?.description ||
                messages?.common?.brand?.description ||
                "Rosokh is a modern Islamic multimedia platform for spiritual growth and learning."}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-1 rtl:space-x-reverse text-sm text-muted">
              <span>{messages?.footer?.made_with || "Made with"}</span>
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              <span>{messages?.footer?.for_ummah || "for the Ummah"}</span>
            </div>
          </div>
          
          {/* Quick Links */}{" "}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">
              {messages?.footer?.quick_links || "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {[
                { key: "quran", href: "/quran" },
                { key: "audio", href: "/audio" },
                { key: "calendar", href: "/calendar" },
                { key: "khatma", href: "/khatma" },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-muted hover:text-primary transition-colors duration-200 text-sm inline-block"
                  >
                    {messages?.common?.navigation?.[link.key] || link.key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Features */}{" "}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">
              {messages?.footer?.features || "Features"}
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>{messages?.footer?.feature_free || "100% Free"}</li>
              <li>
                {messages?.footer?.feature_multilingual ||
                  "Multilingual Support"}
              </li>
              <li>{messages?.footer?.feature_offline || "Offline Capable"}</li>
              <li>
                {messages?.footer?.feature_responsive || "Responsive Design"}
              </li>
            </ul>
          </div>
          
          {/* Contact */}{" "}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">
              {messages?.footer?.contact || "Contact"}
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:info@rosokh.com"
                className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>{messages?.footer?.email || "info@rosokh.com"}</span>
              </a>
              <div className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse text-muted text-sm">
                <MapPin className="w-4 h-4" />
                <span>{messages?.footer?.location || "Global"}</span>
              </div>
              <a
                href="https://github.com/rosokh-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Github className="w-4 h-4" />
                <span>{messages?.footer?.github || "GitHub"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            {" "}
            <div className="text-sm text-muted">
              © {currentYear}{" "}
              {messages?.common?.brand?.platform || "Rosokh Platform"}.{" "}
              {messages?.footer?.rights_reserved || "All rights reserved."}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-sm">
              <Link
                href={`/${locale}/privacy`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {messages?.footer?.privacy || "Privacy Policy"}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {messages?.footer?.terms || "Terms of Service"}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-muted hover:text-primary transition-colors duration-200"
              >
                {messages?.footer?.about || "About"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
