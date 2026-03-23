import { ThemeColor } from '@/types';

export interface ThemeConfig {
  name: string;
  bg: string;
  headerBg: string;
  headerBorder: string;
  headerTitle: string;
  headerIcon: string;
  headerHover: string;
  primary: string;
  primaryHover: string;
  speechBubbleBorder: string;
  speechBubbleText: string;
  card1: string;
  card1Icon: string;
  card1Title: string;
  card1Accent: string;
  card2: string;
  card2Icon: string;
  card2Title: string;
  card2Accent: string;
  card3: string;
  card3Icon: string;
  card3Title: string;
  card3Accent: string;
  card4: string;
  card4Icon: string;
  card4Title: string;
  card4Accent: string;
  card5: string;
  card5Icon: string;
  card5Title: string;
  card6: string;
  card6Icon: string;
  card6Title: string;
  skeleton1: string;
  skeleton2: string;
  skeleton3: string;
  skeleton4: string;
  tabActive: string;
  tabInactive: string;
  preview: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  pink: {
    name: '핑크',
    bg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50',
    headerBg: 'bg-white/70',
    headerBorder: 'border-pink-100',
    headerTitle: 'text-pink-600',
    headerIcon: 'text-pink-500',
    headerHover: 'hover:bg-pink-100',
    primary: 'bg-pink-500',
    primaryHover: 'hover:bg-pink-600',
    speechBubbleBorder: 'border-pink-100',
    speechBubbleText: 'text-pink-700',
    // Row1: lightest
    card1: 'bg-gradient-to-b from-pink-50 to-pink-100',
    card1Icon: 'text-pink-400',
    card1Title: 'text-pink-600',
    card1Accent: 'text-pink-500',
    card2: 'bg-gradient-to-b from-rose-50 to-rose-100',
    card2Icon: 'text-rose-400',
    card2Title: 'text-rose-600',
    card2Accent: 'text-rose-300',
    // Row2: medium
    card3: 'bg-gradient-to-b from-pink-100/60 to-pink-200/60',
    card3Icon: 'text-fuchsia-500',
    card3Title: 'text-fuchsia-600',
    card3Accent: 'bg-fuchsia-50 text-fuchsia-500',
    card4: 'bg-gradient-to-b from-rose-100/60 to-rose-200/60',
    card4Icon: 'text-pink-500',
    card4Title: 'text-pink-600',
    card4Accent: 'border-pink-300',
    // Row3: deepest
    card5: 'bg-gradient-to-b from-pink-100 to-pink-200',
    card5Icon: 'text-rose-500',
    card5Title: 'text-rose-600',
    card6: 'bg-gradient-to-b from-rose-100 to-rose-200',
    card6Icon: 'text-purple-500',
    card6Title: 'text-purple-600',
    skeleton1: 'bg-pink-100',
    skeleton2: 'bg-rose-100',
    skeleton3: 'bg-pink-100',
    skeleton4: 'bg-purple-100',
    tabActive: 'bg-pink-500 text-white',
    tabInactive: 'bg-pink-50 text-pink-400 hover:bg-pink-100',
    preview: 'bg-gradient-to-br from-pink-200 to-rose-300',
  },
  yellow: {
    name: '노란',
    bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
    headerBg: 'bg-white/70',
    headerBorder: 'border-amber-100',
    headerTitle: 'text-amber-600',
    headerIcon: 'text-amber-500',
    headerHover: 'hover:bg-amber-100',
    primary: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    speechBubbleBorder: 'border-amber-100',
    speechBubbleText: 'text-amber-700',
    card1: 'bg-gradient-to-b from-yellow-50 to-amber-100',
    card1Icon: 'text-amber-400',
    card1Title: 'text-amber-600',
    card1Accent: 'text-amber-500',
    card2: 'bg-gradient-to-b from-amber-50 to-orange-100',
    card2Icon: 'text-orange-400',
    card2Title: 'text-orange-600',
    card2Accent: 'text-orange-300',
    card3: 'bg-gradient-to-b from-amber-100/60 to-amber-200/60',
    card3Icon: 'text-amber-500',
    card3Title: 'text-amber-600',
    card3Accent: 'bg-amber-50 text-amber-500',
    card4: 'bg-gradient-to-b from-yellow-100/60 to-yellow-200/60',
    card4Icon: 'text-yellow-500',
    card4Title: 'text-yellow-600',
    card4Accent: 'border-yellow-300',
    card5: 'bg-gradient-to-b from-amber-100 to-amber-200',
    card5Icon: 'text-amber-500',
    card5Title: 'text-amber-600',
    card6: 'bg-gradient-to-b from-orange-100 to-orange-200',
    card6Icon: 'text-orange-500',
    card6Title: 'text-orange-600',
    skeleton1: 'bg-amber-100',
    skeleton2: 'bg-orange-100',
    skeleton3: 'bg-amber-100',
    skeleton4: 'bg-orange-100',
    tabActive: 'bg-amber-500 text-white',
    tabInactive: 'bg-amber-50 text-amber-400 hover:bg-amber-100',
    preview: 'bg-gradient-to-br from-yellow-200 to-amber-300',
  },
  sky: {
    name: '하늘',
    bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
    headerBg: 'bg-white/70',
    headerBorder: 'border-sky-100',
    headerTitle: 'text-sky-600',
    headerIcon: 'text-sky-500',
    headerHover: 'hover:bg-sky-100',
    primary: 'bg-sky-500',
    primaryHover: 'hover:bg-sky-600',
    speechBubbleBorder: 'border-sky-100',
    speechBubbleText: 'text-sky-700',
    card1: 'bg-gradient-to-b from-sky-50 to-sky-100',
    card1Icon: 'text-sky-400',
    card1Title: 'text-sky-600',
    card1Accent: 'text-sky-500',
    card2: 'bg-gradient-to-b from-blue-50 to-blue-100',
    card2Icon: 'text-blue-400',
    card2Title: 'text-blue-600',
    card2Accent: 'text-blue-300',
    card3: 'bg-gradient-to-b from-sky-100/60 to-sky-200/60',
    card3Icon: 'text-cyan-500',
    card3Title: 'text-cyan-600',
    card3Accent: 'bg-cyan-50 text-cyan-500',
    card4: 'bg-gradient-to-b from-blue-100/60 to-blue-200/60',
    card4Icon: 'text-sky-500',
    card4Title: 'text-sky-600',
    card4Accent: 'border-sky-300',
    card5: 'bg-gradient-to-b from-sky-100 to-sky-200',
    card5Icon: 'text-blue-500',
    card5Title: 'text-blue-600',
    card6: 'bg-gradient-to-b from-blue-100 to-indigo-200',
    card6Icon: 'text-indigo-500',
    card6Title: 'text-indigo-600',
    skeleton1: 'bg-sky-100',
    skeleton2: 'bg-blue-100',
    skeleton3: 'bg-sky-100',
    skeleton4: 'bg-indigo-100',
    tabActive: 'bg-sky-500 text-white',
    tabInactive: 'bg-sky-50 text-sky-400 hover:bg-sky-100',
    preview: 'bg-gradient-to-br from-sky-200 to-blue-300',
  },
  green: {
    name: '초록',
    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    headerBg: 'bg-white/70',
    headerBorder: 'border-green-100',
    headerTitle: 'text-green-600',
    headerIcon: 'text-green-500',
    headerHover: 'hover:bg-green-100',
    primary: 'bg-green-500',
    primaryHover: 'hover:bg-green-600',
    speechBubbleBorder: 'border-green-100',
    speechBubbleText: 'text-green-700',
    card1: 'bg-gradient-to-b from-green-50 to-emerald-100',
    card1Icon: 'text-green-400',
    card1Title: 'text-green-600',
    card1Accent: 'text-green-500',
    card2: 'bg-gradient-to-b from-emerald-50 to-teal-100',
    card2Icon: 'text-emerald-400',
    card2Title: 'text-emerald-600',
    card2Accent: 'text-emerald-300',
    card3: 'bg-gradient-to-b from-green-100/60 to-green-200/60',
    card3Icon: 'text-teal-500',
    card3Title: 'text-teal-600',
    card3Accent: 'bg-teal-50 text-teal-500',
    card4: 'bg-gradient-to-b from-emerald-100/60 to-emerald-200/60',
    card4Icon: 'text-green-500',
    card4Title: 'text-green-600',
    card4Accent: 'border-green-300',
    card5: 'bg-gradient-to-b from-green-100 to-green-200',
    card5Icon: 'text-emerald-500',
    card5Title: 'text-emerald-600',
    card6: 'bg-gradient-to-b from-emerald-100 to-teal-200',
    card6Icon: 'text-teal-500',
    card6Title: 'text-teal-600',
    skeleton1: 'bg-green-100',
    skeleton2: 'bg-emerald-100',
    skeleton3: 'bg-green-100',
    skeleton4: 'bg-teal-100',
    tabActive: 'bg-green-500 text-white',
    tabInactive: 'bg-green-50 text-green-400 hover:bg-green-100',
    preview: 'bg-gradient-to-br from-green-200 to-emerald-300',
  },
  mono: {
    name: '모노',
    bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100',
    headerBg: 'bg-white/70',
    headerBorder: 'border-gray-200',
    headerTitle: 'text-gray-700',
    headerIcon: 'text-gray-500',
    headerHover: 'hover:bg-gray-100',
    primary: 'bg-gray-700',
    primaryHover: 'hover:bg-gray-800',
    speechBubbleBorder: 'border-gray-200',
    speechBubbleText: 'text-gray-700',
    card1: 'bg-gradient-to-b from-gray-50 to-gray-100',
    card1Icon: 'text-gray-400',
    card1Title: 'text-gray-600',
    card1Accent: 'text-gray-500',
    card2: 'bg-gradient-to-b from-slate-50 to-slate-100',
    card2Icon: 'text-slate-400',
    card2Title: 'text-slate-600',
    card2Accent: 'text-slate-300',
    card3: 'bg-gradient-to-b from-gray-100/60 to-gray-200/60',
    card3Icon: 'text-zinc-500',
    card3Title: 'text-zinc-600',
    card3Accent: 'bg-zinc-100 text-zinc-500',
    card4: 'bg-gradient-to-b from-slate-100/60 to-slate-200/60',
    card4Icon: 'text-gray-500',
    card4Title: 'text-gray-600',
    card4Accent: 'border-gray-300',
    card5: 'bg-gradient-to-b from-gray-100 to-gray-200',
    card5Icon: 'text-slate-500',
    card5Title: 'text-slate-600',
    card6: 'bg-gradient-to-b from-slate-100 to-zinc-200',
    card6Icon: 'text-zinc-500',
    card6Title: 'text-zinc-600',
    skeleton1: 'bg-gray-100',
    skeleton2: 'bg-slate-100',
    skeleton3: 'bg-gray-100',
    skeleton4: 'bg-zinc-100',
    tabActive: 'bg-gray-700 text-white',
    tabInactive: 'bg-gray-100 text-gray-400 hover:bg-gray-200',
    preview: 'bg-gradient-to-br from-gray-300 to-slate-400',
  },
};
