'use client';

interface CharacterGreetingProps {
  name: string;
}

export default function CharacterGreeting({ name }: CharacterGreetingProps) {
  const displayName = name?.trim() || '친구';

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* 귀여운 하얀 캐릭터 SVG */}
      <div className="relative flex-shrink-0">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 몸통 */}
          <ellipse cx="36" cy="42" rx="22" ry="24" fill="white" stroke="#e0d4f5" strokeWidth="2" />
          {/* 얼굴 */}
          <circle cx="36" cy="34" r="20" fill="white" stroke="#e0d4f5" strokeWidth="2" />
          {/* 볼터치 */}
          <ellipse cx="24" cy="38" rx="4" ry="3" fill="#ffd4e0" opacity="0.7" />
          <ellipse cx="48" cy="38" rx="4" ry="3" fill="#ffd4e0" opacity="0.7" />
          {/* 눈 */}
          <circle cx="29" cy="32" r="2.5" fill="#4a3f6b" />
          <circle cx="43" cy="32" r="2.5" fill="#4a3f6b" />
          <circle cx="30" cy="31" r="1" fill="white" />
          <circle cx="44" cy="31" r="1" fill="white" />
          {/* 입 (미소) */}
          <path
            d="M32 40 Q36 44 40 40"
            stroke="#4a3f6b"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* 귀 */}
          <ellipse cx="18" cy="22" rx="6" ry="8" fill="white" stroke="#e0d4f5" strokeWidth="2" />
          <ellipse cx="18" cy="22" rx="3" ry="5" fill="#ffd4e0" opacity="0.4" />
          <ellipse cx="54" cy="22" rx="6" ry="8" fill="white" stroke="#e0d4f5" strokeWidth="2" />
          <ellipse cx="54" cy="22" rx="3" ry="5" fill="#ffd4e0" opacity="0.4" />
        </svg>
      </div>

      {/* 말풍선 */}
      <div className="relative bg-white rounded-2xl px-5 py-3 shadow-sm border border-purple-100">
        <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-purple-100 transform rotate-45" />
        <p className="text-base md:text-lg font-semibold text-purple-700 relative z-10">
          안녕! {displayName}, 오늘의 일정이야! ✨
        </p>
      </div>
    </div>
  );
}
