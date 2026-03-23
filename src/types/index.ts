export type ThemeColor = 'pink' | 'yellow' | 'sky' | 'green' | 'mono';

export interface AcademyItem {
  name: string;
  startHour: string;
  startMin: string;
  endHour: string;
  endMin: string;
}

export interface DaySchedule {
  academies: AcademyItem[];
  supplies: string[];
}

export interface Settings {
  childName: string;
  childLastName: string;
  childFirstName: string;
  schoolName: string;
  schoolCode: string;
  eduOfficeCode: string;
  grade: string;
  classNum: string;
  theme: ThemeColor;
  weeklySchedule: Record<string, DaySchedule>;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  dust: string;
  pm10: number;
  pm25: number;
  rainChance: number;
}

export interface MealData {
  menu: string[];
  cal: string;
}

export interface TimetableItem {
  period: number;
  subject: string;
}

export interface SchoolEvent {
  date: string;
  title: string;
}

export const DEFAULT_SETTINGS: Settings = {
  childName: '',
  childLastName: '',
  childFirstName: '',
  schoolName: '',
  schoolCode: '',
  eduOfficeCode: '',
  grade: '1',
  classNum: '1',
  theme: 'pink',
  weeklySchedule: {
    월: { academies: [], supplies: [] },
    화: { academies: [], supplies: [] },
    수: { academies: [], supplies: [] },
    목: { academies: [], supplies: [] },
    금: { academies: [], supplies: [] },
  },
};
