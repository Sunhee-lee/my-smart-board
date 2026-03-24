import { NextRequest, NextResponse } from 'next/server';
import { fetchTomorrowWeatherServer } from '@/lib/weather-server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '37.5665');
  const lon = parseFloat(searchParams.get('lon') || '126.978');

  const data = await fetchTomorrowWeatherServer(lat, lon);
  if (!data) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
  return NextResponse.json(data);
}
