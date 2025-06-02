'use client';

import { useState, useEffect } from 'react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: number;
}

interface QuranClientProps {
  locale: string;
  messages: any;
}

export function QuranClient({ locale, messages }: QuranClientProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<'arabic' | 'transliteration' | 'translation'>('arabic');

  // Fetch Surahs list
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        console.error('Error fetching surahs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch Ayahs for selected Surah
  useEffect(() => {
    const fetchAyahs = async () => {
      if (!selectedSurah) return;
      
      setLoading(true);
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`);
        const data = await response.json();
        setAyahs(data.data.ayahs);
      } catch (error) {
        console.error('Error fetching ayahs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAyahs();
  }, [selectedSurah]);

  const currentSurah = surahs.find(s => s.number === selectedSurah);

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {messages?.quran?.title || "Quran Reader"}
          </h1>
          <div className="text-6xl font-amiri text-islamic-600 dark:text-islamic-300 mb-4">
            ﷽
          </div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {messages?.quran?.description || "Read the Quran with beautiful Arabic text"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Surahs List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.quran?.surahs || "Surahs"}
              </h2>
              <div className="max-h-96 overflow-y-auto">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => setSelectedSurah(surah.number)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                      selectedSurah === surah.number
                        ? 'bg-islamic-500 text-white'
                        : 'hover:bg-islamic-50 dark:hover:bg-gray-700 text-islamic-700 dark:text-islamic-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{surah.number}. {surah.englishName}</div>
                        <div className="text-sm font-amiri">{surah.arabicName}</div>
                      </div>
                      <div className="text-xs opacity-75">
                        {surah.numberOfAyahs} {messages?.quran?.verses || "verses"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reading Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Reading Mode Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setReadingMode('arabic')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    readingMode === 'arabic'
                      ? 'bg-islamic-500 text-white'
                      : 'bg-islamic-100 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 hover:bg-islamic-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {messages?.quran?.arabicText || "Arabic Text"}
                </button>
                <button
                  onClick={() => setReadingMode('transliteration')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    readingMode === 'transliteration'
                      ? 'bg-islamic-500 text-white'
                      : 'bg-islamic-100 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 hover:bg-islamic-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {messages?.quran?.transliteration || "Transliteration"}
                </button>
                <button
                  onClick={() => setReadingMode('translation')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    readingMode === 'translation'
                      ? 'bg-islamic-500 text-white'
                      : 'bg-islamic-100 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 hover:bg-islamic-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {messages?.quran?.translation || "Translation"}
                </button>
              </div>

              {/* Surah Header */}
              {currentSurah && (
                <div className="text-center mb-8 p-6 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                  <h2 className="text-3xl font-amiri text-islamic-800 dark:text-islamic-200 mb-2">
                    {currentSurah.arabicName}
                  </h2>
                  <h3 className="text-xl font-bold text-islamic-600 dark:text-islamic-300 mb-2">
                    {currentSurah.englishName}
                  </h3>
                  <p className="text-islamic-600 dark:text-islamic-400">
                    {currentSurah.revelationType} • {currentSurah.numberOfAyahs} {messages?.quran?.verses || "verses"}
                  </p>
                </div>
              )}

              {/* Bismillah */}
              {selectedSurah !== 1 && selectedSurah !== 9 && (
                <div className="text-center mb-8">
                  <div className="text-4xl font-amiri text-islamic-600 dark:text-islamic-300">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </div>
                </div>
              )}

              {/* Ayahs */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-islamic-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-islamic-600 dark:text-islamic-400">{messages?.quran?.loading || "Loading..."}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ayahs.map((ayah) => (
                    <div key={ayah.number} className="group p-4 rounded-lg hover:bg-islamic-50 dark:hover:bg-gray-700 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-islamic-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {ayah.numberInSurah}
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl font-amiri leading-loose text-islamic-800 dark:text-islamic-200 text-right mb-4">
                            {ayah.text}
                          </p>
                          {readingMode === 'transliteration' && (
                            <p className="text-lg text-islamic-600 dark:text-islamic-400 italic mb-2">
                              {messages?.quran?.transliterationNotAvailable || "Transliteration not available"}
                            </p>
                          )}
                          {readingMode === 'translation' && (
                            <p className="text-lg text-islamic-600 dark:text-islamic-400">
                              {messages?.quran?.translationNotAvailable || "Translation not available"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
