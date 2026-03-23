'use client';

import { CalendarDays } from 'lucide-react';
import { SchoolEvent } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface EventsCardProps {
  events: SchoolEvent[];
  loading: boolean;
  hasSchool: boolean;
  theme: ThemeConfig;
}

export default function EventsCard({ events, loading, hasSchool, theme }: EventsCardProps) {
  return (
    <div className={`card ${theme.card6}`}>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className={`w-5 h-5 ${theme.card6Icon}`} />
        <h3 className={`card-title ${theme.card6Title}`}>이번 주 학사일정</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-6 ${theme.skeleton4} rounded`} />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-1.5">
          {events.map((evt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2"
            >
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-fit ${theme.card6Icon} bg-white/80`}>
                {evt.date}
              </span>
              <span className="text-sm text-gray-700">{evt.title}</span>
            </div>
          ))}
        </div>
      ) : !hasSchool ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <CalendarDays className={`w-8 h-8 ${theme.card6Icon} opacity-30`} />
          <p className="text-sm text-gray-400">설정에서 학교를 등록해주세요</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">이번 주 학사일정이 없어요.</p>
      )}
    </div>
  );
}
