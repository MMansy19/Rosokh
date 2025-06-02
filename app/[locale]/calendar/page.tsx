import { getMessages } from '@/utils/translations';
import CalendarClient from './CalendarClient';
import { useEffect, useState } from 'react';

export default async function CalendarPage({
  params
}: {
  params: { locale: string }
}) {
  const messages = await getMessages(params.locale);

  return (
    <CalendarClient locale={params.locale} messages={messages} />
  );
}

interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

interface PrayerTime {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

interface IslamicEvent {
  date: string;
  title: string;
  arabicTitle: string;
  description: string;
  type: 'holiday' | 'sunnah' | 'historical';
}

export default function CalendarPage() {
  const t = useTranslations('calendar');
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Sample Islamic events - in production, this would come from an API
  const islamicEvents: IslamicEvent[] = [
    {
      date: '2024-01-15',
      title: 'Mawlid an-Nabi',
      arabicTitle: 'المولد النبوي',
      description: 'Birth of Prophet Muhammad (peace be upon him)',
      type: 'holiday'
    },
    {
      date: '2024-03-10',
      title: 'Ramadan Begins',
      arabicTitle: 'بداية رمضان',
      description: 'The holy month of fasting begins',
      type: 'holiday'
    },
    {
      date: '2024-04-09',
      title: 'Eid al-Fitr',
      arabicTitle: 'عيد الفطر',
      description: 'Festival of Breaking the Fast',
      type: 'holiday'
    },
    {
      date: '2024-06-16',
      title: 'Eid al-Adha',
      arabicTitle: 'عيد الأضحى',
      description: 'Festival of Sacrifice',
      type: 'holiday'
    }
  ];

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const arabicMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  // Fetch current Hijri date
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${today}`);
        const data = await response.json();
        if (data.code === 200) {
          setHijriDate(data.data.hijri);
        }
      } catch (error) {
        console.error('Error fetching Hijri date:', error);
      }
    };

    fetchHijriDate();
  }, []);

  // Fetch prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Get user's location (with permission)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
            );
            const data = await response.json();
            if (data.code === 200) {
              setPrayerTimes(data.data.timings);
            }
            setLoading(false);
          }, () => {
            // Default location if permission denied
            fetchDefaultPrayerTimes();
          });
        } else {
          fetchDefaultPrayerTimes();
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setLoading(false);
      }
    };

    const fetchDefaultPrayerTimes = async () => {
      try {
        // Default to Mecca coordinates
        const response = await fetch(
          'https://api.aladhan.com/v1/timings?latitude=21.4225&longitude=39.8262&method=2'
        );
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error('Error fetching default prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatPrayerTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const hasEvent = islamicEvents.some(event => event.date === dateString);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-12 rounded-lg flex items-center justify-center text-sm transition-all duration-200 relative ${
            isToday
              ? 'bg-islamic-500 text-white font-bold'
              : isSelected
              ? 'bg-islamic-100 dark:bg-islamic-800 text-islamic-800 dark:text-islamic-200 font-semibold'
              : 'hover:bg-islamic-50 dark:hover:bg-gray-700 text-islamic-700 dark:text-islamic-300'
          }`}
        >
          {day}
          {hasEvent && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-tosca-500 rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100 dark:from-gray-900 dark:to-islamic-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
            {t('title')}
          </h1>
          <div className="text-4xl mb-4">🗓️</div>
          <p className="text-lg text-islamic-700 dark:text-islamic-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-islamic-100 dark:hover:bg-gray-700 text-islamic-600 dark:text-islamic-300"
                >
                  ←
                </button>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-islamic-800 dark:text-islamic-200">
                    {months[currentMonth]} {currentYear}
                  </h2>
                  {hijriDate && (
                    <p className="text-lg font-amiri text-islamic-600 dark:text-islamic-300">
                      {arabicMonths[hijriDate.month.number - 1]} {hijriDate.year}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-islamic-100 dark:hover:bg-gray-700 text-islamic-600 dark:text-islamic-300"
                >
                  →
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-islamic-600 dark:text-islamic-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              {/* Events for Selected Date */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {t('eventsFor')} {selectedDate.toLocaleDateString()}
                </h3>
                <div className="space-y-2">
                  {islamicEvents
                    .filter(event => event.date === selectedDate.toISOString().split('T')[0])
                    .map((event, index) => (
                      <div key={index} className="p-3 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-islamic-800 dark:text-islamic-200">
                          {event.title}
                        </h4>
                        <p className="font-amiri text-islamic-600 dark:text-islamic-300">
                          {event.arabicTitle}
                        </p>
                        <p className="text-sm text-islamic-600 dark:text-islamic-400 mt-1">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  {islamicEvents.filter(event => event.date === selectedDate.toISOString().split('T')[0]).length === 0 && (
                    <p className="text-islamic-600 dark:text-islamic-400 italic">
                      {t('noEvents')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Hijri Date */}
            {hijriDate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {t('hijriDate')}
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-amiri text-islamic-600 dark:text-islamic-300 mb-2">
                    {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
                  </div>
                  <div className="text-lg text-islamic-700 dark:text-islamic-300">
                    {hijriDate.day} {hijriDate.month.en} {hijriDate.year} {hijriDate.designation.abbreviated}
                  </div>
                  <div className="text-sm text-islamic-600 dark:text-islamic-400 mt-2">
                    {hijriDate.weekday.en} • {hijriDate.weekday.ar}
                  </div>
                </div>
              </div>
            )}

            {/* Prayer Times */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {t('prayerTimes')}
              </h3>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-4 border-islamic-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-islamic-600 dark:text-islamic-400">{t('loading')}</p>
                </div>
              ) : prayerTimes ? (
                <div className="space-y-3">
                  {[
                    { name: 'Fajr', arabic: 'الفجر', time: prayerTimes.Fajr },
                    { name: 'Sunrise', arabic: 'الشروق', time: prayerTimes.Sunrise },
                    { name: 'Dhuhr', arabic: 'الظهر', time: prayerTimes.Dhuhr },
                    { name: 'Asr', arabic: 'العصر', time: prayerTimes.Asr },
                    { name: 'Maghrib', arabic: 'المغرب', time: prayerTimes.Maghrib },
                    { name: 'Isha', arabic: 'العشاء', time: prayerTimes.Isha }
                  ].map((prayer) => (
                    <div key={prayer.name} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div>
                        <div className="font-medium text-islamic-800 dark:text-islamic-200">
                          {prayer.name}
                        </div>
                        <div className="text-sm font-amiri text-islamic-600 dark:text-islamic-300">
                          {prayer.arabic}
                        </div>
                      </div>
                      <div className="font-bold text-islamic-600 dark:text-islamic-300">
                        {formatPrayerTime(prayer.time)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-islamic-600 dark:text-islamic-400">
                  {t('unableToLoad')}
                </p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {t('upcomingEvents')}
              </h3>
              <div className="space-y-3">
                {islamicEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="p-3 bg-islamic-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-islamic-800 dark:text-islamic-200 text-sm">
                      {event.title}
                    </h4>
                    <p className="font-amiri text-islamic-600 dark:text-islamic-300 text-sm">
                      {event.arabicTitle}
                    </p>
                    <p className="text-xs text-islamic-600 dark:text-islamic-400 mt-1">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
