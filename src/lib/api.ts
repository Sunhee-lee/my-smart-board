import { MealData, TimetableItem, SchoolEvent, WeatherData } from '@/types';

const NEIS_API_KEY = process.env.NEXT_PUBLIC_NEIS_API_KEY || '';
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// ── 나이스 학교 검색 ──
export async function searchSchool(
  schoolName: string
): Promise<{ schoolCode: string; eduOfficeCode: string; schoolFullName: string }[]> {
  if (!schoolName.trim()) return [];
  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NEIS_API_KEY}&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    const res = await fetch(url);
    const data = await res.json();
    const rows = data?.schoolInfo?.[1]?.row;
    if (!rows) return [];
    return rows.map((r: Record<string, string>) => ({
      schoolCode: r.SD_SCHUL_CODE,
      eduOfficeCode: r.ATPT_OFCDC_SC_CODE,
      schoolFullName: r.SCHUL_NM,
    }));
  } catch {
    return [];
  }
}

// ── 급식 정보 ──
export async function fetchMeal(
  eduOfficeCode: string,
  schoolCode: string
): Promise<MealData | null> {
  if (!schoolCode) return null;
  try {
    const date = formatDate(new Date());
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;
    const res = await fetch(url);
    const data = await res.json();
    const row = data?.mealServiceDietInfo?.[1]?.row?.[0];
    if (!row) return null;
    const menu = row.DDISH_NM.replace(/<br\/>/g, '\n')
      .split('\n')
      .map((s: string) =>
        s
          .replace(/\([^)]*\)/g, '')   // (1.2.5) 형태 제거
          .replace(/[0-9.]+$/g, '')     // 끝에 붙은 숫자.점 제거
          .replace(/\s*\.\s*/g, ' ')    // 남은 점 정리
          .trim()
      )
      .filter(Boolean);
    return { menu, cal: row.CAL_INFO || '' };
  } catch {
    return null;
  }
}

// ── 시간표 ──
export async function fetchTimetable(
  eduOfficeCode: string,
  schoolCode: string,
  grade: string,
  classNum: string
): Promise<TimetableItem[]> {
  if (!schoolCode) return [];
  try {
    const date = formatDate(new Date());
    const url = `https://open.neis.go.kr/hub/elsTimetable?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&GRADE=${grade}&CLASS_NM=${classNum}&ALL_TI_YMD=${date}`;
    const res = await fetch(url);
    const data = await res.json();
    const rows = data?.elsTimetable?.[1]?.row;
    if (!rows) return [];
    return rows.map((r: Record<string, string>) => ({
      period: parseInt(r.PERIO, 10),
      subject: r.ITRT_CNTNT,
    }));
  } catch {
    return [];
  }
}

// ── 학사일정 ──
export async function fetchEvents(
  eduOfficeCode: string,
  schoolCode: string
): Promise<SchoolEvent[]> {
  if (!schoolCode) return [];
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4);

    const from = formatDate(startOfWeek);
    const to = formatDate(endOfWeek);
    const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&AA_FROM_YMD=${from}&AA_TO_YMD=${to}`;
    const res = await fetch(url);
    const data = await res.json();
    const rows = data?.SchoolSchedule?.[1]?.row;
    if (!rows) return [];
    return rows.map((r: Record<string, string>) => ({
      date: `${r.AA_YMD.slice(4, 6)}/${r.AA_YMD.slice(6, 8)}`,
      title: r.EVENT_NM,
    }));
  } catch {
    return [];
  }
}

// ── 날씨 (OpenWeatherMap + 미세먼지) ──
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  if (!WEATHER_API_KEY) {
    // API 키가 없으면 더미 데이터 반환
    return {
      temp: 18,
      description: '맑음',
      icon: '01d',
      dust: '보통',
    };
  }
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    const airRes = await fetch(airUrl);
    const airData = await airRes.json();

    const aqi = airData?.list?.[0]?.main?.aqi ?? 2;
    const dustLabels: Record<number, string> = {
      1: '좋음',
      2: '보통',
      3: '나쁨',
      4: '매우나쁨',
      5: '위험',
    };

    return {
      temp: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      dust: dustLabels[aqi] || '보통',
    };
  } catch {
    return null;
  }
}
