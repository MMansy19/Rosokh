import React, { useState } from 'react';
import { QuranRead } from '@/components/quran';
import { AudioTest } from '@/components/quran/ui/AudioTest';
import { ReciterSelection } from '@/components/quran/ui/ReciterSelection';
import { EnhancedAudioPlayer } from '@/components/quran/ui/EnhancedAudioPlayer';
import { quranService } from '@/services/quranService';

interface QuranTestPageProps {
  locale: string;
  messages: any;
}

export const QuranTestPage: React.FC<QuranTestPageProps> = ({ locale, messages }) => {
  const [activeTab, setActiveTab] = useState<'reader' | 'test' | 'reciter'>('reader');

  const tabs = [
    { id: 'reader', name: 'Quran Reader', icon: '📖' },
    { id: 'test', name: 'Audio Test', icon: '🎵' },
    { id: 'reciter', name: 'Reciter Test', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🕌 Al Quran Cloud API - Test & Implementation
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Powered by{' '}
              <a 
                href="https://alquran.cloud/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                alquran.cloud
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'reader' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📖 Enhanced Quran Reader
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Updated to use Al Quran Cloud API with improved audio functionality and fallback mechanisms.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p>✅ Multi-edition support (Arabic + translations)</p>
                <p>✅ CDN-based audio with quality fallback (128kbps → 64kbps)</p>
                <p>✅ Comprehensive reciter selection</p>
                <p>✅ Automatic audio URL validation</p>
              </div>
            </div>
            
            <QuranRead locale={locale} messages={messages} />
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                🎵 Audio API Testing
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Test the Al Quran Cloud audio endpoints to verify availability and functionality.
              </p>
            </div>
            
            <AudioTest messages={messages} />
          </div>
        )}

        {activeTab === 'reciter' && (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                👤 Reciter Management
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Test reciter selection and audio availability.
              </p>
            </div>
            
            <ReciterTestComponent messages={messages} />
          </div>
        )}
      </div>
    </div>
  );
};

// Reciter Test Component
const ReciterTestComponent: React.FC<{ messages: any }> = ({ messages }) => {
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [testResults, setTestResults] = useState<string>('');

  const testReciter = async () => {
    setTestResults('Testing reciter audio availability...\n');
    
    try {
      // Test a few sample ayahs
      const testAyahs = [1, 262, 6231]; // Bismillah, Ayat Al-Kursi, Last ayah
      
      for (const ayah of testAyahs) {
        const url128 = quranService.getAyahAudioUrl(ayah, selectedReciter, 128);
        const url64 = quranService.getAyahAudioUrl(ayah, selectedReciter, 64);
        
        const available128 = await quranService.checkAudioAvailability(url128);
        const available64 = await quranService.checkAudioAvailability(url64);
        
        setTestResults(prev => prev + 
          `Ayah ${ayah}: 128kbps ${available128 ? '✅' : '❌'}, 64kbps ${available64 ? '✅' : '❌'}\n`
        );
      }
      
      setTestResults(prev => prev + '\nTest completed!');
    } catch (error) {
      setTestResults(prev => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <ReciterSelection
          currentReciter={selectedReciter}
          onReciterChange={setSelectedReciter}
          messages={messages}
        />
        
        <button
          onClick={testReciter}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          🧪 Test This Reciter
        </button>
      </div>
      
      {testResults && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Results:</h4>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {testResults}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QuranTestPage;
