'use client';

import { useState, useEffect } from 'react';

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
  sessionId: string;
}

interface KhatmaClientProps {
  locale: string;
  messages: any;
}

export default function KhatmaClient({ locale, messages }: KhatmaClientProps) {
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
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (khatmaSessions.length > 0) {
      localStorage.setItem('khatma_sessions', JSON.stringify(khatmaSessions));
    }
  }, [khatmaSessions]);

  useEffect(() => {
    if (readingEntries.length > 0) {
      localStorage.setItem('reading_entries', JSON.stringify(readingEntries));
    }
  }, [readingEntries]);

  const currentSession = khatmaSessions.find(session => session.id === selectedSession);
  const sessionEntries = readingEntries.filter(entry => entry.sessionId === selectedSession);

  const createNewSession = (sessionData: Omit<KhatmaSession, 'id' | 'currentProgress'>) => {
    const newSession: KhatmaSession = {
      ...sessionData,
      id: Date.now().toString(),
      currentProgress: 0
    };

    setKhatmaSessions(prev => [...prev, newSession]);
    setSelectedSession(newSession.id);
    setShowNewSessionForm(false);
  };

  const addReadingEntry = (entryData: Omit<ReadingEntry, 'id'>) => {
    const newEntry: ReadingEntry = {
      ...entryData,
      id: Date.now().toString()
    };

    setReadingEntries(prev => [...prev, newEntry]);

    // Update session progress
    if (currentSession) {
      const newProgress = currentSession.currentProgress + entryData.pagesRead;
      setKhatmaSessions(prev =>
        prev.map(session =>
          session.id === selectedSession
            ? {
                ...session,
                currentProgress: newProgress,
                status: newProgress >= session.totalPages ? 'completed' : session.status
              }
            : session
        )
      );
    }

    setShowAddReadingForm(false);
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  const getStreakDays = () => {
    if (sessionEntries.length === 0) return 0;

    const sortedEntries = sessionEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (khatmaSessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
              {messages?.khatma?.title || 'Khatma Tracker'}
            </h1>
            <div className="text-6xl mb-6">📖</div>
            <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto mb-8">
              {messages?.khatma?.description || 'Track your Quran reading progress and complete your Khatma journey'}
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.khatma?.startFirst || 'Start Your First Khatma'}
              </h2>
              <p className="text-islamic-600 dark:text-islamic-400 mb-6">
                {messages?.khatma?.startFirstDesc || 'Begin your spiritual journey by setting up your first Quran reading session.'}
              </p>
              <button
                onClick={() => setShowNewSessionForm(true)}
                className="w-full bg-islamic-500 text-white py-3 px-6 rounded-lg hover:bg-islamic-600 transition-colors duration-200"
              >
                {messages?.khatma?.createSession || 'Create New Session'}
              </button>
            </div>
          </div>
        </div>

        {/* New Session Form Modal */}
        {showNewSessionForm && <NewSessionForm onSubmit={createNewSession} onCancel={() => setShowNewSessionForm(false)} messages={messages} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200">
              {messages?.khatma?.title || 'Khatma Tracker'}
            </h1>
            <p className="text-islamic-600 dark:text-islamic-400 mt-2">
              {messages?.khatma?.subtitle || 'Track your Quran reading journey'}
            </p>
          </div>
          <button
            onClick={() => setShowNewSessionForm(true)}
            className="bg-islamic-500 text-white px-6 py-3 rounded-lg hover:bg-islamic-600 transition-colors duration-200"
          >
            + {messages?.khatma?.newSession || 'New Session'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.khatma?.mySessions || 'My Sessions'}
              </h3>

              <div className="space-y-3">
                {khatmaSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedSession === session.id
                        ? 'bg-islamic-100 dark:bg-islamic-900 border-2 border-islamic-500'
                        : 'bg-islamic-50 dark:bg-gray-700 hover:bg-islamic-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-islamic-800 dark:text-islamic-200">
                        {session.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        session.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {messages?.khatma?.status?.[session.status] || session.status}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-islamic-600 dark:text-islamic-400 mb-1">
                        <span>{session.currentProgress} / {session.totalPages} {messages?.khatma?.pages || 'pages'}</span>
                        <span>{Math.round(getProgressPercentage(session.currentProgress, session.totalPages))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-islamic-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(session.currentProgress, session.totalPages)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-xs text-islamic-500 dark:text-islamic-500">
                      {messages?.khatma?.target || 'Target'}: {new Date(session.targetDate).toLocaleDateString(locale)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentSession ? (
              <div className="space-y-6">
                {/* Session Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                        {currentSession.name}
                      </h2>
                      <p className="text-islamic-600 dark:text-islamic-400">
                        {messages?.khatma?.started || 'Started'}: {new Date(currentSession.startDate).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddReadingForm(true)}
                      className="bg-tosca-500 text-white px-4 py-2 rounded-lg hover:bg-tosca-600 transition-colors duration-200"
                    >
                      + {messages?.khatma?.addReading || 'Add Reading'}
                    </button>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                        {currentSession.currentProgress}
                      </div>
                      <div className="text-sm text-islamic-600 dark:text-islamic-400">
                        {messages?.khatma?.pagesRead || 'Pages Read'}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-tosca-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-tosca-800 dark:text-tosca-200">
                        {currentSession.totalPages - currentSession.currentProgress}
                      </div>
                      <div className="text-sm text-tosca-600 dark:text-tosca-400">
                        {messages?.khatma?.pagesLeft || 'Pages Left'}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {getDaysRemaining(currentSession.targetDate)}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {messages?.khatma?.daysLeft || 'Days Left'}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                        {getStreakDays()}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        {messages?.khatma?.streak || 'Day Streak'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-islamic-600 dark:text-islamic-400 mb-2">
                      <span>{messages?.khatma?.progress || 'Progress'}</span>
                      <span>{Math.round(getProgressPercentage(currentSession.currentProgress, currentSession.totalPages))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-islamic-500 to-tosca-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(currentSession.currentProgress, currentSession.totalPages)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recent Readings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                    {messages?.khatma?.recentReadings || 'Recent Readings'}
                  </h3>

                  {sessionEntries.length > 0 ? (
                    <div className="space-y-3">
                      {sessionEntries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center p-4 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <div className="font-semibold text-islamic-800 dark:text-islamic-200">
                                {messages?.khatma?.surah || 'Surah'} {entry.surahFrom}:{entry.ayahFrom} - {entry.surahTo}:{entry.ayahTo}
                              </div>
                              <div className="text-sm text-islamic-600 dark:text-islamic-400">
                                {new Date(entry.date).toLocaleDateString(locale)} • {entry.duration} {messages?.khatma?.minutes || 'minutes'}
                              </div>
                              {entry.notes && (
                                <div className="text-sm text-islamic-500 dark:text-islamic-500 mt-1">
                                  "{entry.notes}"
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-bold text-islamic-600 dark:text-islamic-400">
                              {entry.pagesRead} {messages?.khatma?.pages || 'pages'}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-islamic-600 dark:text-islamic-400">
                      <div className="text-4xl mb-4">📖</div>
                      <p>{messages?.khatma?.noReadings || 'No readings recorded yet. Start your first reading session!'}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {messages?.khatma?.selectSession || 'Select a Session'}
                </h3>
                <p className="text-islamic-600 dark:text-islamic-400">
                  {messages?.khatma?.selectSessionDesc || 'Choose a Khatma session from the sidebar to view its details and add readings.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showNewSessionForm && (
          <NewSessionForm
            onSubmit={createNewSession}
            onCancel={() => setShowNewSessionForm(false)}
            messages={messages}
          />
        )}

        {showAddReadingForm && currentSession && (
          <AddReadingForm
            onSubmit={addReadingEntry}
            onCancel={() => setShowAddReadingForm(false)}
            sessionId={currentSession.id}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
}

// New Session Form Component
function NewSessionForm({ onSubmit, onCancel, messages }: {
  onSubmit: (data: Omit<KhatmaSession, 'id' | 'currentProgress'>) => void;
  onCancel: () => void;
  messages: any;
}) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    totalPages: 604,
    dailyTarget: 4,
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
          {messages?.khatma?.createNewSession || 'Create New Khatma Session'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
              {messages?.khatma?.sessionName || 'Session Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              placeholder={messages?.khatma?.sessionNamePlaceholder || 'My Ramadan Khatma'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.startDate || 'Start Date'}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.targetDate || 'Target Date'}
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.totalPages || 'Total Pages'}
              </label>
              <input
                type="number"
                value={formData.totalPages}
                onChange={(e) => setFormData(prev => ({ ...prev, totalPages: parseInt(e.target.value) }))}
                required
                min="1"
                max="604"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.dailyTarget || 'Daily Target'}
              </label>
              <input
                type="number"
                value={formData.dailyTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyTarget: parseInt(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-islamic-700 dark:text-islamic-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {messages?.khatma?.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-islamic-500 text-white rounded-lg hover:bg-islamic-600 transition-colors duration-200"
            >
              {messages?.khatma?.create || 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Reading Form Component
function AddReadingForm({ onSubmit, onCancel, sessionId, messages }: {
  onSubmit: (data: Omit<ReadingEntry, 'id'>) => void;
  onCancel: () => void;
  sessionId: string;
  messages: any;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    surahFrom: 1,
    ayahFrom: 1,
    surahTo: 1,
    ayahTo: 7,
    pagesRead: 1,
    duration: 15,
    notes: '',
    sessionId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
          {messages?.khatma?.addReadingSession || 'Add Reading Session'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
              {messages?.khatma?.date || 'Date'}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.fromSurah || 'From Surah'}
              </label>
              <input
                type="number"
                value={formData.surahFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, surahFrom: parseInt(e.target.value) }))}
                required
                min="1"
                max="114"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.fromAyah || 'From Ayah'}
              </label>
              <input
                type="number"
                value={formData.ayahFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, ayahFrom: parseInt(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.toSurah || 'To Surah'}
              </label>
              <input
                type="number"
                value={formData.surahTo}
                onChange={(e) => setFormData(prev => ({ ...prev, surahTo: parseInt(e.target.value) }))}
                required
                min="1"
                max="114"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.toAyah || 'To Ayah'}
              </label>
              <input
                type="number"
                value={formData.ayahTo}
                onChange={(e) => setFormData(prev => ({ ...prev, ayahTo: parseInt(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.pagesRead || 'Pages Read'}
              </label>
              <input
                type="number"
                value={formData.pagesRead}
                onChange={(e) => setFormData(prev => ({ ...prev, pagesRead: parseInt(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
                {messages?.khatma?.duration || 'Duration'} ({messages?.khatma?.minutes || 'minutes'})
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-islamic-700 dark:text-islamic-300 mb-1">
              {messages?.khatma?.notes || 'Notes'} ({messages?.khatma?.optional || 'optional'})
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-islamic-500 bg-white dark:bg-gray-700 text-islamic-800 dark:text-islamic-200 resize-none"
              placeholder={messages?.khatma?.notesPlaceholder || 'Any reflections or thoughts...'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-islamic-700 dark:text-islamic-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {messages?.khatma?.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-tosca-500 text-white rounded-lg hover:bg-tosca-600 transition-colors duration-200"
            >
              {messages?.khatma?.add || 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
