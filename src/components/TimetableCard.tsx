'use client';

import { BookOpen } from 'lucide-react';
import { TimetableItem } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface TimetableCardProps {
  timetable: TimetableItem[];
  loading: boolean;
  hasSchool: boolean;
  theme: ThemeConfig;
  grade: string;
  classNum: string;
}

const PERIOD_COLORS = [
  'bg-pink-100 text-pink-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
  'bg-teal-100 text-teal-600',
];

export default function TimetableCard({ timetable, loading, hasSchool, theme, grade, classNum }: TimetableCardProps) {
  const title = hasSchool ? `${grade}학년 ${classNum}반 오늘의 시간표` : '오늘의 시간표';

  return (
    <div className={`card ${theme.card5}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-5 h-5 ${theme.card5Icon}`} />
        <h3 className={`card-title ${theme.card5Title}`}>{title}</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-8 ${theme.skeleton3} rounded`} />
          ))}
        </div>
      ) : timetable.length > 0 ? (
        <div className="space-y-1.5">
          {timetable.map((item, i) => (
            <div
              key={item.period}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${PERIOD_COLORS[i % PERIOD_COLORS.length]}`}
            >
              <span className="font-bold text-sm min-w-[3.5rem] whitespace-nowrap">{item.period}교시</span>
              <span className="text-sm font-medium">{item.subject}</span>
            </div>
          ))}
        </div>
      ) : !hasSchool ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <BookOpen className={`w-8 h-8 ${theme.card5Icon} opacity-30`} />
          <p className="text-sm text-gray-400">설정에서 학교를 등록해주세요</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">오늘은 시간표 정보가 없어요.</p>
      )}
    </div>
  );
}
