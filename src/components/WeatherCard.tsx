'use client';

import { CloudSun, Thermometer, Wind } from 'lucide-react';
import { WeatherData } from '@/types';

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeatherCard({ weather, loading }: WeatherCardProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const dayStr = `${DAY_NAMES[now.getDay()]}요일`;

  const dustColor = (dust: string) => {
    switch (dust) {
      case '좋음': return 'text-blue-500';
      case '보통': return 'text-green-500';
      case '나쁨': return 'text-orange-500';
      case '매우나쁨':
      case '위험': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-3">
        <CloudSun className="w-5 h-5 text-blue-400" />
        <h3 className="card-title text-blue-600">날짜 / 날씨</h3>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-bold text-gray-800">{dateStr}</p>
        <p className="text-sm text-gray-500">{dayStr}</p>

        {loading ? (
          <div className="animate-pulse space-y-2 mt-3">
            <div className="h-4 bg-blue-100 rounded w-3/4" />
            <div className="h-4 bg-blue-100 rounded w-1/2" />
          </div>
        ) : weather ? (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-700">
                온도: <strong className="text-orange-500">{weather.temp}°C</strong>
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              {weather.description}
            </p>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-700">
                미세먼지: <strong className={dustColor(weather.dust)}>{weather.dust}</strong>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-3">날씨 정보를 불러올 수 없어요</p>
        )}
      </div>
    </div>
  );
}
