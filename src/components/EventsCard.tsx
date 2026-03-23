'use client';

import { CalendarDays } from 'lucide-react';
import { SchoolEvent } from '@/types';

interface EventsCardProps {
  events: SchoolEvent[];
  loading: boolean;
}

export default function EventsCard({ events, loading }: EventsCardProps) {
  return (
    <div className="card bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-5 h-5 text-violet-500" />
        <h3 className="card-title text-violet-600">이번 주 학사일정</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-violet-100 rounded" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-1.5">
          {events.map((evt, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2"
            >
              <span className="text-xs font-bold text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full min-w-fit">
                {evt.date}
              </span>
              <span className="text-sm text-gray-700">{evt.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          이번 주 학사일정이 없어요.
        </p>
      )}
    </div>
  );
}
