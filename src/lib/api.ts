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

// ── 기상청 API Hub 공통 유틸 ──

const KMA_BASE = 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0';

// 위경도 → 기상청 격자 좌표 변환 (Lambert Conformal Conic)
function latLonToGrid(lat: number, lon: number): { nx: number; ny: number } {
  const DEGRAD = Math.PI / 180.0;
  const re = 6371.00877 / 5.0;
  const slat1 = 30.0 * DEGRAD;
  const slat2 = 60.0 * DEGRAD;
  const olon = 126.0 * DEGRAD;
  const olat = 38.0 * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + 43 + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + 136 + 0.5),
  };
}

// KST 현재 시각
function getKstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

// KST Date → YYYYMMDD
function kstDateStr(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

// 단기예보 base_time 계산 (발표시각: 02,05,08,11,14,17,20,23시)
function getVilageFcstBase(kst: Date): { baseDate: string; baseTime: string } {
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  if (m < 10) h -= 1; // 발표 후 ~10분 지연

  let baseHour = 23;
  let usePrevDay = h < baseTimes[0];

  if (!usePrevDay) {
    for (const bt of baseTimes) {
      if (h >= bt) baseHour = bt;
    }
  }

  const baseDate = new Date(kst);
  if (usePrevDay) {
    baseDate.setUTCDate(baseDate.getUTCDate() - 1);
    baseHour = 23;
  }

  return {
    baseDate: kstDateStr(baseDate),
    baseTime: String(baseHour).padStart(2, '0') + '00',
  };
}

// 초단기실황 base_time 계산 (매시 정각 발표, ~40분 후 제공)
function getUltraSrtNcstBase(kst: Date): { baseDate: string; baseTime: string } {
  let h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  if (m < 40) h -= 1;

  const baseDate = new Date(kst);
  if (h < 0) {
    h = 23;
    baseDate.setUTCDate(baseDate.getUTCDate() - 1);
  }

  return {
    baseDate: kstDateStr(baseDate),
    baseTime: String(h).padStart(2, '0') + '00',
  };
}

// 기상청 SKY+PTY → OpenWeatherMap 호환 icon 코드
function kmaToIcon(sky: number, pty: number, isNight: boolean): string {
  const s = isNight ? 'n' : 'd';
  if (pty > 0) {
    switch (pty) {
      case 1: return `10${s}`; // 비
      case 2: case 3: return `13${s}`; // 비/눈, 눈
      case 4: return `09${s}`; // 소나기
      default: return `10${s}`;
    }
  }
  switch (sky) {
    case 1: return `01${s}`; // 맑음
    case 3: return `02${s}`; // 구름많음
    case 4: return `04${s}`; // 흐림
    default: return `02${s}`;
  }
}

// 기상청 SKY+PTY → 날씨 설명
function kmaToDescription(sky: number, pty: number): string {
  if (pty > 0) {
    switch (pty) {
      case 1: return '비';
      case 2: return '비/눈';
      case 3: return '눈';
      case 4: return '소나기';
      default: return '비';
    }
  }
  switch (sky) {
    case 1: return '맑음';
    case 3: return '구름많음';
    case 4: return '흐림';
    default: return '맑음';
  }
}

// 체감온도 계산
function calcFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  if (temp <= 10 && windSpeed >= 1.3) {
    const v = windSpeed * 3.6; // m/s → km/h
    return Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(v, 0.16) + 0.3965 * Math.pow(v, 0.16) * temp);
  }
  if (temp >= 27) {
    const e = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
    return Math.round(temp + 0.33 * e - 4.0);
  }
  return Math.round(temp);
}

// 기상청 API 응답에서 items 추출
interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  obsrValue?: string;
  nx: number;
  ny: number;
}

function parseKmaItems(data: unknown): KmaItem[] {
  const d = data as { response?: { body?: { items?: { item?: KmaItem[] } } } };
  return d?.response?.body?.items?.item || [];
}

