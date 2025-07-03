"use client";

import Link from "next/link";
import { Heart, Github, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  locale: string;
  messages: any;
}

export function Footer({ locale, messages }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const isRtl = locale === "ar";

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="bg-surface border-t border-border mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4 text-center sm:text-left rtl:sm:text-right">
            {isRtl ? (
              <>
                {" "}
                <div className="flex items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse">
                  <span className="font-bold text-lg text-foreground">
                    {messages?.common?.brand?.name || "Rosokh"}
                  </span>
                  <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0"></div>
                </div>
              </>
            ) : (
              <>
                {" "}
                <div className="flex items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0"></div>
                  <span className="font-bold text-lg text-foreground">
                    {messages?.common?.brand?.name || "Rosokh"}
                  </span>
                </div>
              </>
            )}
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto sm:mx-0 rtl:sm:mr-0">
              {messages?.footer?.description ||
                messages?.common?.brand?.description ||
                "Rosokh is a modern Islamic multimedia platform for spiritual growth and learning."}
            </p>
            {isRtl ? (
              <>
                <div className="flex flex-row rtl:flex-row-reverse items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse text-muted text-sm whitespace-nowrap">
                  <span>{messages?.footer?.for_ummah || "for the Ummah"}</span>
                  <Heart className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                  <span>{messages?.footer?.made_with || "Made with"}</span>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse gap-2 rtl:gap-x-reverse items-center justify-center sm:justify-start rtl:sm:justify-end">
                  <a
                    href="https://mahmoud-mansy.vercel.app/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                  >
                    <span>{messages?.author || "Mahmoud Mansy"}</span>
                    <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0"></div>
                  </a>
                  <div className="text-xs font-medium text-muted whitespace-nowrap">
                    {messages?.footer?.developed_by || "Developed by"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-row rtl:flex-row-reverse items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse text-muted text-sm whitespace-nowrap">
                  <span>{messages?.footer?.made_with || "Made with"}</span>
                  <Heart className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                  <span>{messages?.footer?.for_ummah || "for the Ummah"}</span>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse gap-2 rtl:gap-x-reverse items-center justify-center sm:justify-start rtl:sm:justify-end">
                  <div className="text-xs font-medium text-muted whitespace-nowrap">
                    {messages?.footer?.developed_by || "Developed by"}
                  </div>
                  <a
                    href="https://mahmoud-mansy.vercel.app/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                  >
                    <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0"></div>
                    <span>{messages?.author || "Mahmoud Mansy"}</span>
                  </a>
                </div>
              </>
            )}
          </div>
          {/* Quick Links */}
          <div className="space-y-4 text-center sm:text-left rtl:sm:text-right">
            <h3 className="font-semibold text-foreground text-base">
              {messages?.footer?.quick_links || "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {[
                { key: "quran", href: "/quran" },
                { key: "audio", href: "/audio" },
                { key: "youtube", href: "/youtube" },
                // { key: "calendar", href: "/calendar" },
                // { key: "khatma", href: "/khatma" },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-muted hover:text-primary transition-colors duration-200 text-sm block"
                  >
                    {messages?.common?.navigation?.[link.key] || link.key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4 text-center sm:text-left rtl:sm:text-right">
            <h3 className="font-semibold text-foreground text-base">
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

          {/* Contact */}
          <div className="space-y-4 text-center sm:text-left rtl:sm:text-right">
            <h3 className="font-semibold text-foreground text-base">
              {messages?.footer?.contact || "Contact"}
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:info@rosokh.com"
                className="flex items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{messages?.footer?.email || "info@rosokh.com"}</span>
              </a>
              <div className="flex items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse text-muted text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{messages?.footer?.location || "Global"}</span>
              </div>
              <a
                href="https://github.com/MMansy19/Rosokh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center sm:justify-start rtl:sm:justify-end space-x-2 rtl:space-x-reverse text-muted hover:text-primary transition-colors duration-200 text-sm"
              >
                <Github className="w-4 h-4 flex-shrink-0" />
                <span>{messages?.footer?.github || "GitHub"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left rtl:sm:text-right">
            <div className="text-sm text-muted order-2 sm:order-1">
              © {currentYear}{" "}
              {messages?.common?.brand?.platform || "Rosokh Platform"}.{" "}
              {messages?.footer?.rights_reserved || "All rights reserved."}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end rtl:sm:justify-start gap-3 sm:gap-4 lg:gap-6 text-sm order-1 sm:order-2">
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
