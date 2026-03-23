'use client';

import { useEffect, useState } from 'react';
import { X, Users, Calendar, BarChart3, Monitor } from 'lucide-react';

interface VisitorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatsData {
  daily: Record<string, number>;
  totalVisits: number;
  totalDevices: number;
}

// 기기 고유 ID (localStorage에 저장)
function getDeviceId(): string {
  const DEVICE_KEY = 'smart-board-device-id';
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// 서버에 방문 기록
export async function recordUniqueVisit(): Promise<boolean> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.isNewDevice;
  } catch {
    return false;
  }
}

function getLast7Days(daily: Record<string, number>): { date: string; label: string; count: number }[] {
  const days = [];
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = DAY_NAMES[d.getDay()];
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    days.push({
      date: dateStr,
      label: `${mm}/${dd}(${dayName})`,
      count: daily[dateStr] || 0,
    });
  }
  return days;
}

export default function VisitorStatsModal({ isOpen, onClose }: VisitorStatsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/visitors')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const last7 = stats ? getLast7Days(stats.daily) : [];
  const weekTotal = last7.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...last7.map((d) => d.count), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-700">방문 통계</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!stats ? (
            <div className="text-center text-sm text-gray-400 py-4">불러오는 중...</div>
          ) : (
            <>
              {/* 요약 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] text-blue-500 font-medium">이번 주</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{weekTotal}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] text-purple-500 font-medium">전체 방문</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalVisits}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] text-green-500 font-medium">기기 수</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.totalDevices}</p>
                </div>
              </div>

              {/* 7일 차트 */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 mb-2">최근 7일</p>
                <div className="flex items-end gap-1.5 h-24">
                  {last7.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-600">
                        {day.count > 0 ? day.count : ''}
                      </span>
                      <div
                        className="w-full bg-blue-300 rounded-t transition-all"
                        style={{
                          height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 2)}%`,
                          opacity: day.count > 0 ? 1 : 0.2,
                        }}
                      />
                      <span className="text-[9px] text-gray-400 leading-tight text-center">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
