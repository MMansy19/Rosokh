"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbProps {
  locale: string;
  messages: any;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

export function Breadcrumb({ locale, messages }: BreadcrumbProps) {
  const pathname = usePathname();

  // Remove locale from pathname for processing
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  // Generate breadcrumb items
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathWithoutLocale.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [
      {
        label: messages?.common?.navigation?.home || "Home",
        href: `/${locale}`,
        icon: Home,
      },
    ];

    let currentPath = `/${locale}`;

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Map segments to readable labels
      const labelMap: Record<string, string> = {
        quran: messages?.common?.navigation?.quran || "Quran",
        audio: messages?.common?.navigation?.audio || "Audio",
        youtube: messages?.common?.navigation?.youtube || "YouTube",
        search: messages?.common?.navigation?.search || "Search",
        khatma: messages?.common?.navigation?.khatma || "Khatma",
        calendar: messages?.common?.navigation?.calendar || "Calendar",
        analytics: messages?.common?.navigation?.analytics || "Analytics",
        contact: messages?.common?.navigation?.contact || "Contact",
      };

      items.push({
        label:
          labelMap[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-1 text-sm text-muted mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted mx-2" />
              )}

              {isLast ? (
                <span className="flex items-center space-x-1 text-foreground font-medium">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
