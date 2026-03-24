'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Settings, WeatherData, MealData, TimetableItem, SchoolEvent } from '@/types';
import { loadSettings } from '@/lib/storage';
import { fetchAllWeather, fetchWeather, fetchTomorrowWeather, fetchMeal, fetchTimetable, fetchEvents } from '@/lib/api';
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

// 날씨 데이터가 유효한지 검증 (API 실패로 0값만 들어온 경우 캐시 방지)
function isValidWeather(data: WeatherData): boolean {
  return data.temp !== 0 || data.tempMax !== 0 || data.locationName !== '';
}

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
  const [refreshingWeather, setRefreshingWeather] = useState(false);
  const [viewTomorrow, setViewTomorrow] = useState(false);
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherData | null>(null);
  const [tomorrowMeal, setTomorrowMeal] = useState<MealData | null>(null);
  const [tomorrowTimetable, setTomorrowTimetable] = useState<TimetableItem[]>([]);
  const [tomorrowLoading, setTomorrowLoading] = useState({ weather: false, meal: false, timetable: false });
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

    const CACHE_KEY = 'smart-board-weather-cache';
    const CACHE_TTL = 30 * 60 * 1000; // 30분
    const COORD_KEY = 'smart-board-geo-cache';

    // 캐시된 날씨 데이터가 있으면 오늘 날씨 즉시 표시
    let usedCache = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setWeather(data);
          setLoading((prev) => ({ ...prev, weather: false }));
          usedCache = true;
        }
      }
    } catch { /* 캐시 오류 무시 */ }

    const loadWeather = async (lat: number, lon: number) => {
      // 좌표 캐싱
      localStorage.setItem(COORD_KEY, JSON.stringify({ lat, lon }));

      if (usedCache) {
        // 오늘 날씨는 캐시 사용 중 → 내일 날씨만 개별 호출
        const tmrData = await fetchTomorrowWeather(lat, lon);
        setTomorrowWeather(tmrData);
      } else {
        // 오늘+내일 날씨를 한 번에 가져오기
        const { today, tomorrow } = await fetchAllWeather(lat, lon);
        if (today && isValidWeather(today)) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: today, timestamp: Date.now() }));
        }
        setWeather(today);
        // 내일 데이터가 없으면 개별 API로 폴백
        if (tomorrow) {
          setTomorrowWeather(tomorrow);
        } else {
          fetchTomorrowWeather(lat, lon).then(setTomorrowWeather);
        }
        setLoading((prev) => ({ ...prev, weather: false }));
      }
    };

    if (navigator.geolocation) {
      // 캐시된 좌표로 먼저 빠르게 로딩, 그 뒤 GPS로 갱신
      try {
        const geoCache = localStorage.getItem(COORD_KEY);
        if (geoCache) {
          const { lat, lon } = JSON.parse(geoCache);
          loadWeather(lat, lon);
          return;
        }
      } catch { /* 무시 */ }

      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => loadWeather(37.5665, 126.978)
      );
    } else {
      setLoading((prev) => ({ ...prev, weather: false }));
    }
  }, [settings]);

  const refreshWeather = useCallback(() => {
    const CACHE_KEY = 'smart-board-weather-cache';
    const COORD_KEY = 'smart-board-geo-cache';
    setRefreshingWeather(true);

    const loadWeather = async (lat: number, lon: number) => {
      localStorage.setItem(COORD_KEY, JSON.stringify({ lat, lon }));
      const { today, tomorrow } = await fetchAllWeather(lat, lon);
      if (today && isValidWeather(today)) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: today, timestamp: Date.now() }));
      }
      setWeather(today);
      if (tomorrow) {
        setTomorrowWeather(tomorrow);
      } else {
        fetchTomorrowWeather(lat, lon).then(setTomorrowWeather);
      }
      setRefreshingWeather(false);
    };

    // 캐시 삭제 후 GPS로 새로 가져오기
    localStorage.removeItem(CACHE_KEY);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // GPS 실패 시 캐시된 좌표 사용
          try {
            const geoCache = localStorage.getItem(COORD_KEY);
            if (geoCache) {
              const { lat, lon } = JSON.parse(geoCache);
              loadWeather(lat, lon);
              return;
            }
          } catch { /* 무시 */ }
          loadWeather(37.5665, 126.978);
        }
      );
    } else {
      setRefreshingWeather(false);
    }
  }, []);

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

  const fetchTomorrowData = useCallback(async (s: Settings) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 내일 날씨는 이미 로딩 시 함께 가져옴 — 급식/시간표만 가져오기
    if (s.schoolCode) {
      setTomorrowLoading({ weather: false, meal: true, timetable: true });
      const [mealData, ttData] = await Promise.all([
        fetchMeal(s.eduOfficeCode, s.schoolCode, tomorrow),
        fetchTimetable(s.eduOfficeCode, s.schoolCode, s.grade, s.classNum, tomorrow),
      ]);
      setTomorrowMeal(mealData);
      setTomorrowTimetable(ttData);
    }
    setTomorrowLoading({ weather: false, meal: false, timetable: false });
  }, []);

  const toggleView = useCallback(() => {
    if (!viewTomorrow && settings) {
      // 내일 급식/시간표가 없으면 가져오기 (날씨는 이미 로드됨)
      if (!tomorrowMeal && !tomorrowLoading.meal) {
        fetchTomorrowData(settings);
      }
    }
    setViewTomorrow((prev) => !prev);
  }, [viewTomorrow, settings, tomorrowMeal, tomorrowLoading, fetchTomorrowData]);

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setLoading({ weather: false, meal: true, timetable: true, events: true });
  };

  const theme = THEMES[settings?.theme || 'sky'];

  if (!settings) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="animate-pulse text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  const displayName = getDisplayName(settings);
  const today = DAY_NAMES[new Date().getDay()];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = DAY_NAMES[tomorrow.getDay()];
  const activeDay = viewTomorrow ? tomorrowDay : today;
  const activeSchedule = settings.weeklySchedule[activeDay] || {
    academies: [],
    supplies: [],
  };
  const dayLabel = viewTomorrow ? '내일의' : '오늘의';

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
            <h1 className={`font-title text-base sm:text-xl ${theme.headerTitle}`}>
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
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherCard
            weather={viewTomorrow ? tomorrowWeather : weather}
            loading={viewTomorrow ? tomorrowLoading.weather : loading.weather}
            theme={theme}
            onRefresh={viewTomorrow ? undefined : refreshWeather}
            refreshing={refreshingWeather}
            dayLabel={dayLabel}
          />

          <TimetableCard
            timetable={viewTomorrow ? tomorrowTimetable : timetable}
            loading={viewTomorrow ? tomorrowLoading.timetable : loading.timetable}
            hasSchool={!!settings.schoolCode}
            theme={theme}
            grade={settings.grade}
            classNum={settings.classNum}
            dayLabel={dayLabel}
          />

          <ScheduleCard
            weeklySchedule={settings.weeklySchedule}
            todayDay={activeDay}
            theme={theme}
            childName={displayName}
            dayLabel={dayLabel}
          />

          <SuppliesCard supplies={activeSchedule.supplies} theme={theme} dayLabel={dayLabel} />

          <MealCard
            meal={viewTomorrow ? tomorrowMeal : meal}
            loading={viewTomorrow ? tomorrowLoading.meal : loading.meal}
            hasSchool={!!settings.schoolCode}
            theme={theme}
            dayLabel={dayLabel}
          />

          <EventsCard events={events} loading={loading.events} hasSchool={!!settings.schoolCode} theme={theme} />
        </div>
      </main>

      {/* 내일이 궁금해 / 오늘로 돌아가기 버튼 */}
      <div className="max-w-6xl mx-auto px-4 pt-1 pb-6 flex justify-end">
        <button
          onClick={toggleView}
          className={`card-title ${theme.headerIcon} hover:opacity-70 transition-opacity cursor-pointer`}
        >
          {viewTomorrow ? '< 오늘로 돌아가기' : '내일이 궁금해 >'}
        </button>
      </div>

      {/* 하단 크레딧 */}
      <footer className="max-w-6xl mx-auto px-4 pb-2 flex justify-center">
        <button
          onClick={() => setVisitorStatsOpen(true)}
          className="text-[9px] text-gray-300/60 hover:text-gray-400 transition-colors cursor-pointer"
          aria-label="방문 통계"
        >
          created by 이츠써니
        </button>
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
