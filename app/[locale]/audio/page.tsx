import { getMessages } from '@/utils/translations';
import AudioClient from './AudioClient';

export default async function AudioPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <AudioClient locale={params.locale} messages={messages} />
  );
}

  // Sample audio tracks - in production, these would come from Google Drive API
  const audioTracks: AudioTrack[] = [
    {
      id: '1',
      title: 'Surah Al-Fatiha',
      arabicTitle: 'سورة الفاتحة',
      reciter: 'Abdul Rahman Al-Sudais',
      duration: '2:30',
      url: 'https://server8.mp3quran.net/abd_basit/Almusshaf-Al-Mojawwad/001.mp3',
      category: 'quran'
    },
    {
      id: '2',
      title: 'Surah Al-Baqarah',
      arabicTitle: 'سورة البقرة',
      reciter: 'Mishary Al-Afasy',
      duration: '2:30:45',
      url: 'https://server8.mp3quran.net/afs/002.mp3',
      category: 'quran'
    },
    {
      id: '3',
      title: 'Morning Adhkar',
      arabicTitle: 'أذكار الصباح',
      reciter: 'Saad Al-Ghamdi',
      duration: '15:30',
      url: '#',
      category: 'dua'
    },
    {
      id: '4',
      title: 'The Life of Prophet Muhammad',
      reciter: 'Dr. Yasir Qadhi',
      duration: '45:20',
      url: '#',
      category: 'lecture'
    },
    {
      id: '5',
      title: 'Tala\'a Al-Badru Alayna',
      arabicTitle: 'طلع البدر علينا',
      reciter: 'Various Artists',
      duration: '4:15',
      url: '#',
      category: 'nasheed'
    }
  ];

  const categories = [
    { id: 'all', name: t('allCategories') },
    { id: 'quran', name: t('quranRecitation') },
    { id: 'dua', name: t('duaAdhkar') },
    { id: 'lecture', name: t('lectures') },
    { id: 'nasheed', name: t('nasheeds') }
  ];

  const filteredTracks = selectedCategory === 'all' 
    ? audioTracks 
    : audioTracks.filter(track => track.category === selectedCategory);

  const playTrack = (track: AudioTrack) => {
    if (audioRef.current) {
      if (currentTrack?.id === track.id && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setCurrentTrack(track);
        audioRef.current.src = track.url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {t('title')}
          </h1>
          <div className="text-4xl mb-4">🎵</div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-islamic-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-islamic-700 dark:text-islamic-300 hover:bg-islamic-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audio List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                {t('audioLibrary')}
              </h2>
              <div className="space-y-4">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      currentTrack?.id === track.id
                        ? 'border-islamic-500 bg-islamic-50 dark:bg-islamic-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-islamic-300 dark:hover:border-islamic-600'
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-islamic-800 dark:text-islamic-200">
                          {track.title}
                        </h3>
                        {track.arabicTitle && (
                          <h4 className="font-amiri text-lg text-islamic-600 dark:text-islamic-300 mt-1">
                            {track.arabicTitle}
                          </h4>
                        )}
                        <p className="text-islamic-600 dark:text-islamic-400 mt-1">
                          {track.reciter}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-islamic-500 dark:text-islamic-400">
                          <span>{track.duration}</span>
                          <span className="capitalize">{t(track.category)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                            currentTrack?.id === track.id && isPlaying
                              ? 'bg-islamic-500 text-white'
                              : 'bg-islamic-100 dark:bg-gray-700 text-islamic-600 dark:text-islamic-300 hover:bg-islamic-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {currentTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-6">
                {t('nowPlaying')}
              </h2>
              
              {currentTrack ? (
                <div className="space-y-4">
                  {/* Track Info */}
                  <div className="text-center">
                    <h3 className="font-bold text-islamic-800 dark:text-islamic-200">
                      {currentTrack.title}
                    </h3>
                    {currentTrack.arabicTitle && (
                      <h4 className="font-amiri text-lg text-islamic-600 dark:text-islamic-300 mt-1">
                        {currentTrack.arabicTitle}
                      </h4>
                    )}
                    <p className="text-islamic-600 dark:text-islamic-400 mt-1">
                      {currentTrack.reciter}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-islamic-500 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-islamic-600 dark:text-islamic-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center">
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-islamic-500 text-white rounded-full flex items-center justify-center hover:bg-islamic-600 transition-colors duration-200 text-xl"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-islamic-600 dark:text-islamic-400">
                    {t('selectTrack')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}
