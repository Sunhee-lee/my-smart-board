import { WeatherData } from '@/types';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const AIRKOREA_API_KEY = process.env.NEXT_PUBLIC_AIRKOREA_API_KEY || '';

const KMA_BASE = 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0';
const AIRKOREA_BASE = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

// ── 시도명 매핑 ──
const SIDO_MAP: Record<string, string> = {
  '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
  '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
  '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기',
  '강원특별자치도': '강원', '강원도': '강원',
  '충청북도': '충북', '충청남도': '충남',
  '전라북도': '전북', '전북특별자치도': '전북', '전라남도': '전남',
  '경상북도': '경북', '경상남도': '경남', '제주특별자치도': '제주',
};

// ── 역지오코딩 ──
interface GeoResult { displayName: string; sido: string }

async function reverseGeocode(lat: number, lon: number): Promise<GeoResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko&zoom=10`,
      { headers: { 'User-Agent': 'SmartBoard/1.0' } }
    );
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return { displayName: '', sido: '' };

    const city = addr.city || addr.town || addr.county || '';
    const district = addr.borough || addr.suburb || addr.quarter || addr.city_district || '';
    const state = addr.state || '';

    let displayName = '';
    if (city && district) displayName = `${city} ${district}`;
    else if (city) displayName = city;
    else displayName = data.display_name?.split(',')[0] || '';

    return { displayName, sido: SIDO_MAP[state] || '' };
  } catch {
    return { displayName: '', sido: '' };
  }
}

// ── 격자 좌표 변환 ──
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

// ── KST 유틸 ──
function getKstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

function kstDateStr(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function getVilageFcstBase(kst: Date): { baseDate: string; baseTime: string } {
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  if (m < 10) h -= 1;

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

// ── 날씨 변환 ──
function kmaToIcon(sky: number, pty: number, isNight: boolean): string {
  const s = isNight ? 'n' : 'd';
  if (pty > 0) {
    switch (pty) {
      case 1: return `10${s}`;
      case 2: case 3: return `13${s}`;
      case 4: return `09${s}`;
      default: return `10${s}`;
    }
  }
  switch (sky) {
    case 1: return `01${s}`;
    case 3: return `02${s}`;
    case 4: return `04${s}`;
    default: return `02${s}`;
  }
}

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

function calcFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  if (temp <= 10 && windSpeed >= 1.3) {
    const v = windSpeed * 3.6;
    return Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(v, 0.16) + 0.3965 * Math.pow(v, 0.16) * temp);
  }
  if (temp >= 27) {
    const e = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
    return Math.round(temp + 0.33 * e - 4.0);
  }
  return Math.round(temp);
}

// ── KMA 응답 파싱 ──
interface KmaItem {
  baseDate: string; baseTime: string; category: string;
  fcstDate?: string; fcstTime?: string; fcstValue?: string; obsrValue?: string;
  nx: number; ny: number;
}

function parseKmaItems(data: unknown): KmaItem[] {
  const d = data as { response?: { body?: { items?: { item?: KmaItem[] } } } };
  return d?.response?.body?.items?.item || [];
}

function findClosestValue(items: KmaItem[], category: string, targetTime: string): string | null {
  const filtered = items.filter((i) => i.category === category);
  if (filtered.length === 0) return null;
  let closest = filtered[0];
  let minDiff = Infinity;
  for (const item of filtered) {
    const diff = Math.abs(parseInt(item.fcstTime || '0') - parseInt(targetTime));
    if (diff < minDiff) { minDiff = diff; closest = item; }
  }
  return closest.fcstValue ?? null;
}

// ── 에어코리아 ──
interface AirQualityData { dust: string; pm10: number; pm25: number }
const DEFAULT_AIR: AirQualityData = { dust: '보통', pm10: 0, pm25: 0 };
const GRADE_LABEL: Record<string, string> = { '1': '좋음', '2': '보통', '3': '나쁨', '4': '매우나쁨' };

async function fetchAirQuality(sido: string): Promise<AirQualityData> {
  if (!AIRKOREA_API_KEY || !sido) return DEFAULT_AIR;
  try {
    const url = `${AIRKOREA_BASE}/getCtprvnRltmMesureDnsty?sidoName=${encodeURIComponent(sido)}&pageNo=1&numOfRows=100&returnType=json&serviceKey=${AIRKOREA_API_KEY}&ver=1.5`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.body?.items;
    if (!items || items.length === 0) return DEFAULT_AIR;

    for (const item of items) {
      const pm10 = parseInt(item.pm10Value);
      const pm25 = parseInt(item.pm25Value);
      if (!isNaN(pm10) && !isNaN(pm25) && pm10 > 0) {
        const pm10Grade = item.pm10Grade || '2';
        return { dust: GRADE_LABEL[pm10Grade] || '보통', pm10, pm25 };
      }
    }
    return DEFAULT_AIR;
  } catch {
    return DEFAULT_AIR;
  }
}

function fcstGradeToNum(grade: string, type: 'pm10' | 'pm25'): number {
  if (type === 'pm10') {
    switch (grade) { case '좋음': return 20; case '보통': return 55; case '나쁨': return 115; case '매우나쁨': return 180; default: return 0; }
  }
  switch (grade) { case '좋음': return 10; case '보통': return 25; case '나쁨': return 55; case '매우나쁨': return 90; default: return 0; }
}

function parseFcstGrade(informGrade: string, sido: string): string | null {
  const pairs = informGrade.split(',').map(s => s.trim());
  const gradeOrder = ['좋음', '보통', '나쁨', '매우나쁨'];
  let worstIdx = -1;
  for (const pair of pairs) {
    const [region, grade] = pair.split(':').map(s => s.trim());
    if (!region || !grade) continue;
    const isMatch = region === sido || region.startsWith(sido) ||
      (sido === '강원' && (region === '영동' || region === '영서'));
    if (isMatch) {
      const idx = gradeOrder.indexOf(grade);
      if (idx > worstIdx) worstIdx = idx;
    }
  }
  return worstIdx >= 0 ? gradeOrder[worstIdx] : null;
}

async function fetchAirQualityForecast(sido: string, tomorrowDateStr: string): Promise<AirQualityData> {
  if (!AIRKOREA_API_KEY || !sido) return DEFAULT_AIR;
  try {
    const kst = getKstNow();
    const searchDate = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-${String(kst.getUTCDate()).padStart(2, '0')}`;
    const url = `${AIRKOREA_BASE}/getMinuDustFrcstDspth?searchDate=${searchDate}&returnType=json&serviceKey=${AIRKOREA_API_KEY}&numOfRows=100&pageNo=1`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.body?.items;
    if (!items || items.length === 0) return DEFAULT_AIR;

    let pm10Grade = '보통';
    let pm25Grade = '보통';
    for (const item of items) {
      if (item.informData !== tomorrowDateStr || !item.informGrade) continue;
      const grade = parseFcstGrade(item.informGrade, sido);
      if (!grade) continue;
      if (item.informCode === 'PM10') pm10Grade = grade;
      if (item.informCode === 'PM25') pm25Grade = grade;
    }

    const gradeOrder = ['좋음', '보통', '나쁨', '매우나쁨'];
    const worstIdx = Math.max(gradeOrder.indexOf(pm10Grade), gradeOrder.indexOf(pm25Grade));
    return {
      dust: gradeOrder[worstIdx >= 0 ? worstIdx : 1],
      pm10: fcstGradeToNum(pm10Grade, 'pm10'),
      pm25: fcstGradeToNum(pm25Grade, 'pm25'),
    };
  } catch {
    return DEFAULT_AIR;
  }
}

