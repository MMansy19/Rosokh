"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Download, Globe, Clock, Heart } from "lucide-react";

interface StatsSectionProps {
  locale: string;
  messages: any;
}

interface StatItem {
  key: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const stats: StatItem[] = [
  {
    key: "surahs",
    value: 114,
    icon: BookOpen,
    color: "text-primary",
  },
  {
    key: "verses",
    value: 6236,
    icon: Heart,
    color: "text-accent",
  },
  {
    key: "languages",
    value: 3,
    icon: Globe,
    color: "text-success",
  },
  {
    key: "users",
    value: 10000,
    suffix: "+",
    icon: Users,
    color: "text-info",
  },
  {
    key: "downloads",
    value: 50000,
    suffix: "+",
    icon: Download,
    color: "text-warning",
  },
  {
    key: "uptime",
    value: 99.9,
    suffix: "%",
    icon: Clock,
    color: "text-error",
  },
];

function AnimatedCounter({
  targetValue,
  duration = 2000,
  suffix = "",
}: {
  targetValue: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById(`counter-${targetValue}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [targetValue, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * targetValue);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration, isVisible]);

  return (
    <span id={`counter-${targetValue}`}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection({ locale, messages }: StatsSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          {" "}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {messages?.home?.hero?.stats?.title || "Platform Statistics"}
          </h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            {messages?.home?.hero?.stats?.subtitle ||
              "Discover the scope of our Islamic multimedia platform"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="card text-center group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-surface border-2 border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`text-4xl md:text-5xl font-bold ${stat.color}`}
                    >
                      <AnimatedCounter
                        targetValue={stat.value}
                        suffix={stat.suffix || ""}
                      />
                    </div>{" "}
                    <h3 className="text-lg font-semibold text-foreground">
                      {messages?.home?.hero?.stats?.items?.[stat.key]?.title ||
                        stat.key}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {messages?.home?.hero?.stats?.items?.[stat.key]?.description ||
                        `${stat.key} description`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Islamic Quote */}
        <div className="text-center pt-16 max-w-4xl mx-auto">
          <div className="card bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20">
            <div className="space-y-6">
              {" "}
              <div className="quran-text text-2xl md:text-3xl text-primary">
                {messages?.home?.hero?.stats?.quote?.arabic ||
                  "وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ"}
              </div>
              <div className="text-lg md:text-xl text-muted italic">
                {messages?.home?.hero?.stats?.quote?.translation ||
                  "And We have sent down to you the Book as clarification for all things"}
              </div>
              <div className="text-sm text-muted font-medium">
                {messages?.home?.hero?.stats?.quote?.reference || "Quran 16:89"}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
          {[
            { key: "response_time", value: "<1s", color: "text-success" },
            { key: "accessibility", value: "AAA", color: "text-primary" },
            { key: "security", value: "SSL", color: "text-accent" },
            { key: "support", value: "24/7", color: "text-info" },
          ].map((metric, index) => (
            <div
              key={metric.key}
              className="text-center space-y-2 p-4 rounded-lg bg-surface/50 hover:bg-surface transition-colors duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>{" "}
              <div className="text-sm text-muted">
                {messages?.home?.hero?.stats?.metrics?.[metric.key] || metric.key}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
