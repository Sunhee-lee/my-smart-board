'use client';

import { BookOpen } from 'lucide-react';
import { TimetableItem } from '@/types';

interface TimetableCardProps {
  timetable: TimetableItem[];
  loading: boolean;
  hasSchool: boolean;
}

const PERIOD_COLORS = [
  'bg-pink-100 text-pink-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
  'bg-teal-100 text-teal-600',
];

export default function TimetableCard({ timetable, loading, hasSchool }: TimetableCardProps) {
  return (
    <div className="card bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-pink-400" />
        <h3 className="card-title text-pink-600">오늘 시간표</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-pink-100 rounded" />
          ))}
        </div>
      ) : timetable.length > 0 ? (
        <div className="space-y-1.5">
          {timetable.map((item, i) => (
            <div
              key={item.period}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${PERIOD_COLORS[i % PERIOD_COLORS.length]}`}
            >
              <span className="font-bold text-sm w-8">{item.period}교시</span>
              <span className="text-sm font-medium">{item.subject}</span>
            </div>
          ))}
        </div>
      ) : !hasSchool ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <BookOpen className="w-8 h-8 text-pink-200" />
          <p className="text-sm text-gray-400">
            설정에서 학교를 등록해주세요
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          오늘은 시간표 정보가 없어요.
        </p>
      )}
    </div>
  );
}