// 특정 날짜의 forecast 항목에서 현재 시각에 가장 가까운 값 찾기
function findClosestValue(items: KmaItem[], category: string, targetTime: string): string | null {
  const filtered = items.filter((i) => i.category === category);
  if (filtered.length === 0) return null;
  let closest = filtered[0];
  let minDiff = Infinity;
  for (const item of filtered) {
    const diff = Math.abs(parseInt(item.fcstTime || '0') - parseInt(targetTime));
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest.fcstValue ?? null;
}

// ── 내일 날씨 (기상청 단기예보) ──
export async function fetchTomorrowWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  const locationPromise = reverseGeocode(lat, lon);

  if (!WEATHER_API_KEY) {
    const locationName = await locationPromise;
    return {
      temp: 17, tempMin: 11, tempMax: 21, feelsLike: 15,
      description: '맑음', icon: '01d', dust: '보통',
      pm10: 0, pm25: 0, rainChance: 5,
      locationName: locationName || '서울',
    };
  }

  try {
    const { nx, ny } = latLonToGrid(lat, lon);
    const kst = getKstNow();
    const { baseDate, baseTime } = getVilageFcstBase(kst);

    const kstTomorrow = new Date(kst);
    kstTomorrow.setUTCDate(kstTomorrow.getUTCDate() + 1);
    const tomorrowStr = kstDateStr(kstTomorrow);
    const currentTimeStr = String(kst.getUTCHours()).padStart(2, '0') + '00';

    const [fcstRes, locationName] = await Promise.all([
      fetch(`${KMA_BASE}/getVilageFcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      locationPromise,
    ]);

    const allItems = parseKmaItems(await fcstRes.json());
    const tomorrowItems = allItems.filter((i) => i.fcstDate === tomorrowStr);

    if (tomorrowItems.length === 0) return null;

    // 기온: TMP 전체 + TMN/TMX
    const temps = tomorrowItems
      .filter((i) => i.category === 'TMP')
      .map((i) => parseFloat(i.fcstValue || '0'));
    const tmn = allItems.find((i) => i.category === 'TMN' && i.fcstDate === tomorrowStr);
    const tmx = allItems.find((i) => i.category === 'TMX' && i.fcstDate === tomorrowStr);
    const allTemps = [...temps];
    if (tmn) allTemps.push(parseFloat(tmn.fcstValue || '0'));
    if (tmx) allTemps.push(parseFloat(tmx.fcstValue || '0'));

    if (allTemps.length === 0) return null;

    const tempMin = Math.round(Math.min(...allTemps));
    const tempMax = Math.round(Math.max(...allTemps));

    // 대표 기온 (현재 시각에 가장 가까운)
    const repTempStr = findClosestValue(tomorrowItems, 'TMP', currentTimeStr);
    const repTemp = repTempStr ? parseFloat(repTempStr) : allTemps[0];

    // SKY, PTY, WSD, REH
    const sky = parseInt(findClosestValue(tomorrowItems, 'SKY', currentTimeStr) || '1');
    const pty = parseInt(findClosestValue(tomorrowItems, 'PTY', currentTimeStr) || '0');
    const wsd = parseFloat(findClosestValue(tomorrowItems, 'WSD', currentTimeStr) || '0');
    const reh = parseFloat(findClosestValue(tomorrowItems, 'REH', currentTimeStr) || '50');

    // 강수확률 최댓값
    const pops = tomorrowItems
      .filter((i) => i.category === 'POP')
      .map((i) => parseInt(i.fcstValue || '0'));
    const rainChance = pops.length > 0 ? Math.max(...pops) : 0;

    const isNight = kst.getUTCHours() >= 18 || kst.getUTCHours() < 6;

    return {
      temp: Math.round(repTemp),
      tempMin,
      tempMax,
      feelsLike: calcFeelsLike(repTemp, wsd, reh),
      description: kmaToDescription(sky, pty),
      icon: kmaToIcon(sky, pty, isNight),
      dust: '보통',
      pm10: 0,
      pm25: 0,
      rainChance,
      locationName: locationName || '',
    };
  } catch {
    return null;
  }
}

// ── 오늘 날씨 (기상청 초단기실황 + 단기예보) ──
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  const locationPromise = reverseGeocode(lat, lon);

  if (!WEATHER_API_KEY) {
    const locationName = await locationPromise;
    return {
      temp: 18, tempMin: 12, tempMax: 22, feelsLike: 16,
      description: '맑음', icon: '01d', dust: '보통',
      pm10: 0, pm25: 0, rainChance: 10,
      locationName: locationName || '서울',
    };
  }

  try {
    const { nx, ny } = latLonToGrid(lat, lon);
    const kst = getKstNow();
    const ncstBase = getUltraSrtNcstBase(kst);
    const fcstBase = getVilageFcstBase(kst);
    const todayStr = kstDateStr(kst);

    const [ncstRes, fcstRes, locationName] = await Promise.all([
      fetch(`${KMA_BASE}/getUltraSrtNcst?pageNo=1&numOfRows=10&dataType=JSON&base_date=${ncstBase.baseDate}&base_time=${ncstBase.baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      fetch(`${KMA_BASE}/getVilageFcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date=${fcstBase.baseDate}&base_time=${fcstBase.baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      locationPromise,
    ]);

    // 초단기실황: 현재 기온, 습도, 풍속, 강수형태
    const ncstItems = parseKmaItems(await ncstRes.json());
    let currentTemp = 0, currentPty = 0, currentReh = 50, currentWsd = 0;
    for (const item of ncstItems) {
      const v = item.obsrValue || '0';
      switch (item.category) {
        case 'T1H': currentTemp = parseFloat(v); break;
        case 'PTY': currentPty = parseInt(v); break;
        case 'REH': currentReh = parseFloat(v); break;
        case 'WSD': currentWsd = parseFloat(v); break;
      }
    }

    // 단기예보: 오늘 기온 전체
    const allItems = parseKmaItems(await fcstRes.json());
    const todayItems = allItems.filter((i) => i.fcstDate === todayStr);

    const temps = todayItems
      .filter((i) => i.category === 'TMP')
      .map((i) => parseFloat(i.fcstValue || '0'));
    const tmn = allItems.find((i) => i.category === 'TMN' && i.fcstDate === todayStr);
    const tmx = allItems.find((i) => i.category === 'TMX' && i.fcstDate === todayStr);

    const allTemps = [currentTemp, ...temps];
    if (tmn) allTemps.push(parseFloat(tmn.fcstValue || '0'));
    if (tmx) allTemps.push(parseFloat(tmx.fcstValue || '0'));

    const tempMin = Math.round(Math.min(...allTemps));
    const tempMax = Math.round(Math.max(...allTemps));

    // 강수확률 최댓값
    const pops = todayItems
      .filter((i) => i.category === 'POP')
      .map((i) => parseInt(i.fcstValue || '0'));
    const rainChance = pops.length > 0 ? Math.max(...pops) : 0;

    // 현재 시각 가장 가까운 SKY
    const currentTimeStr = String(kst.getUTCHours()).padStart(2, '0') + '00';
    const sky = parseInt(findClosestValue(todayItems, 'SKY', currentTimeStr) || '1');

    const isNight = kst.getUTCHours() >= 18 || kst.getUTCHours() < 6;

    return {
      temp: Math.round(currentTemp),
      tempMin,
      tempMax,
      feelsLike: calcFeelsLike(currentTemp, currentWsd, currentReh),
      description: kmaToDescription(sky, currentPty),
      icon: kmaToIcon(sky, currentPty, isNight),
      dust: '보통',
      pm10: 0,
      pm25: 0,
      rainChance,
      locationName: locationName || '',
    };
  } catch {
    return null;
  }
}