// ── 오늘 날씨 (서버사이드) ──
export async function fetchWeatherServer(lat: number, lon: number): Promise<WeatherData | null> {
  const geoPromise = reverseGeocode(lat, lon);

  if (!WEATHER_API_KEY) {
    const geo = await geoPromise;
    const air = await fetchAirQuality(geo.sido);
    return {
      temp: 18, tempMin: 12, tempMax: 22, feelsLike: 16,
      description: '맑음', icon: '01d', ...air, rainChance: 10,
      locationName: geo.displayName || '서울',
    };
  }

  try {
    const { nx, ny } = latLonToGrid(lat, lon);
    const kst = getKstNow();
    const ncstBase = getUltraSrtNcstBase(kst);
    const fcstBase = getVilageFcstBase(kst);
    const todayStr = kstDateStr(kst);

    const [ncstRes, fcstRes, geo] = await Promise.all([
      fetch(`${KMA_BASE}/getUltraSrtNcst?pageNo=1&numOfRows=10&dataType=JSON&base_date=${ncstBase.baseDate}&base_time=${ncstBase.baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      fetch(`${KMA_BASE}/getVilageFcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date=${fcstBase.baseDate}&base_time=${fcstBase.baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      geoPromise,
    ]);

    const airPromise = fetchAirQuality(geo.sido);

    console.log('[today] KMA ncst status:', ncstRes.status, 'fcst status:', fcstRes.status);
    const ncstJson = await ncstRes.json();
    const ncstItems = parseKmaItems(ncstJson);
    if (ncstItems.length === 0) {
      console.error('[today] No ncst items. Response:', JSON.stringify(ncstJson).slice(0, 300));
    }
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

    const allItems = parseKmaItems(await fcstRes.json());
    const todayItems = allItems.filter((i) => i.fcstDate === todayStr);

    const temps = todayItems.filter((i) => i.category === 'TMP').map((i) => parseFloat(i.fcstValue || '0'));
    const tmn = allItems.find((i) => i.category === 'TMN' && i.fcstDate === todayStr);
    const tmx = allItems.find((i) => i.category === 'TMX' && i.fcstDate === todayStr);
    const allTemps = [currentTemp, ...temps];
    if (tmn) allTemps.push(parseFloat(tmn.fcstValue || '0'));
    if (tmx) allTemps.push(parseFloat(tmx.fcstValue || '0'));

    const tempMin = Math.round(Math.min(...allTemps));
    const tempMax = Math.round(Math.max(...allTemps));

    const pops = todayItems.filter((i) => i.category === 'POP').map((i) => parseInt(i.fcstValue || '0'));
    const rainChance = pops.length > 0 ? Math.max(...pops) : 0;

    const currentTimeStr = String(kst.getUTCHours()).padStart(2, '0') + '00';
    const sky = parseInt(findClosestValue(todayItems, 'SKY', currentTimeStr) || '1');
    const isNight = kst.getUTCHours() >= 18 || kst.getUTCHours() < 6;

    const air = await airPromise;

    return {
      temp: Math.round(currentTemp),
      tempMin, tempMax,
      feelsLike: calcFeelsLike(currentTemp, currentWsd, currentReh),
      description: kmaToDescription(sky, currentPty),
      icon: kmaToIcon(sky, currentPty, isNight),
      ...air,
      rainChance,
      locationName: geo.displayName || '',
    };
  } catch (e) {
    console.error('[fetchWeatherServer] error:', e);
    return null;
  }
}

// ── 내일 날씨 (서버사이드) ──
export async function fetchTomorrowWeatherServer(lat: number, lon: number): Promise<WeatherData | null> {
  const geoPromise = reverseGeocode(lat, lon);

  if (!WEATHER_API_KEY) {
    const geo = await geoPromise;
    const air = await fetchAirQualityForecast(geo.sido, '');
    return {
      temp: 17, tempMin: 11, tempMax: 21, feelsLike: 15,
      description: '맑음', icon: '01d', ...air, rainChance: 5,
      locationName: geo.displayName || '서울',
    };
  }

  try {
    const { nx, ny } = latLonToGrid(lat, lon);
    const kst = getKstNow();
    const { baseDate, baseTime } = getVilageFcstBase(kst);

    const kstTomorrow = new Date(kst);
    kstTomorrow.setUTCDate(kstTomorrow.getUTCDate() + 1);
    const tomorrowStr = kstDateStr(kstTomorrow);
    const tomorrowDash = `${tomorrowStr.slice(0, 4)}-${tomorrowStr.slice(4, 6)}-${tomorrowStr.slice(6, 8)}`;
    const currentTimeStr = String(kst.getUTCHours()).padStart(2, '0') + '00';

    const [fcstRes, geo] = await Promise.all([
      fetch(`${KMA_BASE}/getVilageFcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}&authKey=${WEATHER_API_KEY}`),
      geoPromise,
    ]);

    const airPromise = fetchAirQualityForecast(geo.sido, tomorrowDash);

    const fcstJson = await fcstRes.json();
    console.log('[tomorrow] KMA status:', fcstRes.status, 'baseDate:', baseDate, 'baseTime:', baseTime, 'tomorrowStr:', tomorrowStr);
    const allItems = parseKmaItems(fcstJson);
    const tomorrowItems = allItems.filter((i) => i.fcstDate === tomorrowStr);

    console.log('[tomorrow] allItems:', allItems.length, 'tomorrowItems:', tomorrowItems.length);
    if (tomorrowItems.length === 0) {
      console.error('[tomorrow] No data for tomorrow. fcstRes status:', fcstRes.status, 'sample:', JSON.stringify(fcstJson).slice(0, 300));
      return null;
    }

    const temps = tomorrowItems.filter((i) => i.category === 'TMP').map((i) => parseFloat(i.fcstValue || '0'));
    const tmn = allItems.find((i) => i.category === 'TMN' && i.fcstDate === tomorrowStr);
    const tmx = allItems.find((i) => i.category === 'TMX' && i.fcstDate === tomorrowStr);
    const allTemps = [...temps];
    if (tmn) allTemps.push(parseFloat(tmn.fcstValue || '0'));
    if (tmx) allTemps.push(parseFloat(tmx.fcstValue || '0'));

    if (allTemps.length === 0) return null;

    const tempMin = Math.round(Math.min(...allTemps));
    const tempMax = Math.round(Math.max(...allTemps));

    const repTempStr = findClosestValue(tomorrowItems, 'TMP', currentTimeStr);
    const repTemp = repTempStr ? parseFloat(repTempStr) : allTemps[0];

    const sky = parseInt(findClosestValue(tomorrowItems, 'SKY', currentTimeStr) || '1');
    const pty = parseInt(findClosestValue(tomorrowItems, 'PTY', currentTimeStr) || '0');
    const wsd = parseFloat(findClosestValue(tomorrowItems, 'WSD', currentTimeStr) || '0');
    const reh = parseFloat(findClosestValue(tomorrowItems, 'REH', currentTimeStr) || '50');

    const pops = tomorrowItems.filter((i) => i.category === 'POP').map((i) => parseInt(i.fcstValue || '0'));
    const rainChance = pops.length > 0 ? Math.max(...pops) : 0;

    const isNight = kst.getUTCHours() >= 18 || kst.getUTCHours() < 6;
    const air = await airPromise;

    return {
      temp: Math.round(repTemp),
      tempMin, tempMax,
      feelsLike: calcFeelsLike(repTemp, wsd, reh),
      description: kmaToDescription(sky, pty),
      icon: kmaToIcon(sky, pty, isNight),
      ...air,
      rainChance,
      locationName: geo.displayName || '',
    };
  } catch (e) {
    console.error('[fetchTomorrowWeatherServer] error:', e);
    return null;
  }
}
