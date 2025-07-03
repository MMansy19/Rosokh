import React, { useState, useEffect } from 'react';
import { RECITERS } from '../constants';
import { quranService } from '@/services/quranService';

interface ReciterSelectionProps {
  currentReciter: string;
  onReciterChange: (reciter: string) => void;
  messages: any;
}

export const ReciterSelection: React.FC<ReciterSelectionProps> = ({
  currentReciter,
  onReciterChange,
  messages
}) => {
  const [availableReciters, setAvailableReciters] = useState(RECITERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableReciters = async () => {
      try {
        // Get audio editions from the API
        const audioEditions = await quranService.getEditions('audio');
        
        // Filter to get verse-by-verse recitations
        const verseByVerseReciters = audioEditions.filter(
          edition => edition.type === 'versebyverse'
        );

        // Map available reciters with their API identifiers
        const availableReciterIds = verseByVerseReciters.map(edition => edition.identifier);
        
        // Filter our predefined reciters to only show available ones
        const filtered = RECITERS.filter(reciter => 
          availableReciterIds.includes(reciter.id)
        );

        // Add any additional reciters from the API that we don't have in our list
        const additionalReciters = verseByVerseReciters
          .filter(edition => !RECITERS.find(r => r.id === edition.identifier))
          .map(edition => ({
            id: edition.identifier,
            name: edition.englishName,
            arabicName: edition.name
          }));

        setAvailableReciters([...filtered, ...additionalReciters]);
      } catch (error) {
        console.error('Error loading reciters:', error);
        // Fall back to predefined list
        setAvailableReciters(RECITERS);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableReciters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-sm text-gray-600">Loading reciters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {messages?.quran?.selectReciter || 'Select Reciter'}
      </label>
      <select
        value={currentReciter}
        onChange={(e) => onReciterChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {availableReciters.map((reciter) => (
          <option key={reciter.id} value={reciter.id}>
            {reciter.name} - {reciter.arabicName}
          </option>
        ))}
      </select>
      
      {/* Audio quality selection */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>🎵 Audio will automatically fallback to available quality (128kbps → 64kbps)</p>
      </div>
    </div>
  );
};

export default ReciterSelection;
