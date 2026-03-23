'use client';

import { UtensilsCrossed } from 'lucide-react';
import { MealData } from '@/types';
import { ThemeConfig } from '@/lib/theme';

interface MealCardProps {
  meal: MealData | null;
  loading: boolean;
  hasSchool: boolean;
  theme: ThemeConfig;
}

export default function MealCard({ meal, loading, hasSchool, theme }: MealCardProps) {
  return (
    <div className={`card ${theme.card2}`}>
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed className={`w-5 h-5 ${theme.card2Icon}`} />
        <h3 className={`card-title ${theme.card2Title}`}>오늘의 급식</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-4 ${theme.skeleton2} rounded w-3/4`} />
          ))}
        </div>
      ) : meal ? (
        <div className="space-y-1">
          {meal.menu.map((item, i) => (
            <p key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
              <span className={`${theme.card2Accent} mt-0.5`}>•</span>
              {item}
            </p>
          ))}
          {meal.cal && (
            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
              칼로리: {meal.cal}
            </p>
          )}
        </div>
      ) : !hasSchool ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <UtensilsCrossed className={`w-8 h-8 ${theme.card2Icon} opacity-30`} />
          <p className="text-sm text-gray-400">설정에서 학교를 등록해주세요</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">오늘은 급식 정보가 없어요.</p>
      )}
    </div>
  );
}
