import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const AIRKOREA_API_KEY = process.env.NEXT_PUBLIC_AIRKOREA_API_KEY || '';
const KMA_BASE = 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0';

function getKstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '37.5665');
  const lon = parseFloat(searchParams.get('lon') || '126.978');

  const kst = getKstNow();
  const results: Record<string, unknown> = {
    kstTime: kst.toISOString(),
    weatherKeySet: !!WEATHER_API_KEY,
    airkoreaKeySet: !!AIRKOREA_API_KEY,
    lat, lon,
  };

  // Test KMA 초단기실황
  try {
    const h = kst.getUTCHours();
    const m = kst.getUTCMinutes();
    let ncstH = m < 40 ? h - 1 : h;
    const ncstDate = new Date(kst);
    if (ncstH < 0) { ncstH = 23; ncstDate.setUTCDate(ncstDate.getUTCDate() - 1); }
    const baseDate = ncstDate.toISOString().slice(0, 10).replace(/-/g, '');
    const baseTime = String(ncstH).padStart(2, '0') + '00';

    const url = `${KMA_BASE}/getUltraSrtNcst?pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=57&ny=126&authKey=${WEATHER_API_KEY}`;
    results.ncstUrl = url;
    const res = await fetch(url);
    results.ncstStatus = res.status;
    const text = await res.text();
    results.ncstResponse = text.slice(0, 500);
  } catch (e) {
    results.ncstError = String(e);
  }

  // Test KMA 단기예보
  try {
    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let h = kst.getUTCHours();
    const m = kst.getUTCMinutes();
    if (m < 10) h -= 1;
    let baseHour = 23;
    if (h >= baseTimes[0]) {
      for (const bt of baseTimes) { if (h >= bt) baseHour = bt; }
    }
    const baseDate = kst.toISOString().slice(0, 10).replace(/-/g, '');
    const baseTime = String(baseHour).padStart(2, '0') + '00';

    const url = `${KMA_BASE}/getVilageFcst?pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=57&ny=126&authKey=${WEATHER_API_KEY}`;
    results.fcstUrl = url;
    const res = await fetch(url);
    results.fcstStatus = res.status;
    const text = await res.text();
    results.fcstResponse = text.slice(0, 500);
  } catch (e) {
    results.fcstError = String(e);
  }

  // Test AirKorea
  try {
    const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?sidoName=${encodeURIComponent('서울')}&pageNo=1&numOfRows=1&returnType=json&serviceKey=${AIRKOREA_API_KEY}&ver=1.5`;
    results.airUrl = url.replace(AIRKOREA_API_KEY, '***');
    const res = await fetch(url);
    results.airStatus = res.status;
    const text = await res.text();
    results.airResponse = text.slice(0, 500);
  } catch (e) {
    results.airError = String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
