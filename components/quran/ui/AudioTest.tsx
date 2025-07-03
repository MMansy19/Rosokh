import React, { useState } from 'react';
import { quranService } from '@/services/quranService';
import { RECITERS } from '../constants';

interface AudioTestProps {
  messages: any;
}

export const AudioTest: React.FC<AudioTestProps> = ({ messages }) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testAudioUrls = async () => {
    setIsLoading(true);
    setTestResults([]);
    const results: string[] = [];

    try {
      results.push('🎵 Starting Al Quran Cloud API Audio Test...\n');

      // Test a few sample ayahs with different reciters
      const testCases = [
        { surah: 1, ayah: 1, absoluteAyah: 1, description: "Al-Fatiha 1:1 (Bismillah)" },
        { surah: 2, ayah: 255, absoluteAyah: 262, description: "Al-Baqarah 2:255 (Ayat Al-Kursi)" },
        { surah: 114, ayah: 1, absoluteAyah: 6231, description: "An-Nas 114:1" }
      ];

      const testReciters = RECITERS.slice(0, 3); // Test first 3 reciters

      for (const testCase of testCases) {
        results.push(`\n📖 Testing ${testCase.description}:`);
        
        for (const reciter of testReciters) {
          results.push(`\n  👤 ${reciter.name} (${reciter.id}):`);
          
          // Test different bitrates
          for (const bitrate of [128, 64]) {
            const url = quranService.getAyahAudioUrl(testCase.absoluteAyah, reciter.id, bitrate);
            const isAvailable = await quranService.checkAudioAvailability(url);
            
            results.push(
              `    ${bitrate}kbps: ${isAvailable ? '✅ Available' : '❌ Not available'}`
            );
            
            if (isAvailable) {
              results.push(`      🔗 ${url}`);
              break; // If one bitrate works, no need to test others for this reciter
            }
          }
          
          setTestResults([...results]);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
        }
      }

      // Test Surah audio
      results.push('\n\n📚 Testing Surah Audio:');
      results.push('\n  Surah Al-Fatiha (1) with Mishary Alafasy:');
      
      for (const bitrate of [128, 64]) {
        const surahUrl = quranService.getSurahAudioUrl(1, 'ar.alafasy', bitrate);
        const isAvailable = await quranService.checkAudioAvailability(surahUrl);
        
        results.push(
          `    ${bitrate}kbps: ${isAvailable ? '✅ Available' : '❌ Not available'}`
        );
        
        if (isAvailable) {
          results.push(`      🔗 ${surahUrl}`);
          break;
        }
      }

      results.push('\n✨ Audio test completed!');
      
    } catch (error) {
      results.push(`\n❌ Error during test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestResults(results);
      setIsLoading(false);
    }
  };

  const playTestAudio = async () => {
    try {
      // Test playing Bismillah (Al-Fatiha 1:1)
      const url = quranService.getAyahAudioUrl(1, 'ar.alafasy', 128);
      const audio = new Audio(url);
      audio.volume = 0.5;
      await audio.play();
      
      setTestResults(prev => [...prev, '\n🔊 Playing test audio: Bismillah (Al-Fatiha 1:1)']);
    } catch (error) {
      setTestResults(prev => [...prev, `\n❌ Failed to play test audio: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        🎵 Audio API Test
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Test the Al Quran Cloud API audio endpoints to verify they are working correctly.
      </p>

      <div className="flex space-x-3">
        <button
          onClick={testAudioUrls}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          )}
          <span>{isLoading ? 'Testing...' : 'Test Audio URLs'}</span>
        </button>

        <button
          onClick={playTestAudio}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <span>🔊 Play Test Audio</span>
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 max-h-96 overflow-y-auto">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Results:</h4>
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
            {testResults.join('\n')}
          </pre>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
        <p><strong>Note:</strong> This test checks if audio URLs are accessible. If URLs show as available but audio doesn't play, it might be a CORS or browser policy issue.</p>
        <p><strong>Al Quran Cloud CDN:</strong> https://cdn.islamic.network/quran/audio/</p>
      </div>
    </div>
  );
};

export default AudioTest;
