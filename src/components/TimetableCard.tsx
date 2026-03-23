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

export default function TimetableCard({ timetable, loading, hasSchool, theme, grade, classNum }: TimetableCardProps) {
  const subtitle = hasSchool ? `(${grade}학년 ${classNum}반)` : '';

  return (
    <div className={`card ${theme.card2}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-5 h-5 ${theme.card2Icon}`} />
        <h3 className={`card-title ${theme.card2Title}`}>
          오늘의 시간표{subtitle && <span className="text-xs font-normal ml-1 opacity-70">{subtitle}</span>}
        </h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-8 ${theme.skeleton2} rounded`} />
          ))}
        </div>
      ) : timetable.length > 0 ? (
        <div className="space-y-1.5">
          {timetable.map((item) => (
            <div
              key={item.period}
              className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/60 border border-gray-100"
            >
              <span className="font-bold text-sm min-w-[3.5rem] whitespace-nowrap text-gray-500">{item.period}교시</span>
              <span className="text-sm font-medium text-gray-700">{item.subject}</span>
            </div>
          ))}
        </div>
      ) : !hasSchool ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <BookOpen className={`w-8 h-8 ${theme.card2Icon} opacity-30`} />
          <p className="text-sm text-gray-400">설정에서 학교를 등록해주세요</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">오늘은 시간표 정보가 없어요.</p>
      )}
    </div>
  );
}
