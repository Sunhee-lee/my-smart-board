'use client';

import { GraduationCap } from 'lucide-react';
import { AcademyItem } from '@/types';

interface ScheduleCardProps {
  academies: AcademyItem[];
}

export default function ScheduleCard({ academies }: ScheduleCardProps) {
  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="w-5 h-5 text-green-500" />
        <h3 className="card-title text-green-600">학원 / 방과후</h3>
      </div>

      {academies.length > 0 ? (
        <div className="space-y-2">
          {academies.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          오늘은 학원이 없어요! 자유 시간!
        </p>
      )}
    </div>
  );
}
