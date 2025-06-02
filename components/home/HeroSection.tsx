'use client';

import Link from 'next/link';
import { BookOpen, Headphones, Calendar, BarChart3, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  locale: string;
  messages: any;
}

const features = [
  { key: 'quran', href: '/quran', icon: BookOpen, color: 'text-primary' },
  { key: 'audio', href: '/audio', icon: Headphones, color: 'text-accent' },
  { key: 'calendar', href: '/calendar', icon: Calendar, color: 'text-success' },
  { key: 'analytics', href: '/analytics', icon: BarChart3, color: 'text-info' },
];

export function HeroSection({ locale, messages }: HeroSectionProps) {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Geometric Background */}
      <div className="absolute inset-0 geometric-bg opacity-30"></div>
      
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Bismillah */}
          <div className="arabic-text text-2xl md:text-3xl text-primary animate-fadeIn">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 animate-slideInLeft">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground">
              <span className="block">Rosokh</span>
              <span className="block text-primary arabic-text text-3xl md:text-4xl lg:text-5xl mt-2">
                رسوخ
              </span>
            </h1>            <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed">
              {messages?.home?.hero?.subtitle || "Your comprehensive Islamic multimedia platform"}
            </p>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto animate-slideInRight">            <p className="text-lg md:text-xl text-muted leading-relaxed">
              {messages?.home?.hero?.description || "Discover the beauty of Islamic knowledge through Quran reading, audio recitations, and spiritual growth tools."}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fadeIn">
            <Link
              href={`/${locale}/quran`}
              className="btn-primary flex items-center space-x-2 rtl:space-x-reverse px-8 py-4 text-lg group"
            >
              <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span>{messages?.common?.actions?.read || "Read"} {messages?.common?.navigation?.quran || "Quran"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-200" />
            </Link>
            
            <Link
              href={`/${locale}/audio`}
              className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse px-8 py-4 text-lg group"
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span>{messages?.common?.actions?.listen || "Listen"} {messages?.common?.navigation?.audio || "Audio"}</span>
            </Link>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-16 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.key}
                  href={`/${locale}${feature.href}`}
                  className="card group hover:scale-105 transition-all duration-300 cursor-pointer p-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-lg bg-primary/10 ${feature.color} group-hover:bg-primary/20 transition-colors duration-200`}>
                      <Icon className="w-8 h-8" />
                    </div>                    <h3 className="font-semibold text-foreground text-center">
                      {messages?.common?.navigation?.[feature.key] || feature.key}
                    </h3>
                    <p className="text-sm text-muted text-center leading-relaxed">
                      {messages?.home?.hero?.features?.[feature.key] || `Explore ${feature.key}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center space-y-2 animate-fadeIn">
              <div className="text-3xl md:text-4xl font-bold text-primary">114</div>
              <div className="text-muted">{messages?.home?.hero?.stats?.surahs || "Surahs"}</div>
            </div>
            <div className="text-center space-y-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-bold text-accent">6,236</div>
              <div className="text-muted">{messages?.home?.hero?.stats?.verses || "Verses"}</div>
            </div>
            <div className="text-center space-y-2 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl md:text-4xl font-bold text-success">3</div>
              <div className="text-muted">{messages?.home?.hero?.stats?.languages || "Languages"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
