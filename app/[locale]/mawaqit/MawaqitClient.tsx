'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb locale={locale} messages={messages} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {messages?.mawaqit?.title || 'مواقيت الصلاة'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {messages?.mawaqit?.description || 
              'Find accurate prayer times for mosques worldwide. Locate nearby mosques and access their prayer schedules with Mawaqit integration.'}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Mosque Finder */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {messages?.mawaqit?.prayer_times?.title || 'Prayer Times - Al-Azhar Mosque, Cairo'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {messages?.mawaqit?.prayer_times?.description || 
                      'View current prayer times for Al-Azhar Mosque in Cairo, Egypt. Select a mosque from the finder to see specific prayer times.'}
                  </p>
                  
                  {/* Default Mawaqit Widget */}
                  <div className="w-full">
                    <iframe
                      src="//mawaqit.net/en/w/masjid-alazhar-le-caire-4293024-egypt?showOnly5PrayerTimes=0"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full h-96 rounded-lg border-0"
                      title="Al-Azhar Mosque Prayer Times"
                    />
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">About Mawaqit</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Mawaqit is a free service (WAQF) that provides accurate prayer times, 
                    mosque management tools, and community features. The platform serves 
                    thousands of mosques worldwide with reliable prayer schedules, 
                    announcements, and mobile applications.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <a
                      href="https://mawaqit.net/en/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                    >
                      Visit Mawaqit.net
                    </a>
                    <a
                      href="https://mawaqit.net/map"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors border border-emerald-400"
                    >
                      Explore Map
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