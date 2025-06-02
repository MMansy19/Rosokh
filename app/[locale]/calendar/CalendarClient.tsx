"use client";

import { useState, useEffect } from "react";

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
  type: "holiday" | "sunnah" | "historical";
}

interface CalendarClientProps {
  locale: string;
  messages: any;
}

export default function CalendarClient({
  locale,
  messages,
}: CalendarClientProps) {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [islamicEvents, setIslamicEvents] = useState<IslamicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  // Sample Islamic events
  const sampleEvents: IslamicEvent[] = [
    {
      date: "2024-01-01",
      title: "Islamic New Year",
      arabicTitle: "رأس السنة الهجرية",
      description: "The beginning of the Islamic calendar year",
      type: "holiday",
    },
    {
      date: "2024-01-10",
      title: "Day of Ashura",
      arabicTitle: "يوم عاشوراء",
      description: "The 10th day of Muharram, a day of fasting",
      type: "sunnah",
    },
    {
      date: "2024-03-01",
      title: "Isra and Miraj",
      arabicTitle: "الإسراء والمعراج",
      description: "The night journey of Prophet Muhammad (PBUH)",
      type: "historical",
    },
    {
      date: "2024-04-01",
      title: "Start of Ramadan",
      arabicTitle: "بداية شهر رمضان",
      description: "The beginning of the holy month of fasting",
      type: "holiday",
    },
    {
      date: "2024-05-01",
      title: "Eid al-Fitr",
      arabicTitle: "عيد الفطر",
      description: "The festival of breaking the fast",
      type: "holiday",
    },
    {
      date: "2024-07-10",
      title: "Eid al-Adha",
      arabicTitle: "عيد الأضحى",
      description: "The festival of sacrifice",
      type: "holiday",
    },
  ];

  useEffect(() => {
    // Get user location for prayer times
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Use default location (Mecca)
          setLocation({ lat: 21.4225, lon: 39.8262 });
        },
      );
    } else {
      // Use default location (Mecca)
      setLocation({ lat: 21.4225, lon: 39.8262 });
    }

    setIslamicEvents(sampleEvents);
  }, []);

  useEffect(() => {
    if (location) {
      fetchHijriDate();
      fetchPrayerTimes();
    }
  }, [location, selectedDate]);

  const fetchHijriDate = async () => {
    try {
      // Format date for API
      const dateStr = selectedDate.toISOString().split("T")[0];

      // Mock Hijri date - in production, use actual API
      const mockHijriDate: HijriDate = {
        date: "15-04-1445",
        format: "DD-MM-YYYY",
        day: "15",
        weekday: {
          en: selectedDate.toLocaleDateString("en", { weekday: "long" }),
          ar: selectedDate.toLocaleDateString("ar", { weekday: "long" }),
        },
        month: {
          number: 4,
          en: "Rabi' al-Thani",
          ar: "ربيع الثاني",
        },
        year: "1445",
        designation: {
          abbreviated: "AH",
          expanded: "Anno Hegirae",
        },
        holidays: [],
      };

      setHijriDate(mockHijriDate);
    } catch (error) {
      console.error("Error fetching Hijri date:", error);
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      if (!location) return;

      // Mock prayer times - in production, use actual API
      const mockPrayerTimes: PrayerTime = {
        Fajr: "05:30",
        Sunrise: "06:45",
        Dhuhr: "12:15",
        Asr: "15:30",
        Sunset: "18:00",
        Maghrib: "18:00",
        Isha: "19:30",
        Imsak: "05:20",
        Midnight: "00:15",
      };

      setPrayerTimes(mockPrayerTimes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return islamicEvents.filter((event) => event.date === dateStr);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };
  if (loading) {
    return (
      <div className="min-h-screen text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">
            {messages?.calendar?.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.calendar?.title || "Islamic Calendar"}
          </h1>
          <div className="text-4xl mb-4">🗓️</div>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.calendar?.description ||
              "Track Islamic dates, prayer times, and important events"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card group rounded-lg shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="p-2 text-muted hover:bg-buttonHover hover:text-foreground rounded-lg transition-colors duration-200"
                >
                  ←
                </button>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedDate.toLocaleDateString(locale, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  {hijriDate && (
                    <p className="text-sm text-muted font-amiri">
                      {hijriDate.month.ar} {hijriDate.year}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="p-2 text-muted hover:bg-buttonHover hover:text-foreground rounded-lg transition-colors duration-200"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-muted"
                    >
                      {messages?.calendar?.days?.[day.toLowerCase()] || day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2"></div>;
                  }

                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  const events = getEventsForDate(day);
                  const hasEvents = events.length > 0;

                  return (
                    <div
                      key={index}
                      className={`p-2 text-center cursor-pointer rounded-lg transition-colors duration-200 ${
                        isToday
                          ? "bg-primary text-white"
                          : hasEvents
                            ? "bg-surface text-foreground hover:bg-buttonHover"
                            : "text-foreground hover:bg-buttonHover"
                      }`}
                    >
                      <div className="text-sm">{day.getDate()}</div>
                      {hasEvents && (
                        <div className="flex justify-center mt-1">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events for Selected Month */}
            <div className="mt-8 card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.calendar?.eventsThisMonth || "Events This Month"}
              </h3>

              <div className="space-y-4">
                {islamicEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-islamic-50 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        event.type === "holiday"
                          ? "bg-red-500"
                          : event.type === "sunnah"
                            ? "bg-green-500"
                            : "bg-blue-500"
                      }`}
                    ></div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-islamic-800 dark:text-islamic-200">
                        {event.title}
                      </h4>
                      <p className="text-islamic-600 dark:text-islamic-400 font-amiri">
                        {event.arabicTitle}
                      </p>
                      <p className="text-sm text-islamic-500 dark:text-islamic-500 mt-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-islamic-400 dark:text-islamic-600 mt-1">
                        {new Date(event.date).toLocaleDateString(locale, {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Info */}
            <div className="card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.calendar?.today || "Today"}
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-islamic-600 dark:text-islamic-400">
                    {messages?.calendar?.gregorianDate || "Gregorian Date"}
                  </p>
                  <p className="font-semibold text-islamic-800 dark:text-islamic-200">
                    {new Date().toLocaleDateString(locale, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {hijriDate && (
                  <div>
                    <p className="text-sm text-islamic-600 dark:text-islamic-400">
                      {messages?.calendar?.hijriDate || "Hijri Date"}
                    </p>
                    <p className="font-semibold text-islamic-800 dark:text-islamic-200 font-amiri">
                      {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
                    </p>
                    <p className="text-sm text-islamic-500 dark:text-islamic-500">
                      {hijriDate.day} {hijriDate.month.en} {hijriDate.year}{" "}
                      {hijriDate.designation.abbreviated}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prayer Times */}
            {prayerTimes && (
              <div className="card group rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                  {messages?.calendar?.prayerTimes || "Prayer Times"}
                </h3>

                <div className="space-y-3">
                  {Object.entries(prayerTimes).map(([prayer, time]) => {
                    if (
                      prayer === "Sunrise" ||
                      prayer === "Sunset" ||
                      prayer === "Imsak" ||
                      prayer === "Midnight"
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={prayer}
                        className="flex justify-between items-center"
                      >
                        <span className="">
                          {messages?.calendar?.prayers?.[
                            prayer.toLowerCase()
                          ] || prayer}
                        </span>
                        <span className="font-semibold text-islamic-800 dark:text-islamic-200">
                          {formatTime(time)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-islamic-500 dark:text-islamic-500 text-center">
                    {messages?.calendar?.prayerTimesNote ||
                      "Prayer times are approximate"}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-islamic-800 dark:text-islamic-200 mb-4">
                {messages?.calendar?.quickActions || "Quick Actions"}
              </h3>

              <div className="space-y-3">
                <button className="w-full p-3 bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground rounded-lg transition-colors duration-200">
                  📖 {messages?.calendar?.readQuran || "Read Quran"}
                </button>

                <button className="w-full p-3 bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground rounded-lg transition-colors duration-200">
                  🤲 {messages?.calendar?.makeNiyyah || "Make Niyyah"}
                </button>

                <button className="w-full p-3 bg-surface hover:bg-buttonHover active:bg-buttonActive text-foreground rounded-lg transition-colors duration-200">
                  📿 {messages?.calendar?.dhikr || "Dhikr Counter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
