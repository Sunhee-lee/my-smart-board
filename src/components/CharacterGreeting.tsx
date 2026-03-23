'use client';

import { ThemeConfig } from '@/lib/theme';

interface CharacterGreetingProps {
  name: string;
  theme: ThemeConfig;
}

export default function CharacterGreeting({ name, theme }: CharacterGreetingProps) {
  const displayName = name?.trim() || '친구';

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* 귀여운 곰 캐릭터 SVG */}
      <div className="relative flex-shrink-0">
        <svg
          width="80"
          height="80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 왼쪽 귀 */}
          <ellipse cx="62" cy="38" rx="24" ry="24" fill="white" stroke="#2d2d2d" strokeWidth="5" />
          {/* 오른쪽 귀 */}
          <ellipse cx="138" cy="38" rx="24" ry="24" fill="white" stroke="#2d2d2d" strokeWidth="5" />
          {/* 몸통 */}
          <rect x="52" y="100" rx="36" ry="36" width="96" height="90" fill="white" stroke="#2d2d2d" strokeWidth="5" />
          {/* 머리 */}
          <ellipse cx="100" cy="85" rx="58" ry="52" fill="white" stroke="#2d2d2d" strokeWidth="5" />
          {/* 왼쪽 눈 */}
          <ellipse cx="80" cy="78" rx="8" ry="9" fill="#2d2d2d" />
          <ellipse cx="77" cy="75" rx="3" ry="3.5" fill="white" />
          {/* 오른쪽 눈 */}
          <ellipse cx="120" cy="78" rx="8" ry="9" fill="#2d2d2d" />
          <ellipse cx="117" cy="75" rx="3" ry="3.5" fill="white" />
          {/* 왼쪽 볼터치 */}
          <ellipse cx="65" cy="95" rx="10" ry="6" fill="#FFB0B0" opacity="0.6" />
          {/* 오른쪽 볼터치 */}
          <ellipse cx="135" cy="95" rx="10" ry="6" fill="#FFB0B0" opacity="0.6" />
          {/* 코 */}
          <ellipse cx="100" cy="92" rx="5" ry="4" fill="#2d2d2d" />
          {/* 입 (웃는 모양) */}
          <path d="M92 97 Q100 107 108 97" stroke="#2d2d2d" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* 혀 */}
          <ellipse cx="100" cy="103" rx="5" ry="4" fill="#FF7B7B" />
          {/* 오른쪽 손 (흔드는) */}
          <ellipse cx="160" cy="130" rx="16" ry="18" fill="white" stroke="#2d2d2d" strokeWidth="5" transform="rotate(-15 160 130)" />
          {/* 발바닥 무늬 */}
          <ellipse cx="157" cy="127" rx="4" ry="5" fill="#2d2d2d" opacity="0.3" />
          <circle cx="152" cy="121" r="2.5" fill="#2d2d2d" opacity="0.3" />
          <circle cx="163" cy="121" r="2.5" fill="#2d2d2d" opacity="0.3" />
          <circle cx="157" cy="118" r="2.5" fill="#2d2d2d" opacity="0.3" />
          {/* 왼쪽 팔 */}
          <ellipse cx="42" cy="145" rx="14" ry="16" fill="white" stroke="#2d2d2d" strokeWidth="5" transform="rotate(10 42 145)" />
        </svg>
      </div>

      {/* 말풍선 */}
      <div className={`relative bg-white rounded-2xl px-5 py-3 shadow-sm border ${theme.speechBubbleBorder}`}>
        <div className={`absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b ${theme.speechBubbleBorder} transform rotate-45`} />
        <p className={`font-title text-base md:text-lg ${theme.speechBubbleText} relative z-10`}>
          안녕! {displayName}, 오늘의 일정을 확인해 보자!
        </p>
      </div>
    </div>
  );
}
