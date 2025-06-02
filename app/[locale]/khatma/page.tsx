'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface KhatmaSession {
  id: string;
  name: string;
  startDate: string;
  targetDate: string;
  currentProgress: number;
  totalPages: number;
  status: 'active' | 'completed' | 'paused';
  dailyTarget: number;
}

interface ReadingEntry {
  id: string;
  date: string;
  surahFrom: number;
  ayahFrom: number;
  surahTo: number;
  ayahTo: number;
  pagesRead: number;
  duration: number; // in minutes
  notes?: string;
}

export default function KhatmaPage() {
  const t = useTranslations('khatma');
  const [khatmaSessions, setKhatmaSessions] = useState<KhatmaSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [readingEntries, setReadingEntries] = useState<ReadingEntry[]>([]);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [showAddReadingForm, setShowAddReadingForm] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('khatma_sessions');
    const savedEntries = localStorage.getItem('reading_entries');

    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      setKhatmaSessions(sessions);
      if (sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessions[0].id);
      }
    }

    if (savedEntries) {
      setReadingEntries(JSON.parse(savedEntries));
    }
  }, [selectedSession]);

  // Save data to localStorage
  const saveToStorage = (sessions: KhatmaSession[], entries: ReadingEntry[]) => {
    localStorage.setItem('khatma_sessions', JSON.stringify(sessions));
    localStorage.setItem('reading_entries', JSON.stringify(entries));
  };

  const createNewSession = (formData: FormData) => {
    const newSession: KhatmaSession = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      startDate: formData.get('startDate') as string,
      targetDate: formData.get('targetDate') as string,
      currentProgress: 0,
      totalPages: 604, // Standard Quran pages
      status: 'active',
      dailyTarget: calculateDailyTarget(
        formData.get('startDate') as string,
        formData.get('targetDate') as string
      )
    };

    const updatedSessions = [...khatmaSessions, newSession];
    setKhatmaSessions(updatedSessions);
    setSelectedSession(newSession.id);
    saveToStorage(updatedSessions, readingEntries);
    setShowNewSessionForm(false);
  };

  const calculateDailyTarget = (startDate: string, targetDate: string) => {
    const start = new Date(startDate);
    const end = new Date(targetDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(604 / diffDays);
  };

  const addReadingEntry = (formData: FormData) => {
    const newEntry: ReadingEntry = {
      id: Date.now().toString(),
      date: formData.get('date') as string,
      surahFrom: parseInt(formData.get('surahFrom') as string),
      ayahFrom: parseInt(formData.get('ayahFrom') as string),
      surahTo: parseInt(formData.get('surahTo') as string),
      ayahTo: parseInt(formData.get('ayahTo') as string),
      pagesRead: parseInt(formData.get('pagesRead') as string),
      duration: parseInt(formData.get('duration') as string),
      notes: formData.get('notes') as string || undefined
    };

    const updatedEntries = [...readingEntries, newEntry];
    setReadingEntries(updatedEntries);

    // Update session progress
    if (selectedSession) {
      const updatedSessions = khatmaSessions.map(session => {
        if (session.id === selectedSession) {
          const totalPagesRead = updatedEntries
            .filter(entry => entry.date >= session.startDate)
            .reduce((sum, entry) => sum + entry.pagesRead, 0);
          
          return {
            ...session,
            currentProgress: Math.min(totalPagesRead, session.totalPages),
            status: totalPagesRead >= session.totalPages ? 'completed' as const : session.status
          };
        }
        return session;
      });
      
      setKhatmaSessions(updatedSessions);
      saveToStorage(updatedSessions, updatedEntries);
    }

    setShowAddReadingForm(false);
  };

  const currentSession = khatmaSessions.find(s => s.id === selectedSession);
  const sessionEntries = readingEntries.filter(entry => 
    currentSession && entry.date >= currentSession.startDate
  );

  const getProgressPercentage = (session: KhatmaSession) => {
    return Math.round((session.currentProgress / session.totalPages) * 100);
  };

  const getDaysRemaining = (session: KhatmaSession) => {
    const today = new Date();
    const target = new Date(session.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReadingStreak = () => {
    if (sessionEntries.length === 0) return 0;
    
    const sortedEntries = sessionEntries.sort((a, b) => 
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

  const surahs = [
    'Al-Fatiha', 'Al-Baqarah', 'Ali \'Imran', 'An-Nisa', 'Al-Ma\'idah', 'Al-An\'am',
    'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf',
    // ... would contain all 114 surahs
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {t('title')}
          </h1>
          <div className="text-4xl mb-4">📖</div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Session Selector and New Session Button */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            {khatmaSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedSession === session.id
                    ? 'bg-islamic-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-islamic-700 dark:text-islamic-300 hover:bg-islamic-100 dark:hover:bg-gray-700'
                }`}
              >
                {session.name}
                {session.status === 'completed' && ' ✅'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewSessionForm(true)}
            className="px-6 py-3 bg-tosca-500 text-white rounded-lg hover:bg-tosca-600 transition-colors duration-200"
          >
            {t('newKhatma')}
          </button>
        </div>

        {currentSession ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                  {currentSession.name}
                </h2>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-islamic-700 dark:text-islamic-300">{t('progress')}</span>
                    <span className="font-bold text-islamic-800 dark:text-islamic-200">
                      {getProgressPercentage(currentSession)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-islamic-500 to-tosca-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(currentSession)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-islamic-600 dark:text-islamic-400 mt-1">
                    <span>{currentSession.currentProgress} {t('pages')}</span>
                    <span>{currentSession.totalPages} {t('pages')}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                      {getDaysRemaining(currentSession)}
                    </div>
                    <div className="text-sm text-islamic-600 dark:text-islamic-400">
                      {t('daysLeft')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                      {currentSession.dailyTarget}
                    </div>
                    <div className="text-sm text-islamic-600 dark:text-islamic-400">
                      {t('dailyTarget')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                      {getReadingStreak()}
                    </div>
                    <div className="text-sm text-islamic-600 dark:text-islamic-400">
                      {t('dayStreak')}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                      {sessionEntries.reduce((sum, entry) => sum + entry.duration, 0)}
                    </div>
                    <div className="text-sm text-islamic-600 dark:text-islamic-400">
                      {t('totalMinutes')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reading Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200">
                    {t('recentSessions')}
                  </h3>
                  <button
                    onClick={() => setShowAddReadingForm(true)}
                    className="px-4 py-2 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200"
                  >
                    {t('addReading')}
                  </button>
                </div>

                <div className="space-y-4">
                  {sessionEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-islamic-800 dark:text-islamic-200">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="text-islamic-600 dark:text-islamic-400 text-sm">
                            Surah {entry.surahFrom}:{entry.ayahFrom} - Surah {entry.surahTo}:{entry.ayahTo}
                          </div>
                          {entry.notes && (
                            <div className="text-islamic-600 dark:text-islamic-400 text-sm mt-1 italic">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-islamic-800 dark:text-islamic-200">
                            {entry.pagesRead} {t('pages')}
                          </div>
                          <div className="text-islamic-600 dark:text-islamic-400 text-sm">
                            {entry.duration} {t('minutes')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {sessionEntries.length === 0 && (
                    <div className="text-center py-8 text-islamic-600 dark:text-islamic-400">
                      {t('noReadingSessions')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {t('quickActions')}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddReadingForm(true)}
                    className="w-full p-3 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200"
                  >
                    {t('logReading')}
                  </button>
                  <button className="w-full p-3 bg-tosca-500 text-white rounded-lg hover:bg-tosca-600 transition-colors duration-200">
                    {t('viewAnalytics')}
                  </button>
                  <button className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
                    {t('exportProgress')}
                  </button>
                </div>
              </div>

              {/* Motivational Quote */}
              <div className="bg-gradient-to-br from-islamic-500 to-tosca-500 text-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="text-2xl font-amiri mb-3">
                    وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
                  </div>
                  <div className="text-sm opacity-90">
                    "And recite the Quran with measured recitation."
                  </div>
                  <div className="text-xs opacity-75 mt-2">
                    Quran 73:4
                  </div>
                </div>
              </div>

              {/* This Week's Goal */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {t('weeklyGoal')}
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-islamic-600 dark:text-islamic-300 mb-2">
                    {currentSession.dailyTarget * 7}
                  </div>
                  <div className="text-sm text-islamic-600 dark:text-islamic-400">
                    {t('pagesThisWeek')}
                  </div>
                  <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-tosca-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs text-islamic-600 dark:text-islamic-400 mt-1">
                    60% {t('completed')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
              {t('noKhatma')}
            </h2>
            <p className="text-islamic-600 dark:text-islamic-400 mb-6">
              {t('startFirstKhatma')}
            </p>
            <button
              onClick={() => setShowNewSessionForm(true)}
              className="px-8 py-4 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200 text-lg"
            >
              {t('createKhatma')}
            </button>
          </div>
        )}

        {/* New Session Modal */}
        {showNewSessionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {t('newKhatma')}
              </h3>
              <form action={createNewSession}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                      {t('sessionName')}
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      placeholder={t('enterSessionName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                      {t('startDate')}
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                      {t('targetDate')}
                    </label>
                    <input
                      name="targetDate"
                      type="date"
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewSessionForm(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-islamic-700 dark:text-islamic-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200"
                  >
                    {t('create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Reading Modal */}
        {showAddReadingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {t('addReading')}
              </h3>
              <form action={addReadingEntry}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                      {t('date')}
                    </label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('fromSurah')}
                      </label>
                      <input
                        name="surahFrom"
                        type="number"
                        min="1"
                        max="114"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('fromAyah')}
                      </label>
                      <input
                        name="ayahFrom"
                        type="number"
                        min="1"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('toSurah')}
                      </label>
                      <input
                        name="surahTo"
                        type="number"
                        min="1"
                        max="114"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('toAyah')}
                      </label>
                      <input
                        name="ayahTo"
                        type="number"
                        min="1"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('pagesRead')}
                      </label>
                      <input
                        name="pagesRead"
                        type="number"
                        min="1"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                        {t('duration')} ({t('minutes')})
                      </label>
                      <input
                        name="duration"
                        type="number"
                        min="1"
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                      {t('notes')} ({t('optional')})
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 dark:bg-gray-700 dark:text-white"
                      placeholder={t('addNotes')}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddReadingForm(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-islamic-700 dark:text-islamic-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200"
                  >
                    {t('addEntry')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
