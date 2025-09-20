'use client';

import React, { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Messages {
  mawaqit?: {
    mosque_finder?: {
      title?: string;
      search_placeholder?: string;
      find_button?: string;
    };
  };
}

interface MosqueFinderProps {
  locale: string;
  messages: Messages;
  userLocation: { lat: number; lng: number } | null;
  onMosqueSelect: (mosqueId: string) => void;
}

interface Mosque {
  id: string;
  name: string;
  location: string;
  country: string;
  distance?: number;
  url: string;
}

export function MosqueFinder({ locale, messages, userLocation, onMosqueSelect }: MosqueFinderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Mosque[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  // Featured mosques with their Mawaqit IDs
  const featuredMosques: Mosque[] = [
    {
      id: 'masjid-alazhar-le-caire-4293024-egypt',
      name: 'Al-Azhar Mosque',
      location: 'Cairo',
      country: 'Egypt',
      url: 'https://mawaqit.net/en/masjid-alazhar-le-caire-4293024-egypt'
    },
    {
      id: 'masjid-al-haram-mecca-saudi-arabia',
      name: 'Masjid al-Haram',
      location: 'Mecca',
      country: 'Saudi Arabia',
      url: 'https://mawaqit.net/en/'
    },
    {
      id: 'masjid-an-nabawi-medina-saudi-arabia',
      name: 'Masjid an-Nabawi',
      location: 'Medina',
      country: 'Saudi Arabia',
      url: 'https://mawaqit.net/en/'
    },
    {
      id: 'mosquee-de-paris-paris-france',
      name: 'Grande Mosquée de Paris',
      location: 'Paris',
      country: 'France',
      url: 'https://mawaqit.net/en/'
    }
  ];

  const countries = [
    'Algeria', 'Egypt', 'France', 'Germany', 'Italy', 'Jordan', 'Kuwait', 
    'Morocco', 'Netherlands', 'Saudi Arabia', 'Spain', 'Tunisia', 'Turkey', 
    'United Kingdom', 'United States'
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate API search (in real implementation, you'd call Mawaqit API)
      const filtered = featuredMosques.filter(mosque => 
        mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mosque.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mosque.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMosqueClick = (mosque: Mosque) => {
    onMosqueSelect(mosque.id);
  };

  const displayMosques = searchResults.length > 0 ? searchResults : featuredMosques;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {messages?.mawaqit?.mosque_finder?.title || 
            (locale === 'ar' ? 'البحث عن المساجد' : locale === 'ru' ? 'Найти мечети' : 'Find Mosques')}
        </h2>
        <p className="text-muted text-sm">
          {locale === 'ar' 
            ? 'ابحث عن المساجد في جميع أنحاء العالم أو تصفح المواقع المميزة'
            : locale === 'ru' 
            ? 'Поиск мечетей по всему миру или просмотр рекомендуемых мест'
            : 'Search for mosques worldwide or browse featured locations'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder={messages?.mawaqit?.mosque_finder?.search_placeholder || 
              (locale === 'ar' ? 'ابحث عن مسجد أو مدينة أو دولة...' : locale === 'ru' ? 'Поиск мечети, города или страны...' : 'Search mosque, city, or country...')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-foreground"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-80 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSearching 
            ? (locale === 'ar' ? 'جاري البحث...' : locale === 'ru' ? 'Поиск...' : 'Searching...') 
            : (messages?.mawaqit?.mosque_finder?.find_button || 
               (locale === 'ar' ? 'البحث عن المساجد' : locale === 'ru' ? 'Найти мечети' : 'Find Mosques'))}
        </button>
      </div>

      {/* Country Filter */}
      <div>
        <select
          value={selectedCountry}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}
          className="w-full p-3 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-foreground"
        >
          <option value="">
            {locale === 'ar' ? 'جميع البلدان' : locale === 'ru' ? 'Все страны' : 'All Countries'}
          </option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* Mosque List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          {searchResults.length > 0 
            ? (locale === 'ar' ? 'نتائج البحث' : locale === 'ru' ? 'Результаты поиска' : 'Search Results')
            : (locale === 'ar' ? 'المساجد المميزة' : locale === 'ru' ? 'Рекомендуемые мечети' : 'Featured Mosques')}
        </h3>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {displayMosques
            .filter(mosque => !selectedCountry || mosque.country === selectedCountry)
            .map((mosque) => (
            <div
              key={mosque.id}
              onClick={() => handleMosqueClick(mosque)}
              className="p-4 border border-primary/20 rounded-lg hover:bg-surface cursor-pointer transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground group-hover:text-primary truncate">
                    {mosque.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-muted">
                    <span>{mosque.location}</span>
                    <span>•</span>
                    <span>{mosque.country}</span>
                  </div>
                  {mosque.distance && (
                    <div className="text-xs text-primary mt-1">
                      {mosque.distance.toFixed(1)} km {locale === 'ar' ? 'بعيداً' : locale === 'ru' ? 'от вас' : 'away'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayMosques.filter(mosque => !selectedCountry || mosque.country === selectedCountry).length === 0 && (
          <div className="text-center py-8 text-muted">
            <GlobeAltIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>
              {locale === 'ar' 
                ? 'لم يتم العثور على مساجد. جرب تعديل معايير البحث.'
                : locale === 'ru' 
                ? 'Мечети не найдены. Попробуйте изменить критерии поиска.'
                : 'No mosques found. Try adjusting your search criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Mawaqit Link */}
      <div className="pt-4 border-t border-primary/20">
        <a
          href="https://mawaqit.net/map"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 text-primary hover:text-primary/80 transition-colors"
        >
          <GlobeAltIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            {locale === 'ar' 
              ? 'تصفح جميع المساجد على Mawaqit.net'
              : locale === 'ru' 
              ? 'Просмотреть все мечети на Mawaqit.net'
              : 'Browse all mosques on Mawaqit.net'}
          </span>
        </a>
      </div>
    </div>
  );
}