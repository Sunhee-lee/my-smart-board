'use client';

import { X, Users, Calendar, BarChart3 } from 'lucide-react';

interface VisitorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getVisitorStats() {
  const STATS_KEY = 'smart-board-visitor-stats';
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function recordVisit() {
  const STATS_KEY = 'smart-board-visitor-stats';
  const today = new Date().toISOString().slice(0, 10);
  const stats = getVisitorStats();
  stats[today] = (stats[today] || 0) + 1;

  // 최근 90일만 보관
  const keys = Object.keys(stats).sort();
  if (keys.length > 90) {
    for (const key of keys.slice(0, keys.length - 90)) {
      delete stats[key];
    }
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// 페이지 로드마다 방문 기록, 기기당 고유방문자는 1회만
export function recordUniqueVisit(): boolean {
  const DEVICE_KEY = 'smart-board-device-id';
  const isNewDevice = !localStorage.getItem(DEVICE_KEY);
  if (isNewDevice) {
    localStorage.setItem(DEVICE_KEY, crypto.randomUUID());
  }
  recordVisit();
  return isNewDevice;
}

function getLast7Days(): { date: string; label: string; count: number }[] {
  const stats = getVisitorStats();
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
      count: stats[dateStr] || 0,
    });
  }
  return days;
}

function getTotal(): number {
  const stats = getVisitorStats();
  return Object.values(stats).reduce((sum: number, v) => sum + (v as number), 0);
}

function getUniqueDeviceCount(): number {
  // 이 기기가 등록되어 있으면 1, 없으면 0
  return localStorage.getItem('smart-board-device-id') ? 1 : 0;
}

export default function VisitorStatsModal({ isOpen, onClose }: VisitorStatsModalProps) {
  if (!isOpen) return null;

  const last7 = getLast7Days();
  const total = getTotal();
  const uniqueDevices = getUniqueDeviceCount();
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
              <p className="text-2xl font-bold text-purple-600">{total}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] text-green-500 font-medium">이 기기</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{uniqueDevices}</p>
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
        </div>
      </div>
    </div>
  );
}
