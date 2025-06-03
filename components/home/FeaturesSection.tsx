"use client";

import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Video,
  Gamepad2,
  Calendar,
  BarChart3,
  Download,
  Globe,
  Smartphone,
  Zap,
  Heart,
  Users,
} from "lucide-react";

interface FeaturesSectionProps {
  locale: string;
  messages: any;
}

const mainFeatures = [
  {
    key: "quran_reader",
    icon: BookOpen,
    href: "/quran",
    color: "from-primary/20 to-primary/5",
  },
  {
    key: "audio_player",
    icon: Headphones,
    href: "/audio",
    color: "from-accent/20 to-accent/5",
  },
  {
    key: "video_content",
    icon: Video,
    href: "/videos",
    color: "from-success/20 to-success/5",
  },
  {
    key: "khatma",
    icon: Gamepad2,
    href: "/khatma",
    color: "from-info/20 to-info/5",
  },
  {
    key: "islamic_calendar",
    icon: Calendar,
    href: "/calendar",
    color: "from-warning/20 to-warning/5",
  },
  {
    key: "analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "from-error/20 to-error/5",
  },
];

const additionalFeatures = [
  { key: "multilingual", icon: Globe },
  { key: "mobile_first", icon: Smartphone },
  { key: "fast_loading", icon: Zap },
  { key: "free_platform", icon: Heart },
  { key: "community", icon: Users },
  { key: "offline_access", icon: Download },
];

export function FeaturesSection({ locale, messages }: FeaturesSectionProps) {
  return (
    <section className="py-20 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          {" "}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {messages?.home?.features?.title ||
              "Comprehensive Islamic Platform"}
          </h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            {messages?.home?.features?.subtitle ||
              "Discover all the tools you need for your Islamic journey in one beautiful platform"}
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.key}
                href={`/${locale}${feature.href}`}
                className="group"
              >
                <div
                  className={`card hover:scale-105 transition-all duration-300 h-full bg-gradient-to-br ${feature.color} border-0`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-surface rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {messages?.home?.features?.main?.[feature.key]?.title ||
                        feature.key}
                    </h3>

                    <p className="text-muted leading-relaxed">
                      {messages?.home?.features?.main?.[feature.key]
                        ?.description || `Explore ${feature.key} features`}
                    </p>

                    <div className="pt-2">
                      <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {messages?.home?.features?.explore || "Explore"} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="space-y-12">
          <div className="text-center">
            {" "}
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {messages?.home?.features?.additional?.title ||
                "Why Choose Rosokh?"}
            </h3>
            <p className="text-muted max-w-2xl mx-auto">
              {messages?.home?.features?.additional?.subtitle ||
                "Discover the features that make Rosokh special"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="card hover:scale-105 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      {" "}
                      <h4 className="font-semibold text-foreground">
                        {messages?.home?.features?.additional?.[feature.key]
                          ?.title || feature.key}
                      </h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {messages?.home?.features?.additional?.[feature.key]
                          ?.description || `${feature.key} feature description`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-16">
          <div className="card bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            {" "}
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {messages?.home?.features?.cta?.title ||
                "Ready to Begin Your Journey?"}
            </h3>
            <p className="text-muted mb-6">
              {messages?.home?.features?.cta?.description ||
                "Start exploring the Quran and deepen your Islamic knowledge today"}
            </p>
            <Link
              href={`/${locale}/quran`}
              className="btn-primary inline-flex items-center space-x-2 rtl:space-x-reverse px-8 py-3"
            >
              <BookOpen className="w-5 h-5" />
              <span>
                {messages?.home?.features?.cta?.button || "Start Reading"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
