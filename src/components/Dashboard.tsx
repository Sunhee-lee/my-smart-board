'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Settings, WeatherData, MealData, TimetableItem, SchoolEvent } from '@/types';
import { loadSettings } from '@/lib/storage';
import { fetchWeather, fetchMeal, fetchTimetable, fetchEvents } from '@/lib/api';
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

  // 설정 불러오기
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // 날씨 가져오기
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
          // 위치 권한 거부 시 서울 기본 좌표
          const data = await fetchWeather(37.5665, 126.978);
          setWeather(data);
          setLoading((prev) => ({ ...prev, weather: false }));
        }
      );
    } else {
      setLoading((prev) => ({ ...prev, weather: false }));
    }
  }, [settings]);

  // NEIS 데이터 가져오기
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

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-pulse text-purple-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  const today = DAY_NAMES[new Date().getDay()];
  const todaySchedule = settings.weeklySchedule[today] || {
    academies: [],
    supplies: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-purple-600 flex items-center gap-2">
            <span className="text-2xl">🎒</span> 스마트 등교 대시보드
          </h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
            aria-label="설정"
          >
            <SettingsIcon className="w-5 h-5 text-purple-500" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 캐릭터 인사 */}
        <CharacterGreeting name={settings.childName} />

        {/* 대시보드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌상단: 날씨 */}
          <WeatherCard weather={weather} loading={loading.weather} />

          {/* 우상단: 급식 */}
          <MealCard meal={meal} loading={loading.meal} hasSchool={!!settings.schoolCode} />

          {/* 좌중단: 학원/방과후 */}
          <ScheduleCard academies={todaySchedule.academies} />

          {/* 우중단: 준비물 */}
          <SuppliesCard supplies={todaySchedule.supplies} />

          {/* 좌하단: 시간표 */}
          <TimetableCard timetable={timetable} loading={loading.timetable} hasSchool={!!settings.schoolCode} />

          {/* 우하단: 학사일정 */}
          <EventsCard events={events} loading={loading.events} hasSchool={!!settings.schoolCode} />
        </div>
      </main>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
