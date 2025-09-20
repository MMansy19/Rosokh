'use client';

import React from 'react';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Messages {
  mawaqit?: {
    featured_mosques?: {
      title?: string;
      description?: string;
    };
  };
}

interface FeaturedMosquesProps {
  locale: string;
  messages: Messages;
  onMosqueSelect: (mosqueId: string) => void;
}

interface FeaturedMosque {
  id: string;
  name: string;
  location: string;
  country: string;
  image?: string;
  description: string;
}

export function FeaturedMosques({ locale, messages, onMosqueSelect }: FeaturedMosquesProps) {
  const featuredMosques: FeaturedMosque[] = [
    {
      id: 'masjid-alazhar-le-caire-4293024-egypt',
      name: 'Al-Azhar Mosque',
      location: 'Cairo',
      country: 'Egypt',
      description: 'One of the most prestigious centers of Islamic learning in the world',
    },
    {
      id: 'grande-mosquee-de-paris-paris-france',
      name: 'Grande Mosquée de Paris',
      location: 'Paris',
      country: 'France',
      description: 'The largest mosque in France and a center for French Islamic community',
    },
    {
      id: 'islamic-center-of-washington-washington-usa',
      name: 'Islamic Center of Washington',
      location: 'Washington DC',
      country: 'USA',
      description: 'Historic mosque serving the Muslim community in the US capital',
    },
    {
      id: 'london-central-mosque-london-uk',
      name: 'London Central Mosque',
      location: 'London',
      country: 'United Kingdom',
      description: 'Major mosque and Islamic cultural center in Regent\'s Park',
    },
  ];

  return (
    <div className="card group rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {messages?.mawaqit?.featured_mosques?.title || 
            (locale === 'ar' ? 'المساجد المميزة' : 
             locale === 'ru' ? 'Рекомендуемые мечети' : 
             'Featured Mosques')}
        </h3>
        <p className="text-muted">
          {messages?.mawaqit?.featured_mosques?.description || 
            (locale === 'ar' ? 'اكتشف أوقات الصلاة للمساجد المشهورة حول العالم' : 
             locale === 'ru' ? 'Откройте для себя время молитв в знаменитых мечетях по всему миру' : 
             'Discover prayer times for renowned mosques around the world')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuredMosques.map((mosque) => (
          <div
            key={mosque.id}
            onClick={() => onMosqueSelect(mosque.id)}
            className="border border-primary/20 rounded-lg p-4 hover:bg-surface cursor-pointer transition-all duration-200 group hover:shadow-md"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <ClockIcon className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mosque.name}
                </h4>
                
                <div className="flex items-center space-x-2 text-sm text-muted mt-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{mosque.location}, {mosque.country}</span>
                </div>
                
                <p className="text-sm text-muted mt-2 line-clamp-2">
                  {mosque.description}
                </p>
                
                <div className="mt-3">
                  <span className="text-xs text-primary font-medium">
                    {locale === 'ar' ? 'انقر لعرض أوقات الصلاة ←' : 
                     locale === 'ru' ? 'Нажмите, чтобы увидеть время молитв →' : 
                     'Click to view prayer times →'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <div className="flex items-center space-x-2 text-sm">
          <ClockIcon className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">
            {locale === 'ar' ? 'جميع أوقات الصلاة مدعومة من Mawaqit.net ومحدّثة في الوقت الفعلي' : 
             locale === 'ru' ? 'Все время молитв предоставлены Mawaqit.net и обновляются в реальном времени' : 
             'All prayer times are powered by Mawaqit.net and updated in real-time'}
          </span>
        </div>
      </div>
    </div>
  );
}