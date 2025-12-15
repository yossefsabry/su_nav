export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduleItem {
  id: string;
  title: string;
  type: 'lecture' | 'lab' | 'other';
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  locationId?: number;
  instructor?: string;
  notes?: string;
  color?: string;
}

export interface WeekSchedule {
  [key: string]: ScheduleItem[];
}
