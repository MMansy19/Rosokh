'use client';

import React, { useState, useEffect } from 'react';
import { MosqueFinder } from '../../../components/mawaqit/MosqueFinder';
import { PrayerTimesWidget } from '../../../components/mawaqit/PrayerTimesWidget';
import { FeaturedMosques } from '../../../components/mawaqit/FeaturedMosques';

interface Messages {
  mawaqit?: {
    title?: string;
    description?: string;
    mosque_finder?: {
      title?: string;
      search_placeholder?: string;
      find_button?: string;
    };
    prayer_times?: {
      title?: string;
      description?: string;
    };
    featured_mosques?: {
      title?: string;
      description?: string;
    };
  };
}

interface MawaqitClientProps {
  locale: string;
  messages: Messages;
}

export default function MawaqitClient({ locale, messages }: MawaqitClientProps) {
  const [selectedMosque, setSelectedMosque] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location for nearby mosques
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: `/${locale}` },
    { label: messages?.mawaqit?.title || 'Prayer Times', href: `/${locale}/mawaqit` },
  ];

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <span className="text-2xl">🕌</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              {messages?.mawaqit?.title || 'مواقيت الصلاة'}
            </h1>
          </div>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            {messages?.mawaqit?.description || 
              'Find accurate prayer times for mosques worldwide. Locate nearby mosques and access their prayer schedules with Mawaqit integration.'}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Mosque Finder */}
          <div className="lg:col-span-4">
            <div className="card group rounded-lg shadow-lg p-6 sticky top-4">
              <MosqueFinder
                locale={locale}
                messages={messages}
                userLocation={userLocation}
                onMosqueSelect={setSelectedMosque}
              />
            </div>
          </div>

          {/* Right Column - Prayer Times Display */}
          <div className="lg:col-span-8">
            {selectedMosque ? (
              <PrayerTimesWidget
                mosqueId={selectedMosque}
                locale={locale}
                messages={messages}
              />
            ) : (
              <div className="space-y-8">
                {/* Featured Mosques */}
                <FeaturedMosques
                  locale={locale}
                  messages={messages}
                  onMosqueSelect={setSelectedMosque}
                />

                {/* Default Prayer Times Widget */}
                <div className="card group rounded-lg shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {messages?.mawaqit?.prayer_times?.title || 'Prayer Times - Al-Azhar Mosque, Cairo'}
                  </h3>
                  <p className="text-muted mb-6">
                    {messages?.mawaqit?.prayer_times?.description || 
                      'View current prayer times for Al-Azhar Mosque in Cairo, Egypt. Select a mosque from the finder to see specific prayer times.'}
                  </p>
                  
                  {/* Default Mawaqit Widget */}
                  <div className="w-full">
                    <iframe
                      src={`//mawaqit.net/${locale === 'ar' ? 'ar' : 'en'}/w/masjid-alazhar-le-caire-4293024-egypt?showOnly5PrayerTimes=0`}
                      frameBorder="0"
                      scrolling="no"
                      className="w-full h-96 rounded-lg border border-primary/20"
                      title="Al-Azhar Mosque Prayer Times"
                    />
                  </div>
                </div>

                {/* Information Section */}
                <div className="card group rounded-lg shadow-lg p-8 bg-gradient-to-r from-primary to-primary/80 text-secondary">
                  <h3 className="text-2xl font-bold mb-4">
                    {locale === 'ar' ? 'حول مواقيت' : locale === 'ru' ? 'О Mawaqit' : 'About Mawaqit'}
                  </h3>
                  <p className="text-primary-foreground/90 leading-relaxed">
                    {locale === 'ar' 
                      ? 'مواقيت هي خدمة مجانية (وقف) توفر أوقات الصلاة الدقيقة وأدوات إدارة المساجد وميزات المجتمع. تخدم المنصة آلاف المساجد في جميع أنحاء العالم بجداول أوقات الصلاة الموثوقة والإعلانات والتطبيقات المحمولة.'
                      : locale === 'ru'
                      ? 'Mawaqit — это бесплатная служба (ВАКФ), которая предоставляет точное время молитв, инструменты управления мечетями и функции сообщества. Платформа обслуживает тысячи мечетей по всему миру с надежными расписаниями молитв, объявлениями и мобильными приложениями.'
                      : 'Mawaqit is a free service (WAQF) that provides accurate prayer times, mosque management tools, and community features. The platform serves thousands of mosques worldwide with reliable prayer schedules, announcements, and mobile applications.'
                    }
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <a
                      href={`https://mawaqit.net/${locale === 'ar' ? 'ar' : 'en'}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                        className="bg-button bg-hoverButton text-secondary px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {locale === 'ar' ? 'زيارة Mawaqit.net' : locale === 'ru' ? 'Посетить Mawaqit.net' : 'Visit Mawaqit.net'}
                    </a>
                    <a
                      href="https://mawaqit.net/map"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-foreground/20 text-secondary px-6 py-2 rounded-lg font-medium hover:bg-primary-foreground/30 transition-colors border border-primary-foreground/30"
                    >
                      {locale === 'ar' ? 'استكشاف الخريطة' : locale === 'ru' ? 'Исследовать карту' : 'Explore Map'}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}