'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, GraduationCap } from 'lucide-react';
import { AcademyItem, DaySchedule } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface AcademyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklySchedule: Record<string, DaySchedule>;
  onSave: (schedule: Record<string, DaySchedule>) => void;
  theme: ThemeConfig;
}

const DAYS = ['월', '화', '수', '목', '금'] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function formatTime(h: string, m: string) {
  return `${h}:${m}`;
}

export default function AcademyScheduleModal({
  isOpen,
  onClose,
  weeklySchedule,
  onSave,
  theme,
}: AcademyScheduleModalProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(weeklySchedule);
  const [activeDay, setActiveDay] = useState<string>('월');

  useEffect(() => {
    setSchedule(weeklySchedule);
  }, [weeklySchedule]);

  if (!isOpen) return null;

  const currentDay = schedule[activeDay] || { academies: [], supplies: [] };

  const addAcademy = () => {
    const updated = { ...schedule };
    updated[activeDay] = {
      ...currentDay,
      academies: [
        ...currentDay.academies,
        { name: '', startHour: '15', startMin: '00', endHour: '16', endMin: '00' },
      ],
    };
    setSchedule(updated);
  };

  const updateAcademy = (index: number, field: keyof AcademyItem, value: string) => {
    const updated = { ...schedule };
    const day = { ...updated[activeDay] };
    const academies = [...day.academies];
    academies[index] = { ...academies[index], [field]: value };
    day.academies = academies;
    updated[activeDay] = day;
    setSchedule(updated);
  };

  const removeAcademy = (index: number) => {
    const updated = { ...schedule };
    const day = { ...updated[activeDay] };
    day.academies = day.academies.filter((_, i) => i !== index);
    updated[activeDay] = day;
    setSchedule(updated);
  };

  const handleSave = () => {
    onSave(schedule);
    onClose();
  };

  // 전체 요일 미리보기 데이터
  const allDaysPreview = DAYS.map((day) => ({
    day,
    academies: schedule[day]?.academies || [],
  }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">학원 / 방과후 스케줄 관리</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 요일 탭 */}
          <div className="flex gap-1.5">
            {DAYS.map((day) => {
              const count = schedule[day]?.academies?.length || 0;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    activeDay === day
                      ? `${theme.tabActive} shadow-sm`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {day}
                  {count > 0 && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      activeDay === day ? 'bg-white text-gray-700' : `${theme.primary} text-white`
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 선택된 요일 편집 영역 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-600">
                {activeDay}요일 스케줄
              </h3>
              <button
                onClick={addAcademy}
                className={`text-xs ${theme.primary} text-white px-3 py-1.5 rounded-lg ${theme.primaryHover} transition-colors flex items-center gap-1`}
              >
                <Plus className="w-3.5 h-3.5" /> 추가
              </button>
            </div>

            {currentDay.academies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">등록된 스케줄이 없어요</p>
                <p className="text-xs mt-1">위의 추가 버튼을 눌러 스케줄을 등록해 보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDay.academies.map((academy, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100"
                  >
                    {/* 학원 이름 */}
                    <input
                      type="text"
                      value={academy.name}
                      onChange={(e) => updateAcademy(i, 'name', e.target.value)}
                      placeholder="학원/방과후 이름을 입력하세요"
                      className="settings-input !bg-white"
                    />

                    {/* 시간 설정 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 min-w-fit">시작</span>
                      </div>
                      <select
                        value={academy.startHour}
                        onChange={(e) => updateAcademy(i, 'startHour', e.target.value)}
                        className="settings-input !w-16 !py-1.5 text-sm text-center"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}시</option>
                        ))}
                      </select>
                      <select
                        value={academy.startMin}
                        onChange={(e) => updateAcademy(i, 'startMin', e.target.value)}
                        className="settings-input !w-16 !py-1.5 text-sm text-center"
                      >
                        {MINS.map((m) => (
                          <option key={m} value={m}>{m}분</option>
                        ))}
                      </select>

                      <span className="text-gray-300 mx-1">~</span>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 min-w-fit">종료</span>
                      </div>
                      <select
                        value={academy.endHour}
                        onChange={(e) => updateAcademy(i, 'endHour', e.target.value)}
                        className="settings-input !w-16 !py-1.5 text-sm text-center"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}시</option>
                        ))}
                      </select>
                      <select
                        value={academy.endMin}
                        onChange={(e) => updateAcademy(i, 'endMin', e.target.value)}
                        className="settings-input !w-16 !py-1.5 text-sm text-center"
                      >
                        {MINS.map((m) => (
                          <option key={m} value={m}>{m}분</option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeAcademy(i)}
                        className="ml-auto text-red-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 주간 미리보기 */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">주간 스케줄 미리보기</h3>
            <div className="grid grid-cols-5 gap-2">
              {allDaysPreview.map(({ day, academies }) => (
                <div
                  key={day}
                  className={`rounded-xl p-2 text-center border transition-colors ${
                    activeDay === day
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-500 mb-1.5">{day}</p>
                  {academies.length > 0 ? (
                    <div className="space-y-1">
                      {academies.map((a, i) => (
                        <div key={i} className="text-[10px] bg-gray-100 rounded px-1 py-0.5 truncate">
                          <p className="font-medium text-gray-700 truncate">{a.name || '(미입력)'}</p>
                          <p className="text-gray-400">
                            {formatTime(a.startHour, a.startMin)}-{formatTime(a.endHour, a.endMin)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-300">없음</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSave}
            className={`w-full py-3 ${theme.primary} text-white rounded-xl font-semibold ${theme.primaryHover} transition-colors shadow-sm`}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
