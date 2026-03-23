'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Settings, WeatherData, MealData, TimetableItem, SchoolEvent } from '@/types';
import { loadSettings } from '@/lib/storage';
import { fetchWeather, fetchMeal, fetchTimetable, fetchEvents } from '@/lib/api';
import { THEMES } from '@/lib/theme';
import WeatherCard from './WeatherCard';
import MealCard from './MealCard';
import TimetableCard from './TimetableCard';
import ScheduleCard from './ScheduleCard';
import SuppliesCard from './SuppliesCard';
import EventsCard from './EventsCard';
import SettingsModal from './SettingsModal';
import VisitorStatsModal, { recordUniqueVisit } from './VisitorStatsModal';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getDisplayName(s: Settings): string {
  if (s.childFirstName?.trim()) return s.childFirstName.trim();
  if (s.childName?.trim()) return s.childName.trim();
  return '';
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const day = DAY_NAMES[d.getDay()];
  return `${y}년 ${m}월 ${dd}일 (${day})`;
}

function formatClock(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${ampm} ${h12}:${m}:${s}`;
}

export default function Dashboard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [meal, setMeal] = useState<MealData | null>(null);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [clock, setClock] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [visitorStatsOpen, setVisitorStatsOpen] = useState(false);
  const [loading, setLoading] = useState({
    weather: true,
    meal: true,
    timetable: true,
    events: true,
  });

  // 실시간 시계
  useEffect(() => {
    const now = new Date();
    setClock(formatClock(now));
    setDateStr(formatDate(now));
    const timer = setInterval(() => {
      const n = new Date();
      setClock(formatClock(n));
      setDateStr(formatDate(n));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 고유 방문자 카운터 (서버 기록)
  useEffect(() => {
    recordUniqueVisit().then((isNew) => setShowCounter(isNew));
  }, []);

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

  const displayName = getDisplayName(settings);
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
          <div className="flex items-center gap-3">
            {clock && (
              <div className={`text-left tabular-nums ${theme.headerIcon} flex flex-col sm:flex-row sm:items-baseline sm:gap-x-3`}>
                <span className="text-sm sm:text-xl font-bold leading-tight">{dateStr}</span>
                <span className="text-sm sm:text-xl font-bold leading-tight">{clock}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h1 className={`font-title text-sm sm:text-xl ${theme.headerTitle}`}>
              {displayName ? `${displayName}의 스마트 보드` : '나의 스마트 보드'}
            </h1>
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-full ${theme.headerHover} transition-colors`}
              aria-label="설정"
            >
              <SettingsIcon className={`w-5 h-5 ${theme.headerIcon}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherCard weather={weather} loading={loading.weather} theme={theme} />

          <TimetableCard timetable={timetable} loading={loading.timetable} hasSchool={!!settings.schoolCode} theme={theme} grade={settings.grade} classNum={settings.classNum} />

          <SuppliesCard supplies={todaySchedule.supplies} theme={theme} />

          <ScheduleCard
            weeklySchedule={settings.weeklySchedule}
            todayDay={today}
            theme={theme}
            childName={displayName}
          />

          <MealCard meal={meal} loading={loading.meal} hasSchool={!!settings.schoolCode} theme={theme} />

          <EventsCard events={events} loading={loading.events} hasSchool={!!settings.schoolCode} theme={theme} />
        </div>
      </main>

      {/* 하단 */}
      <footer className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between">
        <span className="text-[9px] text-gray-300">created by 이츠써니</span>
        <button
          onClick={() => setVisitorStatsOpen(true)}
          className="opacity-0 hover:opacity-40 transition-opacity text-[10px] text-gray-400 w-16 h-6"
          aria-label="방문 통계"
        />
      </footer>

      <VisitorStatsModal
        isOpen={visitorStatsOpen}
        onClose={() => setVisitorStatsOpen(false)}
      />

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
