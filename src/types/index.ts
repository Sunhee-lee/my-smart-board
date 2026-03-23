export interface AcademyItem {
  name: string;
  time: string;
}

export interface DaySchedule {
  academies: AcademyItem[];
  supplies: string[];
}

export interface Settings {
  childName: string;
  schoolName: string;
  schoolCode: string;
  eduOfficeCode: string;
  grade: string;
  classNum: string;
  weeklySchedule: Record<string, DaySchedule>;
}

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  dust: string;
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
  schoolName: '',
  schoolCode: '',
  eduOfficeCode: '',
  grade: '1',
  classNum: '1',
  weeklySchedule: {
    월: { academies: [], supplies: [] },
    화: { academies: [], supplies: [] },
    수: { academies: [], supplies: [] },
    목: { academies: [], supplies: [] },
    금: { academies: [], supplies: [] },
  },
};
