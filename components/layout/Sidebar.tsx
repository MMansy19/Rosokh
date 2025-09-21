"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Headphones,
  Video,
  Calendar,
  BarChart3,
  Mail,
  Home,
  Book,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

interface SidebarProps {
  locale: string;
  messages: any;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const navigation = [
  { key: "home", href: "/", icon: Home },
  { key: "quran", href: "/quran", icon: BookOpen },
  { key: "audio", href: "/audio", icon: Headphones },
  { key: "youtube", href: "/youtube", icon: Video },
  { key: "mawaqit", href: "/mawaqit", icon: Clock },
  // { key: "khatma", href: "/khatma", icon: Book },
  // { key: "calendar", href: "/calendar", icon: Calendar },
  // { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "contact", href: "/contact", icon: Mail },
];

export function Sidebar({
  locale,
  messages,
  isOpen,
  onToggle,
  isCollapsed: externalCollapsed,
  onCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isRtl = locale === "ar";
  const pathname = usePathname();

  // Use external collapsed state if provided, otherwise use internal state
  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapsed = () => {
    if (onCollapse) {
      onCollapse(!isCollapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onToggle();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onToggle]);

  // Check if current path is active
  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(`/${locale}${href}`);
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-surface border-r border-border sidebar-transition
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-48 xl:w-64"}
          w-64
        `}
        style={{ height: "100vh" }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-border">
            <div
              className={`flex items-center justify-center gap-4 transition-all duration-200 ${isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:justify-center lg:w-full" : "opacity-100"}`}
            >
              <Image
                src="/logo/no-bg.png"
                alt={messages?.common?.brand?.name || "Rosokh"}
                width={32}
                height={32}
                className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                priority
              />
              {/* <span
                className={`font-bold text-lg text-foreground transition-all duration-200 ${isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}`}
              >
                {messages?.common?.brand?.name || "Rosokh"}
              </span> */}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-hoverButton transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapsed}
              className={`hidden lg:flex p-2 rounded-lg hover:bg-hoverButton transition-all duration-200 ${isCollapsed ? "absolute top-4 right-4" : ""}`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-6 h-6 text-muted" />
              ) : (
                <ChevronLeft className="w-6 h-6 text-muted" />
              )}
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <div
              className={`text-xs font-semibold text-muted uppercase tracking-wider px-3 py-2 transition-all duration-200 ${isCollapsed ? "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:py-0" : "opacity-100"}`}
            >
              {messages?.common?.navigation?.menu || "Navigation"}
            </div>
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              const itemTitle =
                messages?.common?.navigation?.[item.key] || item.key;

              return (
                <div key={item.key} className="relative group">
                  <Link
                    href={`/${locale}${item.href === "/" ? "" : item.href}`}
                    onClick={() => {
                      // Close mobile sidebar on navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      sidebar-item flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${
                        isActive
                          ? "bg-primary text-white shadow-md active"
                          : "text-foreground hover:text-primary"
                      }
                      ${isCollapsed ? "lg:justify-center lg:px-2 collapsed-item" : "space-x-3"}
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <Icon
                      className={`
                      w-5 h-5 transition-all duration-200 sidebar-icon shrink-0
                      ${isActive ? "text-white" : "text-muted group-hover:text-primary"}
                      ${isCollapsed ? "md:w-6 md:h-6 w-4 h-4" : ""}
                    `}
                    />
                    <span
                      className={`
                      font-medium transition-all duration-200 whitespace-nowrap
                      ${isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}
                      ${isActive ? "text-white" : ""}
                    `}
                    >
                      {itemTitle}
                    </span>
                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80" />
                    )}{" "}
                    {/* Collapsed state active indicator */}
                    {isActive && isCollapsed && (
                      <div className="sidebar-collapsed-indicator lg:block hidden" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div
            className={`p-4 border-t border-border transition-all duration-200 ${isCollapsed ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100"}`}
          >
            <div className="text-xs text-muted text-center sidebar-text">
              © 2025 {messages?.common?.brand?.name || "Rosokh"}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
