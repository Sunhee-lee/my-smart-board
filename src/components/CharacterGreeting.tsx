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
      {/* 캐릭터 이미지 */}
      <div className="relative flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bear-character.svg"
          alt="곰돌이 캐릭터"
          width={80}
          height={80}
          className="object-contain"
        />
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
