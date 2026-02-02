
export interface Habit {
  id: string;
  name: string;
  isMulti?: boolean;
  options?: string[];
}

export interface CheckInData {
  [date: string]: {
    [habitId: string]: boolean | string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  timestamp: number;
}

export type TabType = 'weekly' | 'monthly' | 'notes' | 'stats';
