'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, School } from 'lucide-react';
import { Settings, DEFAULT_SETTINGS, AcademyItem } from '@/types';
import { saveSettings } from '@/lib/storage';
import { searchSchool } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const DAYS = ['월', '화', '수', '목', '금'] as const;

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [form, setForm] = useState<Settings>(settings);
  const [activeDay, setActiveDay] = useState<string>('월');
  const [schoolResults, setSchoolResults] = useState<
    { schoolCode: string; eduOfficeCode: string; schoolFullName: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const addAcademy = () => {
    const schedule = { ...form.weeklySchedule };
    const day = schedule[activeDay];
    schedule[activeDay] = {
      ...day,
      academies: [...day.academies, { name: '', time: '' }],
    };
    setForm({ ...form, weeklySchedule: schedule });
  };

  const updateAcademy = (index: number, field: keyof AcademyItem, value: string) => {
    const schedule = { ...form.weeklySchedule };
    const day = { ...schedule[activeDay] };
    const academies = [...day.academies];
    academies[index] = { ...academies[index], [field]: value };
    day.academies = academies;
    schedule[activeDay] = day;
    setForm({ ...form, weeklySchedule: schedule });
  };

  const removeAcademy = (index: number) => {
    const schedule = { ...form.weeklySchedule };
    const day = { ...schedule[activeDay] };
    day.academies = day.academies.filter((_, i) => i !== index);
    schedule[activeDay] = day;
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

  return (
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
                  className="px-3 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {schoolResults.length > 0 && (
                <div className="mt-2 border border-purple-100 rounded-xl overflow-hidden">
                  {schoolResults.slice(0, 5).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSchool(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 flex items-center gap-2 border-b border-purple-50 last:border-0"
                    >
                      <School className="w-4 h-4 text-purple-400" />
                      {s.schoolFullName}
                    </button>
                  ))}
                </div>
              )}

              {form.schoolName && (
                <p className="mt-1.5 text-xs text-purple-500">
                  선택: {form.schoolName}
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

          {/* 요일별 관리 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              요일별 관리
            </h3>

            {/* 요일 탭 */}
            <div className="flex gap-1">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeDay === day
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* 학원 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="settings-label mb-0">학원 / 방과후</label>
                <button
                  onClick={addAcademy}
                  className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> 추가
                </button>
              </div>
              <div className="space-y-2">
                {currentDay.academies.map((academy, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={academy.name}
                      onChange={(e) => updateAcademy(i, 'name', e.target.value)}
                      placeholder="학원 이름"
                      className="settings-input flex-1 !py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={academy.time}
                      onChange={(e) => updateAcademy(i, 'time', e.target.value)}
                      placeholder="시간"
                      className="settings-input w-24 !py-1.5 text-sm"
                    />
                    <button
                      onClick={() => removeAcademy(i)}
                      className="text-red-300 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 준비물 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="settings-label mb-0">준비물</label>
                <button
                  onClick={addSupply}
                  className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> 추가
                </button>
              </div>
              <div className="space-y-2">
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

        {/* 저장 버튼 */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors shadow-sm"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
