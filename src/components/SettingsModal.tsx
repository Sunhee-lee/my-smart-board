'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, School, Loader2, GraduationCap, Palette, RotateCcw } from 'lucide-react';
import { Settings, DEFAULT_SETTINGS, ThemeColor, DaySchedule } from '@/types';
import { saveSettings } from '@/lib/storage';
import { searchSchool } from '@/lib/api';
import { THEMES, ThemeConfig } from '@/lib/theme';
import AcademyScheduleModal from './AcademyScheduleModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  theme: ThemeConfig;
}

const DAYS = ['월', '화', '수', '목', '금'] as const;
const THEME_OPTIONS: ThemeColor[] = ['pink', 'yellow', 'sky', 'green', 'mono'];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  theme,
}: SettingsModalProps) {
  const [form, setForm] = useState<Settings>(settings);
  const [activeDay, setActiveDay] = useState<string>('월');
  const [schoolResults, setSchoolResults] = useState<
    { schoolCode: string; eduOfficeCode: string; schoolFullName: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [academyModalOpen, setAcademyModalOpen] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchSchool(searchQuery);
    setSchoolResults(results);
    setSearching(false);
  };

  const selectSchool = (school: {
    schoolCode: string;
    eduOfficeCode: string;
    schoolFullName: string;
  }) => {
    setForm({
      ...form,
      schoolName: school.schoolFullName,
      schoolCode: school.schoolCode,
      eduOfficeCode: school.eduOfficeCode,
    });
    setSchoolResults([]);
    setSearchQuery('');
  };

  const handleSave = () => {
    saveSettings(form);
    onSave(form);
    onClose();
  };

  const handleAcademySave = (schedule: Record<string, DaySchedule>) => {
    setForm({ ...form, weeklySchedule: schedule });
  };

  const addSupply = () => {
    const schedule = { ...form.weeklySchedule };
    const day = schedule[activeDay];
    schedule[activeDay] = {
      ...day,
      supplies: [...day.supplies, ''],
    };
    setForm({ ...form, weeklySchedule: schedule });
  };

  const updateSupply = (index: number, value: string) => {
    const schedule = { ...form.weeklySchedule };
    const day = { ...schedule[activeDay] };
    const supplies = [...day.supplies];
    supplies[index] = value;
    day.supplies = supplies;
    schedule[activeDay] = day;
    setForm({ ...form, weeklySchedule: schedule });
  };

  const removeSupply = (index: number) => {
    const schedule = { ...form.weeklySchedule };
    const day = { ...schedule[activeDay] };
    day.supplies = day.supplies.filter((_, i) => i !== index);
    schedule[activeDay] = day;
    setForm({ ...form, weeklySchedule: schedule });
  };

  const currentDay = form.weeklySchedule[activeDay] || DEFAULT_SETTINGS.weeklySchedule['월'];

  // 학원 스케줄 요약
  const totalAcademies = DAYS.reduce(
    (sum, day) => sum + (form.weeklySchedule[day]?.academies?.length || 0),
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">설정</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* 테마 선택 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <Palette className="w-4 h-4" /> 테마 색상
              </h3>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, theme: t })}
                    className={`flex-1 rounded-xl p-3 text-center transition-all border-2 ${
                      form.theme === t
                        ? 'border-gray-400 shadow-sm scale-105'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-full h-6 rounded-lg mb-1.5 ${THEMES[t].preview}`} />
                    <p className="text-[11px] font-medium text-gray-600">{THEMES[t].name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">기본 정보</h3>
              <div>
                <label className="settings-label">아이 이름</label>
                <input
                  type="text"
                  value={form.childName}
                  onChange={(e) => setForm({ ...form, childName: e.target.value })}
                  placeholder="이름을 입력하세요"
                  className="settings-input"
                />
              </div>

              {/* 학교 검색 */}
              <div>
                <label className="settings-label">학교 검색</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="학교 이름을 입력하세요"
                    className="settings-input flex-1"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className={`px-3 py-2 ${theme.primary} text-white rounded-xl ${theme.primaryHover} transition-colors disabled:opacity-50 flex items-center justify-center min-w-[40px]`}
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {schoolResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                    {schoolResults.slice(0, 5).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selectSchool(s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                      >
                        <School className="w-4 h-4 text-gray-400" />
                        {s.schoolFullName}
                      </button>
                    ))}
                  </div>
                )}

                {form.schoolName && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    선택된 학교: <strong>{form.schoolName}</strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="settings-label">학년</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="settings-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>{g}학년</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="settings-label">반</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.classNum}
                    onChange={(e) => setForm({ ...form, classNum: e.target.value })}
                    className="settings-input"
                  />
                </div>
              </div>
            </div>

            {/* 학원/방과후 스케줄 - 새 창 열기 버튼 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                학원 / 방과후
              </h3>
              <button
                onClick={() => setAcademyModalOpen(true)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors bg-gray-50 hover:bg-gray-100`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    스케줄 관리 열기
                  </span>
                </div>
                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
                  {totalAcademies}개 등록됨
                </span>
              </button>
              {/* 미니 요약 */}
              {totalAcademies > 0 && (
                <div className="grid grid-cols-5 gap-1">
                  {DAYS.map((day) => {
                    const count = form.weeklySchedule[day]?.academies?.length || 0;
                    return (
                      <div key={day} className="text-center bg-gray-50 rounded-lg py-1.5">
                        <p className="text-[10px] font-bold text-gray-400">{day}</p>
                        <p className="text-xs text-gray-600">{count > 0 ? `${count}개` : '-'}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 요일별 준비물 관리 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                요일별 준비물
              </h3>

              {/* 요일 탭 */}
              <div className="flex gap-1">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeDay === day
                        ? `${theme.tabActive} shadow-sm`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* 준비물 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="settings-label mb-0">{activeDay}요일 준비물</label>
                  <button
                    onClick={addSupply}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {currentDay.supplies.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">등록된 준비물이 없어요</p>
                  )}
                  {currentDay.supplies.map((supply, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={supply}
                        onChange={(e) => updateSupply(i, e.target.value)}
                        placeholder="준비물 이름"
                        className="settings-input flex-1 !py-1.5 text-sm"
                      />
                      <button
                        onClick={() => removeSupply(i)}
                        className="text-red-300 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 저장 / 초기화 버튼 */}
          <div className="p-5 border-t border-gray-100 space-y-2">
            <button
              onClick={handleSave}
              className={`w-full py-3 ${theme.primary} text-white rounded-xl font-semibold ${theme.primaryHover} transition-colors shadow-sm`}
            >
              저장하기
            </button>
            <button
              onClick={() => {
                if (window.confirm('모든 설정을 초기화할까요? 저장된 데이터가 모두 삭제됩니다.')) {
                  setForm(DEFAULT_SETTINGS);
                  saveSettings(DEFAULT_SETTINGS);
                  onSave(DEFAULT_SETTINGS);
                  onClose();
                }
              }}
              className="w-full py-2.5 border border-red-200 text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              설정 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 학원 스케줄 관리 모달 */}
      <AcademyScheduleModal
        isOpen={academyModalOpen}
        onClose={() => setAcademyModalOpen(false)}
        weeklySchedule={form.weeklySchedule}
        onSave={handleAcademySave}
        theme={theme}
      />
    </>
  );
}
