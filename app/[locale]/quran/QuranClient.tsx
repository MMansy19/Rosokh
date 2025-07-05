"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsService } from "@/services/AnalyticsService";
import { NotificationService } from "@/services/NotificationService";
import { QuranUnified } from "@/components/quran/QuranUnified";
import QuranSearch from "@/components/quran/QuranSearch";
import { TabNavigation } from "@/components/quran/ui/TabNavigation";
import { TabType, QuranClientProps } from "@/components/quran/types";
import { QuranMushaf } from "@/components/quran";

export function QuranClient({ locale, messages }: QuranClientProps) {
  const searchParams = useSearchParams();
  const analytics = useMemo(() => AnalyticsService.getInstance(), []);
  const notifications = useMemo(() => NotificationService.getInstance(), []);

  const [activeTab, setActiveTab] = useState<TabType>("read");

  // Initialize active tab based on URL parameters (for global search integration)
  useEffect(() => {
    const urlSearchTerm = searchParams.get("q");
    if (urlSearchTerm && activeTab !== "search") {
      setActiveTab("search");
    }
  }, [searchParams, activeTab]);

  // Track page view and reading session
  useEffect(() => {
    analytics.trackPageView("/quran", "Quran Reader");
    analytics.trackEvent("quran_session_start", "user", {
      timestamp: new Date().toISOString(),
      locale,
      activeTab,
    });

    // Track reading session duration
    const sessionStart = Date.now();
    return () => {
      const sessionDuration = Date.now() - sessionStart;
      analytics.trackEvent("quran_session_end", "engagement", {
        duration: sessionDuration,
        activeTab,
      });
    };
  }, [analytics, locale, activeTab]);

  // Handle tab change with analytics
  const handleTabChange = (fromTab: TabType, toTab: TabType) => {
    analytics.trackEvent("tab_switch", "user", {
      fromTab,
      toTab,
      timestamp: new Date().toISOString(),
    });
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "read":
        return <QuranUnified locale={locale} messages={messages} mode="read" />;
      case "search":
        return <QuranSearch locale={locale} messages={messages} />;
      case "mushaf":
        return <QuranMushaf locale={locale} messages={messages} />;
      default:
        return <QuranUnified locale={locale} messages={messages} mode="read" />;
    }
  };

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300 arabic-text">
      <div className="container mx-auto md:px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.quran?.title || "Quran Reader"}
          </h1>
          <div className="flex justify-center items-center mb-6">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl quran-text text-primary text-center leading-none">
              ﷽
            </div>
          </div>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.quran?.description ||
              "Read the Quran with beautiful Arabic text, translations, and audio"}
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          messages={messages}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
