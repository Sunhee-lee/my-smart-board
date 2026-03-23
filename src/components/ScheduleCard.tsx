'use client';

import { GraduationCap, Clock } from 'lucide-react';
import { DaySchedule } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface ScheduleCardProps {
  weeklySchedule: Record<string, DaySchedule>;
  todayDay: string;
  theme: ThemeConfig;
}

const DAYS = ['월', '화', '수', '목', '금'];

function formatTime(h: string, m: string) {
  return `${h}:${m}`;
}

export default function ScheduleCard({ weeklySchedule, todayDay, theme }: ScheduleCardProps) {
  const todayAcademies = weeklySchedule[todayDay]?.academies || [];
  const hasAnySchedule = DAYS.some((d) => (weeklySchedule[d]?.academies?.length || 0) > 0);

  return (
    <div className={`card ${theme.card3}`}>
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className={`w-5 h-5 ${theme.card3Icon}`} />
        <h3 className={`card-title ${theme.card3Title}`}>학원 / 방과후</h3>
      </div>

      {/* 오늘 스케줄 */}
      {todayAcademies.length > 0 ? (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-gray-500">오늘 ({todayDay}요일)</p>
          {todayAcademies.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-gray-700">{item.name || '(미입력)'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${theme.card3Accent} flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                {formatTime(item.startHour, item.startMin)} ~ {formatTime(item.endHour, item.endMin)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-3">
          오늘은 학원이 없어요! 자유 시간!
        </p>
      )}

      {/* 주간 미니 스케줄러 */}
      {hasAnySchedule && (
        <div className="border-t border-gray-100 pt-2">
          <p className="text-[10px] text-gray-400 mb-1.5">이번 주</p>
          <div className="grid grid-cols-5 gap-1">
            {DAYS.map((day) => {
              const academies = weeklySchedule[day]?.academies || [];
              const isToday = day === todayDay;
              return (
                <div
                  key={day}
                  className={`rounded-lg p-1 text-center ${
                    isToday ? 'bg-white/80 ring-1 ring-gray-200' : 'bg-white/40'
                  }`}
                >
                  <p className={`text-[10px] font-bold mb-0.5 ${isToday ? 'text-gray-700' : 'text-gray-400'}`}>
                    {day}
                  </p>
                  {academies.length > 0 ? (
                    academies.slice(0, 2).map((a, i) => (
                      <p key={i} className="text-[9px] text-gray-500 truncate">{a.name || '-'}</p>
                    ))
                  ) : (
                    <p className="text-[9px] text-gray-300">-</p>
                  )}
                  {academies.length > 2 && (
                    <p className="text-[8px] text-gray-300">+{academies.length - 2}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
