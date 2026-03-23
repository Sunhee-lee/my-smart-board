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
  schoolCode: string,
  targetDate?: Date
): Promise<MealData | null> {
  if (!schoolCode) return null;
  try {
    const date = formatDate(targetDate || new Date());
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;
    const res = await fetch(url);
    const data = await res.json();
    const row = data?.mealServiceDietInfo?.[1]?.row?.[0];
    if (!row) return null;
    const menu = row.DDISH_NM.replace(/<br\/>/g, '\n')
      .split('\n')
      .map((s: string) =>
        s
          .replace(/\([^)]*\)/g, '')
          .replace(/[0-9.]+$/g, '')
          .replace(/\s*\.\s*/g, ' ')
          .replace(/[a-zA-Z]+/g, '')
          .replace(/\s{2,}/g, ' ')
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
  classNum: string,
  targetDate?: Date
): Promise<TimetableItem[]> {
  if (!schoolCode) return [];
  try {
    const date = formatDate(targetDate || new Date());
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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const from = formatDate(startOfMonth);
    const to = formatDate(endOfMonth);
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

// ── 역지오코딩 (Nominatim, 무료) ──
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko&zoom=10`
    );
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return '';

    // 한국 주소: 시/도 + 구/군
    const city = addr.city || addr.town || addr.county || '';
    const district = addr.borough || addr.suburb || addr.quarter || addr.city_district || '';

    if (city && district) return `${city} ${district}`;
    if (city) return city;
    return data.display_name?.split(',')[0] || '';
  } catch {
    return '';
  }
}

// ── 날씨 (OpenWeatherMap + 미세먼지) ──
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  // 위치 정보는 항상 가져오기 (API 키 없어도)
  const locationPromise = reverseGeocode(lat, lon);

  if (!WEATHER_API_KEY) {
    const locationName = await locationPromise;
    return {
      temp: 18,
      tempMin: 12,
      tempMax: 22,
      feelsLike: 16,
      description: '맑음',
      icon: '01d',
      dust: '보통',
      pm10: 35,
      pm25: 15,
      rainChance: 10,
      locationName: locationName || '서울',
    };
  }
  try {
    const [weatherRes, airRes, forecastRes, locationName] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr&cnt=4`),
      locationPromise,
    ]);

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();
    const forecastData = await forecastRes.json();

    const aqi = airData?.list?.[0]?.main?.aqi ?? 2;
    const pm10 = Math.round(airData?.list?.[0]?.components?.pm10 ?? 0);
    const pm25 = Math.round(airData?.list?.[0]?.components?.pm2_5 ?? 0);
    const dustLabels: Record<number, string> = {
      1: '좋음',
      2: '보통',
      3: '나쁨',
      4: '매우나쁨',
      5: '위험',
    };

    // 강수확률: forecast의 첫 몇 개 시간대 중 최댓값
    const pops = (forecastData?.list || []).map((item: { pop?: number }) => Math.round((item.pop ?? 0) * 100));
    const rainChance = pops.length > 0 ? Math.max(...pops) : 0;

    return {
      temp: Math.round(weatherData.main.temp),
      tempMin: Math.round(weatherData.main.temp_min),
      tempMax: Math.round(weatherData.main.temp_max),
      feelsLike: Math.round(weatherData.main.feels_like),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      dust: dustLabels[aqi] || '보통',
      pm10,
      pm25,
      rainChance,
      locationName: locationName || weatherData.name || '',
    };
  } catch {
    return null;
  }
}
