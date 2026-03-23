'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Settings, WeatherData, MealData, TimetableItem, SchoolEvent } from '@/types';
import { loadSettings } from '@/lib/storage';
import { fetchWeather, fetchMeal, fetchTimetable, fetchEvents } from '@/lib/api';
import { THEMES } from '@/lib/theme';
import CharacterGreeting from './CharacterGreeting';
import WeatherCard from './WeatherCard';
import MealCard from './MealCard';
import TimetableCard from './TimetableCard';
import ScheduleCard from './ScheduleCard';
import SuppliesCard from './SuppliesCard';
import EventsCard from './EventsCard';
import SettingsModal from './SettingsModal';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function Dashboard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [meal, setMeal] = useState<MealData | null>(null);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState({
    weather: true,
    meal: true,
    timetable: true,
    events: true,
  });

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
          setLoading((prev) => ({ ...prev, weather: false }));
        },
        async () => {
          const data = await fetchWeather(37.5665, 126.978);
          setWeather(data);
          setLoading((prev) => ({ ...prev, weather: false }));
        }
      );
    } else {
      setLoading((prev) => ({ ...prev, weather: false }));
    }
  }, [settings]);

  const fetchNeisData = useCallback(async (s: Settings) => {
    if (!s.schoolCode) {
      setLoading((prev) => ({ ...prev, meal: false, timetable: false, events: false }));
      return;
    }
    const [mealData, ttData, evtData] = await Promise.all([
      fetchMeal(s.eduOfficeCode, s.schoolCode),
      fetchTimetable(s.eduOfficeCode, s.schoolCode, s.grade, s.classNum),
      fetchEvents(s.eduOfficeCode, s.schoolCode),
    ]);
    setMeal(mealData);
    setTimetable(ttData);
    setEvents(evtData);
    setLoading((prev) => ({ ...prev, meal: false, timetable: false, events: false }));
  }, []);

  useEffect(() => {
    if (settings) fetchNeisData(settings);
  }, [settings, fetchNeisData]);

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setLoading({ weather: false, meal: true, timetable: true, events: true });
  };

  const theme = THEMES[settings?.theme || 'pink'];

  if (!settings) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="animate-pulse text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  const today = DAY_NAMES[new Date().getDay()];
  const todaySchedule = settings.weeklySchedule[today] || {
    academies: [],
    supplies: [],
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      {/* 상단 바 */}
      <header className={`sticky top-0 z-10 ${theme.headerBg} backdrop-blur-md border-b ${theme.headerBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className={`font-title text-xl ${theme.headerTitle} flex items-center gap-2`}>
            <span className="text-2xl">🎒</span> 스마트 등교 대시보드
          </h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className={`p-2 rounded-full ${theme.headerHover} transition-colors`}
            aria-label="설정"
          >
            <SettingsIcon className={`w-5 h-5 ${theme.headerIcon}`} />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <CharacterGreeting name={settings.childName} theme={theme} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌상단: 날씨 */}
          <WeatherCard weather={weather} loading={loading.weather} theme={theme} />

          {/* 우상단: 학원/방과후 (기존 급식 자리) */}
          <ScheduleCard
            weeklySchedule={settings.weeklySchedule}
            todayDay={today}
            theme={theme}
          />

          {/* 좌중단: 급식 (기존 학원 자리) */}
          <MealCard meal={meal} loading={loading.meal} hasSchool={!!settings.schoolCode} theme={theme} />

          {/* 우중단: 준비물 */}
          <SuppliesCard supplies={todaySchedule.supplies} theme={theme} />

          {/* 좌하단: 시간표 */}
          <TimetableCard timetable={timetable} loading={loading.timetable} hasSchool={!!settings.schoolCode} theme={theme} />

          {/* 우하단: 학사일정 */}
          <EventsCard events={events} loading={loading.events} hasSchool={!!settings.schoolCode} theme={theme} />
        </div>
      </main>

      {/* 방문자 카운터 - hits.sh 무료 서비스 */}
      <div className="fixed bottom-3 right-3 opacity-50 hover:opacity-80 transition-opacity">
        <a href="https://hits.sh/smart-school-dashboard.vercel.app/" target="_blank" rel="noopener noreferrer">
          <img
            src="https://hits.sh/smart-school-dashboard.vercel.app.svg?view=today-total&style=flat-square&label=visitors&color=aaaaaa&labelColor=f0f0f0"
            alt="오늘 방문자"
            className="h-5"
          />
        </a>
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        theme={theme}
      />
    </div>
  );
}
