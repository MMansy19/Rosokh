// Simple test page to verify reciter functionality
import React, { useState } from 'react';
import { RECITERS } from '../quran/constants';

const ReciterTest = () => {
  const [currentReciter, setCurrentReciter] = useState('ar.alafasy');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testReciter = async (reciterId: string) => {
    setTesting(true);
    setTestResult('Testing...');
    
    try {
      // Test ayah audio (Ayat Al-Kursi - Ayah 255)
      const ayahUrl = `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio/128/${reciterId}/255.mp3`)}`;
      
      // Test surah audio (Al-Fatiha)
      const surahUrl = `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/1.mp3`)}`;
      
      console.log('Testing URLs:', { ayahUrl, surahUrl });
      
      // Test ayah
      const ayahResponse = await fetch(ayahUrl, { method: 'HEAD' });
      const ayahWorks = ayahResponse.ok;
      
      // Test surah
      const surahResponse = await fetch(surahUrl, { method: 'HEAD' });
      const surahWorks = surahResponse.ok;
      
      const reciterName = RECITERS.find(r => r.id === reciterId)?.name || reciterId;
      
      setTestResult(`
        Reciter: ${reciterName} (${reciterId})
        Ayah Audio: ${ayahWorks ? '✅ Working' : '❌ Not working'}
        Surah Audio: ${surahWorks ? '✅ Working' : '❌ Not working'}
        Overall: ${(ayahWorks || surahWorks) ? '✅ Usable' : '❌ Not usable'}
      `);
      
    } catch (error) {
      setTestResult(`Error testing ${reciterId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const testAllReciters = async () => {
    setTesting(true);
    setTestResult('Testing all reciters...\n\n');
    
    for (const reciter of RECITERS) {
      try {
        const ayahUrl = `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio/128/${reciter.id}/255.mp3`)}`;
        const surahUrl = `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio-surah/128/${reciter.id}/1.mp3`)}`;
        
        const [ayahResponse, surahResponse] = await Promise.all([
          fetch(ayahUrl, { method: 'HEAD' }).catch(() => ({ ok: false })),
          fetch(surahUrl, { method: 'HEAD' }).catch(() => ({ ok: false }))
        ]);
        
        const status = (ayahResponse.ok || surahResponse.ok) ? '✅' : '❌';
        const result = `${status} ${reciter.name} (${reciter.id}) - Ayah: ${ayahResponse.ok ? '✅' : '❌'} Surah: ${surahResponse.ok ? '✅' : '❌'}\n`;
        
        setTestResult(prev => prev + result);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        setTestResult(prev => prev + `❌ ${reciter.name} - Error: ${error}\n`);
      }
    }
    
    setTesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reciter Audio Test</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Test Individual Reciter</h2>
          
          <select 
            value={currentReciter}
            onChange={(e) => setCurrentReciter(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            {RECITERS.map(reciter => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name} - {reciter.arabicName}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => testReciter(currentReciter)}
            disabled={testing}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {testing ? 'Testing...' : 'Test Reciter'}
          </button>
          
          <button
            onClick={testAllReciters}
            disabled={testing}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            {testing ? 'Testing...' : 'Test All Reciters'}
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {testResult || 'No tests run yet'}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Available Reciters</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {RECITERS.map(reciter => (
            <div key={reciter.id} className="p-2 border rounded">
              <strong>{reciter.name}</strong><br />
              <span className="text-gray-600">{reciter.arabicName}</span><br />
              <code className="text-sm bg-gray-100 px-1">{reciter.id}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReciterTest;
