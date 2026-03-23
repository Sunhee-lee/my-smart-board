'use client';

import { CloudSun, Thermometer, Wind, Sun, CloudRain, CloudSnow, Cloud, CloudLightning, CloudDrizzle, Shirt, Droplets } from 'lucide-react';
import { WeatherData } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  theme: ThemeConfig;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getWeatherEmoji(icon: string): string {
  if (!icon) return '🌤';
  const code = icon.slice(0, 2);
  const isNight = icon.endsWith('n');
  switch (code) {
    case '01': return isNight ? '🌙' : '🌞';
    case '02': return '🌤';
    case '03': return '☁';
    case '04': return '☁';
    case '09': return '🌧';
    case '10': return '🌧';
    case '11': return '🌩';
    case '13': return '☃';
    case '50': return '🌁';
    default: return '🌤';
  }
}

function getWeatherIcon(icon: string) {
  if (!icon) return <CloudSun className="w-5 h-5 text-sky-400" />;
  const code = icon.slice(0, 2);
  switch (code) {
    case '01': return <Sun className="w-5 h-5 text-amber-400" />;
    case '02': return <CloudSun className="w-5 h-5 text-sky-400" />;
    case '03':
    case '04': return <Cloud className="w-5 h-5 text-gray-400" />;
    case '09': return <CloudDrizzle className="w-5 h-5 text-blue-400" />;
    case '10': return <CloudRain className="w-5 h-5 text-blue-500" />;
    case '11': return <CloudLightning className="w-5 h-5 text-purple-500" />;
    case '13': return <CloudSnow className="w-5 h-5 text-indigo-300" />;
    default: return <Cloud className="w-5 h-5 text-gray-400" />;
  }
}

function getClothingRecommendation(temp: number, icon: string, dust: string): string {
  const code = icon?.slice(0, 2) || '';
  const isRain = ['09', '10', '11'].includes(code);
  const isSnow = code === '13';

  let clothing = '';

  if (temp >= 28) {
    clothing = '반팔, 반바지, 얇은 원피스가 좋아요!';
  } else if (temp >= 23) {
    clothing = '반팔에 얇은 긴바지가 딱이야!';
  } else if (temp >= 17) {
    clothing = '얇은 가디건이나 긴팔을 챙겨!';
  } else if (temp >= 12) {
    clothing = '자켓이나 니트를 입으면 좋겠어!';
  } else if (temp >= 6) {
    clothing = '따뜻한 코트랑 목도리를 챙겨!';
  } else {
    clothing = '패딩, 장갑, 목도리 꼭 챙기자!';
  }

  if (isRain) clothing += ' 우산 필수!';
  if (isSnow) clothing += ' 장화랑 우산도 챙겨!';
  if (dust === '나쁨' || dust === '매우나쁨' || dust === '위험') {
    clothing += ' 마스크 꼭 쓰자!';
  }

  return clothing;
}

function dustColor(dust: string) {
  switch (dust) {
    case '좋음': return 'text-blue-500';
    case '보통': return 'text-green-500';
    case '나쁨': return 'text-orange-500';
    case '매우나쁨':
    case '위험': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

function dustBadgeColor(value: number, type: 'pm10' | 'pm25') {
  if (type === 'pm10') {
    if (value <= 30) return 'bg-blue-100 text-blue-600';
    if (value <= 80) return 'bg-green-100 text-green-600';
    if (value <= 150) return 'bg-orange-100 text-orange-600';
    return 'bg-red-100 text-red-600';
  }
  if (value <= 15) return 'bg-blue-100 text-blue-600';
  if (value <= 35) return 'bg-green-100 text-green-600';
  if (value <= 75) return 'bg-orange-100 text-orange-600';
  return 'bg-red-100 text-red-600';
}

export default function WeatherCard({ weather, loading, theme }: WeatherCardProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${DAY_NAMES[now.getDay()]}요일`;

  return (
    <div className={`card ${theme.card1}`}>
      <div className="flex items-center gap-2 mb-3">
        {weather ? getWeatherIcon(weather.icon) : <CloudSun className={`w-5 h-5 ${theme.card1Icon}`} />}
        <h3 className={`card-title ${theme.card1Title}`}>오늘의 날씨</h3>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-bold text-gray-800">{dateStr}</p>

        {loading ? (
          <div className="animate-pulse space-y-2 mt-3">
            <div className={`h-4 ${theme.skeleton1} rounded w-3/4`} />
            <div className={`h-4 ${theme.skeleton1} rounded w-1/2`} />
          </div>
        ) : weather ? (
          <div className="mt-2 space-y-2">
            {/* 기온 + 날씨 상태 */}
            <p className="font-title text-xl text-gray-800">
              {weather.temp}°C, {weather.description} {getWeatherEmoji(weather.icon)}
            </p>

            {/* 최고최저 + 체감온도 */}
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-700">
                <span className="text-red-400">▲{weather.tempMax}°</span>
                <span className="text-blue-400 ml-1">▼{weather.tempMin}°</span>
                <span className="text-gray-400 mx-1.5">|</span>
                체감온도: <strong className="text-orange-400">{weather.feelsLike}°</strong>
              </span>
            </div>

            {/* 대기질 + 미세먼지 수치 한 줄 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Wind className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-700">
                대기질 <strong className={dustColor(weather.dust)}>{weather.dust}</strong>
              </span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${dustBadgeColor(weather.pm10, 'pm10')}`}>
                미세 {weather.pm10}
              </span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${dustBadgeColor(weather.pm25, 'pm25')}`}>
                초미세 {weather.pm25}
              </span>
            </div>

            {/* 강수확률 */}
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-700">
                강수확률 <strong className={weather.rainChance >= 60 ? 'text-blue-500' : weather.rainChance >= 30 ? 'text-sky-500' : 'text-gray-500'}>{weather.rainChance}%</strong>
              </span>
            </div>

            {/* 옷 추천 */}
            <div className="mt-1 bg-white/50 rounded-lg px-3 py-2 flex items-start gap-2">
              <Shirt className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">오늘은 이렇게 입어봐!</p>
                <p className="text-xs text-gray-700">
                  {getClothingRecommendation(weather.temp, weather.icon, weather.dust)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-3">날씨 정보를 불러올 수 없어요</p>
        )}
      </div>
    </div>
  );
}
