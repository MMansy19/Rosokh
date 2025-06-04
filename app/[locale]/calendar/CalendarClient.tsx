"use client";

import { useState, useEffect, useMemo } from "react";
import { useNotifications } from "@/contexts/GlobalContext";
import { AnalyticsService } from "@/services/AnalyticsService";
import { NotificationService } from "@/services/NotificationService";

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
  // Notification and Analytics services
  const { notify } = useNotifications();
  const analytics = useMemo(() => AnalyticsService.getInstance(), []);
  const notifications = useMemo(() => NotificationService.getInstance(), []);

  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [islamicEvents, setIslamicEvents] = useState<IslamicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  // Track page view and enable prayer notifications
  useEffect(() => {
    analytics.trackPageView("/calendar", "Islamic Calendar");
    analytics.trackEvent("calendar_visit", "user", {
      timestamp: new Date().toISOString(),
      locale,
      section: "calendar",
    });

    // Request permission for prayer time notifications
    const setupPrayerNotifications = async () => {
      try {
        await notifications.requestPermission();
        if (location && prayerTimes) {
          const prayerTimesRecord: Record<string, string> = {
            Fajr: prayerTimes.Fajr,
            Dhuhr: prayerTimes.Dhuhr,
            Asr: prayerTimes.Asr,
            Maghrib: prayerTimes.Maghrib,
            Isha: prayerTimes.Isha,
          };
          await notifications.schedulePrayerNotifications(prayerTimesRecord);
          notify.success(
            messages?.calendar?.notifications?.enabled ||
              "Prayer time notifications enabled",
          );
        }
      } catch (error) {
        console.error("Failed to setup prayer notifications:", error);
        notify.info(
          messages?.calendar?.notifications?.permissionNeeded ||
            "Enable notifications to receive prayer time reminders",
        );
      }
    };

    setupPrayerNotifications();
  }, [
    analytics,
    locale,
    location,
    prayerTimes,
    messages,
    notify,
    notifications,
  ]);

  // Islamic events using translation keys
  const getIslamicEvents = (): IslamicEvent[] => [
    {
      date: "2024-01-01",
      title:
        messages?.calendar?.events?.islamic_new_year?.title ||
        "Islamic New Year",
      arabicTitle:
        messages?.calendar?.events?.islamic_new_year?.arabicTitle ||
        "رأس السنة الهجرية",
      description:
        messages?.calendar?.events?.islamic_new_year?.description ||
        "The beginning of the Islamic calendar year",
      type: "holiday",
    },
    {
      date: "2024-01-10",
      title:
        messages?.calendar?.events?.day_of_ashura?.title || "Day of Ashura",
      arabicTitle:
        messages?.calendar?.events?.day_of_ashura?.arabicTitle || "يوم عاشوراء",
      description:
        messages?.calendar?.events?.day_of_ashura?.description ||
        "The 10th day of Muharram, a day of fasting",
      type: "sunnah",
    },
    {
      date: "2024-03-01",
      title:
        messages?.calendar?.events?.isra_and_miraj?.title || "Isra and Miraj",
      arabicTitle:
        messages?.calendar?.events?.isra_and_miraj?.arabicTitle ||
        "الإسراء والمعراج",
      description:
        messages?.calendar?.events?.isra_and_miraj?.description ||
        "The night journey of Prophet Muhammad (PBUH)",
      type: "historical",
    },
    {
      date: "2024-04-01",
      title:
        messages?.calendar?.events?.start_of_ramadan?.title ||
        "Start of Ramadan",
      arabicTitle:
        messages?.calendar?.events?.start_of_ramadan?.arabicTitle ||
        "بداية شهر رمضان",
      description:
        messages?.calendar?.events?.start_of_ramadan?.description ||
        "The beginning of the holy month of fasting",
      type: "holiday",
    },
    {
      date: "2024-05-01",
      title: messages?.calendar?.events?.eid_al_fitr?.title || "Eid al-Fitr",
      arabicTitle:
        messages?.calendar?.events?.eid_al_fitr?.arabicTitle || "عيد الفطر",
      description:
        messages?.calendar?.events?.eid_al_fitr?.description ||
        "The festival of breaking the fast",
      type: "holiday",
    },
    {
      date: "2024-07-10",
      title: messages?.calendar?.events?.eid_al_adha?.title || "Eid al-Adha",
      arabicTitle:
        messages?.calendar?.events?.eid_al_adha?.arabicTitle || "عيد الأضحى",
      description:
        messages?.calendar?.events?.eid_al_adha?.description ||
        "The festival of sacrifice",
      type: "holiday",
    },
  ];

  useEffect(() => {
    // Get user location for prayer times
    if (navigator.geolocation) {
      analytics.trackEvent("location_request", "user", {
        method: "geolocation_api",
        purpose: "prayer_times",
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(coords);

          analytics.trackEvent("location_granted", "user", {
            accuracy: position.coords.accuracy,
            method: "geolocation",
          });

          notify.success(
            messages?.calendar?.location?.detected ||
              "Location detected for accurate prayer times",
          );
        },
        (error) => {
          console.warn("Geolocation error:", error);

          analytics.trackEvent("location_error", "error", {
            errorCode: error.code,
            errorMessage: error.message,
            fallback: "mecca",
          });

          // Use default location (Mecca)
          setLocation({ lat: 21.4225, lon: 39.8262 });

          notify.info(
            messages?.calendar?.location?.fallback ||
              "Using Mecca as default location. Enable location for accurate times.",
          );
        },
      );
    } else {
      // Use default location (Mecca)
      analytics.trackEvent("location_unavailable", "error", {
        reason: "geolocation_not_supported",
        fallback: "mecca",
      });

      setLocation({ lat: 21.4225, lon: 39.8262 });

      notify.warning(
        messages?.calendar?.location?.unsupported ||
          "Geolocation not supported. Using Mecca as default location.",
      );
    }

    setIslamicEvents(getIslamicEvents());
  }, [analytics, notify, messages]);

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

      analytics.trackEvent("hijri_date_request", "content", {
        gregorianDate: dateStr,
        locale,
      });

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

      analytics.trackEvent("hijri_date_loaded", "content", {
        hijriDate: mockHijriDate.date,
        hijriMonth: mockHijriDate.month.en,
        hijriYear: mockHijriDate.year,
      });
    } catch (error) {
      console.error("Error fetching Hijri date:", error);

      analytics.trackEvent("hijri_date_error", "error", {
        error: error instanceof Error ? error.message : "Unknown error",
        gregorianDate: selectedDate.toISOString().split("T")[0],
      });

      notify.error(
        messages?.calendar?.errors?.hijriDate ||
          "Failed to load Hijri date. Please try again.",
      );
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      if (!location) return;

      analytics.trackEvent("prayer_times_request", "content", {
        latitude: location.lat,
        longitude: location.lon,
        date: selectedDate.toISOString().split("T")[0],
      });

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

      analytics.trackEvent("prayer_times_loaded", "content", {
        location: `${location.lat},${location.lon}`,
        prayerCount: Object.keys(mockPrayerTimes).length,
        date: selectedDate.toISOString().split("T")[0],
      });

      // Schedule prayer notifications if enabled
      try {
        const prayerTimesRecord: Record<string, string> = {
          Fajr: mockPrayerTimes.Fajr,
          Dhuhr: mockPrayerTimes.Dhuhr,
          Asr: mockPrayerTimes.Asr,
          Maghrib: mockPrayerTimes.Maghrib,
          Isha: mockPrayerTimes.Isha,
        };
        await notifications.schedulePrayerNotifications(prayerTimesRecord);
      } catch (notificationError) {
        console.warn(
          "Failed to schedule prayer notifications:",
          notificationError,
        );
        // Don't show error to user as notifications are optional
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setLoading(false);

      analytics.trackEvent("prayer_times_error", "error", {
        error: error instanceof Error ? error.message : "Unknown error",
        location: location ? `${location.lat},${location.lon}` : "no_location",
      });

      notify.error(
        messages?.calendar?.errors?.prayerTimes ||
          "Failed to load prayer times. Please try again.",
      );
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
                  onClick={() => {
                    const newDate = new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() - 1,
                      1,
                    );
                    setSelectedDate(newDate);

                    analytics.trackEvent("calendar_navigation", "engagement", {
                      direction: "previous",
                      fromMonth: selectedDate.toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      }),
                      toMonth: newDate.toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      }),
                    });
                  }}
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
                  onClick={() => {
                    const newDate = new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() + 1,
                      1,
                    );
                    setSelectedDate(newDate);

                    analytics.trackEvent("calendar_navigation", "engagement", {
                      direction: "next",
                      fromMonth: selectedDate.toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      }),
                      toMonth: newDate.toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      }),
                    });
                  }}
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
                      onClick={() => {
                        analytics.trackEvent(
                          "calendar_date_click",
                          "engagement",
                          {
                            date: day.toISOString().split("T")[0],
                            isToday,
                            hasEvents,
                            eventsCount: events.length,
                          },
                        );

                        if (hasEvents) {
                          notify.info(
                            messages?.calendar?.dateEvents?.replace(
                              "{count}",
                              events.length.toString(),
                            ) ||
                              `${events.length} event${events.length > 1 ? "s" : ""} on this date`,
                          );
                        }
                      }}
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
              <h3 className="text-xl font-bold text-foreground mb-4">
                {messages?.calendar?.eventsThisMonth || "Events This Month"}
              </h3>{" "}
              <div className="space-y-4">
                {islamicEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-surface rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        event.type === "holiday"
                          ? "bg-warning"
                          : event.type === "sunnah"
                            ? "bg-success"
                            : "bg-info"
                      }`}
                    ></div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {event.title}
                      </h4>
                      <p className="text-muted font-amiri">
                        {event.arabicTitle}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted mt-1">
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
              <h3 className="text-xl font-bold text-foreground mb-4">
                {messages?.calendar?.today || "Today"}
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted">
                    {messages?.calendar?.gregorianDate || "Gregorian Date"}
                  </p>
                  <p className="font-semibold text-foreground">
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
                    <p className="text-sm text-muted">
                      {messages?.calendar?.hijriDate || "Hijri Date"}
                    </p>
                    <p className="font-semibold text-foreground font-amiri">
                      {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
                    </p>
                    <p className="text-sm text-muted">
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
                <h3 className="text-xl font-bold text-foreground mb-4">
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
                        <span className="font-semibold text-foreground">
                          {formatTime(time)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border">
                  <p className="text-xs text-muted text-center">
                    {messages?.calendar?.prayerTimesNote ||
                      "Prayer times are approximate"}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card group rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
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
