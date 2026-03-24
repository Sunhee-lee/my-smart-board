import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherServer } from '@/lib/weather-server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '37.5665');
  const lon = parseFloat(searchParams.get('lon') || '126.978');

  try {
    const data = await fetchWeatherServer(lat, lon);
    if (!data) {
      return NextResponse.json({ error: 'Weather data returned null', lat, lon }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e), lat, lon }, { status: 500 });
  }
}
