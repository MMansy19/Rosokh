'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AnalyticsData {
  totalReadingTime: number;
  totalPagesRead: number;
  completedKhatmas: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  favoriteReadingTime: string;
  weeklyProgress: number[];
  monthlyProgress: number[];
  surahProgress: { [key: number]: number };
}

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage and calculate analytics
    const calculateAnalytics = () => {
      const sessions = JSON.parse(localStorage.getItem('khatma_sessions') || '[]');
      const entries = JSON.parse(localStorage.getItem('reading_entries') || '[]');

      const analytics: AnalyticsData = {
        totalReadingTime: entries.reduce((sum: number, entry: any) => sum + entry.duration, 0),
        totalPagesRead: entries.reduce((sum: number, entry: any) => sum + entry.pagesRead, 0),
        completedKhatmas: sessions.filter((s: any) => s.status === 'completed').length,
        currentStreak: calculateCurrentStreak(entries),
        longestStreak: calculateLongestStreak(entries),
        averageSessionTime: entries.length > 0 
          ? Math.round(entries.reduce((sum: number, entry: any) => sum + entry.duration, 0) / entries.length)
          : 0,
        favoriteReadingTime: getFavoriteReadingTime(entries),
        weeklyProgress: getWeeklyProgress(entries),
        monthlyProgress: getMonthlyProgress(entries),
        surahProgress: getSurahProgress(entries)
      };

      setAnalyticsData(analytics);
      setLoading(false);
    };

    calculateAnalytics();
  }, []);

  const calculateCurrentStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLongestStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let longestStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i].date);
      const previousDate = new Date(sortedEntries[i - 1].date);
      
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  };

  const getFavoriteReadingTime = (entries: any[]) => {
    if (entries.length === 0) return 'Morning';
    
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    entries.forEach((entry: any) => {
      const hour = new Date(entry.date).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 21) timeSlots.evening++;
      else timeSlots.night++;
    });
    
    return Object.keys(timeSlots).reduce((a, b) => 
      timeSlots[a as keyof typeof timeSlots] > timeSlots[b as keyof typeof timeSlots] ? a : b
    );
  };

  const getWeeklyProgress = (entries: any[]) => {
    const weekData = new Array(7).fill(0);
    const today = new Date();
    
    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        weekData[6 - diffDays] += entry.pagesRead;
      }
    });
    
    return weekData;
  };

  const getMonthlyProgress = (entries: any[]) => {
    const monthData = new Array(30).fill(0);
    const today = new Date();
    
    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 30) {
        monthData[29 - diffDays] += entry.pagesRead;
      }
    });
    
    return monthData;
  };

  const getSurahProgress = (entries: any[]) => {
    const surahData: { [key: number]: number } = {};
    
    entries.forEach((entry: any) => {
      for (let surah = entry.surahFrom; surah <= entry.surahTo; surah++) {
        surahData[surah] = (surahData[surah] || 0) + 1;
      }
    });
    
    return surahData;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const chartData = selectedPeriod === 'week' 
    ? analyticsData?.weeklyProgress || []
    : analyticsData?.monthlyProgress || [];

  const maxValue = Math.max(...chartData, 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-islamic-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-islamic-600 dark:text-islamic-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {t('title')}
          </h1>
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {analyticsData ? (
          <>
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                  {formatDuration(analyticsData.totalReadingTime)}
                </div>
                <div className="text-islamic-600 dark:text-islamic-400">
                  {t('totalReadingTime')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">📖</div>
                <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                  {analyticsData.totalPagesRead}
                </div>
                <div className="text-islamic-600 dark:text-islamic-400">
                  {t('totalPagesRead')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                  {analyticsData.currentStreak}
                </div>
                <div className="text-islamic-600 dark:text-islamic-400">
                  {t('currentStreak')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                  {analyticsData.completedKhatmas}
                </div>
                <div className="text-islamic-600 dark:text-islamic-400">
                  {t('completedKhatmas')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Reading Progress Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200">
                    {t('readingProgress')}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        selectedPeriod === 'week'
                          ? 'bg-islamic-500 text-white'
                          : 'bg-islamic-100 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300'
                      }`}
                    >
                      {t('week')}
                    </button>
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        selectedPeriod === 'month'
                          ? 'bg-islamic-500 text-white'
                          : 'bg-islamic-100 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300'
                      }`}
                    >
                      {t('month')}
                    </button>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end gap-1 h-48">
                  {chartData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-islamic-100 dark:bg-gray-700 rounded-t flex flex-col justify-end relative group"
                    >
                      <div
                        className="bg-gradient-to-t from-islamic-500 to-tosca-500 rounded-t transition-all duration-300"
                        style={{ height: `${(value / maxValue) * 100}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {value} {t('pages')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-islamic-600 dark:text-islamic-400 mt-2">
                  <span>{selectedPeriod === 'week' ? t('7DaysAgo') : t('30DaysAgo')}</span>
                  <span>{t('today')}</span>
                </div>
              </div>

              {/* Additional Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                  {t('additionalStats')}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-islamic-700 dark:text-islamic-300">{t('longestStreak')}</span>
                    <span className="font-bold text-islamic-800 dark:text-islamic-200">
                      {analyticsData.longestStreak} {t('days')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-islamic-700 dark:text-islamic-300">{t('averageSession')}</span>
                    <span className="font-bold text-islamic-800 dark:text-islamic-200">
                      {formatDuration(analyticsData.averageSessionTime)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-islamic-700 dark:text-islamic-300">{t('favoriteTime')}</span>
                    <span className="font-bold text-islamic-800 dark:text-islamic-200 capitalize">
                      {t(analyticsData.favoriteReadingTime.toLowerCase())}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-islamic-700 dark:text-islamic-300">{t('avgPagesPerDay')}</span>
                    <span className="font-bold text-islamic-800 dark:text-islamic-200">
                      {Math.round(analyticsData.totalPagesRead / Math.max(chartData.length, 1))}
                    </span>
                  </div>
                </div>

                {/* Reading Goals */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-islamic-800 dark:text-islamic-200 mb-4">
                    {t('readingGoals')}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-islamic-700 dark:text-islamic-300">{t('dailyGoal')}</span>
                        <span className="text-islamic-600 dark:text-islamic-400">5 {t('pages')}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-islamic-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-islamic-700 dark:text-islamic-300">{t('weeklyGoal')}</span>
                        <span className="text-islamic-600 dark:text-islamic-400">35 {t('pages')}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-tosca-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Read Surahs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                {t('mostReadSurahs')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.surahProgress)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([surah, count]) => (
                    <div key={surah} className="p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-islamic-800 dark:text-islamic-200">
                            {t('surah')} {surah}
                          </div>
                          <div className="text-sm text-islamic-600 dark:text-islamic-400">
                            {count} {t('sessions')}
                          </div>
                        </div>
                        <div className="text-2xl">📖</div>
                      </div>
                    </div>
                  ))}
              </div>

              {Object.keys(analyticsData.surahProgress).length === 0 && (
                <div className="text-center py-8 text-islamic-600 dark:text-islamic-400">
                  {t('noSurahData')}
                </div>
              )}
            </div>

            {/* Motivational Section */}
            <div className="mt-8 bg-gradient-to-br from-islamic-500 to-tosca-500 text-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">{t('keepGoing')}</h3>
              <div className="text-4xl font-amiri mb-4">
                وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
              </div>
              <p className="text-lg opacity-90 mb-4">
                "And whoever fears Allah - He will make for him a way out."
              </p>
              <p className="text-sm opacity-75">Quran 65:2</p>
              
              {analyticsData.currentStreak > 0 && (
                <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
                  <p className="text-lg">
                    {t('streakMessage', { days: analyticsData.currentStreak })}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
              {t('noDataYet')}
            </h2>
            <p className="text-islamic-600 dark:text-islamic-400 mb-6">
              {t('startReading')}
            </p>
            <a
              href="/quran"
              className="inline-block px-8 py-4 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200 text-lg"
            >
              {t('startReadingQuran')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
