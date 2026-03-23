'use client';

import { Backpack, Check } from 'lucide-react';
import { useState } from 'react';

interface SuppliesCardProps {
  supplies: string[];
}

export default function SuppliesCard({ supplies }: SuppliesCardProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="card bg-gradient-to-br from-amber-50 to-yellow-50">
      <div className="flex items-center gap-2 mb-3">
        <Backpack className="w-5 h-5 text-amber-500" />
        <h3 className="card-title text-amber-600">오늘 준비물</h3>
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
                    : 'border-amber-300'
                }`}
              >
                {checked[i] && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{item}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          오늘은 특별한 준비물이 없어요!
        </p>
      )}
    </div>
  );
}
