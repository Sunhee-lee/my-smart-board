'use client';

import { Backpack, Check } from 'lucide-react';
import { useState } from 'react';
import { ThemeConfig } from '@/lib/theme';

interface SuppliesCardProps {
  supplies: string[];
  theme: ThemeConfig;
}

export default function SuppliesCard({ supplies, theme }: SuppliesCardProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className={`card ${theme.card4}`}>
      <div className="flex items-center gap-2 mb-3">
        <Backpack className={`w-5 h-5 ${theme.card4Icon}`} />
        <h3 className={`card-title ${theme.card4Title}`}>오늘 준비물</h3>
      </div>

      {supplies.length > 0 ? (
        <div className="space-y-1.5">
          {supplies.map((item, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 transition-all ${
                checked[i]
                  ? 'bg-green-100/60 line-through text-gray-400'
                  : 'bg-white/60 text-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  checked[i]
                    ? 'bg-green-400 border-green-400'
                    : theme.card4Accent
                }`}
              >
                {checked[i] && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{item}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">오늘은 특별한 준비물이 없어요!</p>
      )}
    </div>
  );
}
