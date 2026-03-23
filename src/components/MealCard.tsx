'use client';

import { UtensilsCrossed } from 'lucide-react';
import { MealData } from '@/types';

interface MealCardProps {
  meal: MealData | null;
  loading: boolean;
}

export default function MealCard({ meal, loading }: MealCardProps) {
  return (
    <div className="card bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed className="w-5 h-5 text-orange-400" />
        <h3 className="card-title text-orange-600">오늘의 급식</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-orange-100 rounded w-3/4" />
          ))}
        </div>
      ) : meal ? (
        <div className="space-y-1">
          {meal.menu.map((item, i) => (
            <p key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
              <span className="text-orange-300 mt-0.5">•</span>
              {item}
            </p>
          ))}
          {meal.cal && (
            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-orange-100">
              칼로리: {meal.cal}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          급식 정보가 없어요. 학교를 설정해 주세요!
        </p>
      )}
    </div>
  );
}
