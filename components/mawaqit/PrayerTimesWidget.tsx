'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Messages {
  mawaqit?: {
    prayer_times?: {
      title?: string;
      description?: string;
      loading?: string;
      error?: string;
    };
  };
}

interface PrayerTimesWidgetProps {
  mosqueId: string;
  locale: string;
  messages: Messages;
}

export function PrayerTimesWidget({ mosqueId, locale, messages }: PrayerTimesWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mosqueId]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getMosqueUrl = (id: string) => {
    const baseUrl = 'https://mawaqit.net';
    const langPrefix = locale === 'ar' ? 'ar' : 'en';
    return `${baseUrl}/${langPrefix}/w/${id}?showOnly5PrayerTimes=0`;
  };

  const getMosquePageUrl = (id: string) => {
    const baseUrl = 'https://mawaqit.net';
    const langPrefix = locale === 'ar' ? 'ar' : 'en';
    return `${baseUrl}/${langPrefix}/${id}`;
  };

  return (
    <div className="card group rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-center space-x-3 mb-2">
          <ClockIcon className="h-6 w-6" />
          <h3 className="text-2xl font-bold">
            {messages?.mawaqit?.prayer_times?.title || 
              (locale === 'ar' ? 'أوقات الصلاة' : locale === 'ru' ? 'Время молитв' : 'Prayer Times')}
          </h3>
        </div>
        <p className="text-primary-foreground/90">
          {messages?.mawaqit?.prayer_times?.description || 
            (locale === 'ar' ? 'أوقات الصلاة المباشرة ومعلومات المسجد' : 
             locale === 'ru' ? 'Время молитв в реальном времени и информация о мечети' : 
             'Live prayer times and mosque information')}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted">
              {messages?.mawaqit?.prayer_times?.loading || 
                (locale === 'ar' ? 'جاري تحميل أوقات الصلاة...' : 
                 locale === 'ru' ? 'Загрузка времени молитв...' : 
                 'Loading prayer times...')}
            </p>
          </div>
        )}

        {hasError && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-destructive">
              <GlobeAltIcon className="h-12 w-12 mx-auto mb-2" />
            </div>
            <p className="text-muted text-center">
              {messages?.mawaqit?.prayer_times?.error || 
                (locale === 'ar' ? 'تعذر تحميل أوقات الصلاة. يرجى المحاولة مرة أخرى لاحقاً.' : 
                 locale === 'ru' ? 'Не удалось загрузить время молитв. Пожалуйста, попробуйте позже.' : 
                 'Unable to load prayer times. Please try again later.')}
            </p>
            <a
              href={getMosquePageUrl(mosqueId)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {locale === 'ar' ? 'عرض على Mawaqit.net' : 
               locale === 'ru' ? 'Посмотреть на Mawaqit.net' : 
               'View on Mawaqit.net'}
            </a>
          </div>
        )}

        {/* Mawaqit Iframe Widget */}
        <div className={`relative ${isLoading || hasError ? 'hidden' : 'block'}`}>
          <div className="w-full">
            <iframe
              src={getMosqueUrl(mosqueId)}
              frameBorder="0"
              scrolling="no"
              className="w-full h-96 rounded-lg border border-primary/20"
              title={`Prayer Times - ${mosqueId}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
          
          {/* Iframe Overlay for Interaction */}
          <div className="absolute inset-0 pointer-events-none"></div>
        </div>

        {/* Footer Actions */}
        {!isLoading && !hasError && (
          <div className="mt-6 pt-4 border-t border-primary/20">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-muted">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {locale === 'ar' ? 'مدعوم من Mawaqit.net' : 
                   locale === 'ru' ? 'При поддержке Mawaqit.net' : 
                   'Powered by Mawaqit.net'}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={getMosquePageUrl(mosqueId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  {locale === 'ar' ? 'عرض التفاصيل الكاملة' : 
                   locale === 'ru' ? 'Посмотреть подробности' : 
                   'View Full Details'}
                </a>
                <span className="text-muted">|</span>
                <a
                  href="https://mawaqit.net/map"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  {locale === 'ar' ? 'البحث عن مساجد أخرى' : 
                   locale === 'ru' ? 'Найти другие мечети' : 
                   'Find Other Mosques'}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}