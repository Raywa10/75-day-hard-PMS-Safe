export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  pms_safe_enabled: boolean;
  cycle_length: number;
  pms_window_length: number;
  cycle_day1_date: string | null;
  water_goal_liters: number;
  pms_water_goal_liters: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeDay {
  id: string;
  user_id: string;
  day_number: number;
  date: string;
  notes: string;
  mood: string | null;
  symptoms: string[];
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  challenge_day_id: string;
  key: TaskKey;
  title: string;
  required: boolean;
  completed: boolean;
  variant: string | null;
  updated_at: string;
}

export type TaskKey = 
  | 'workout1' 
  | 'workout2' 
  | 'water' 
  | 'read' 
  | 'diet' 
  | 'photo' 
  | 'rest_recovery';

export type Mood = 'Energetic' | 'Okay' | 'Low' | 'Anxious';

export type Symptom = 
  | 'cramps' 
  | 'headache' 
  | 'cravings' 
  | 'fatigue' 
  | 'bloating';

export const MOODS: Mood[] = ['Energetic', 'Okay', 'Low', 'Anxious'];

export const SYMPTOMS: Symptom[] = [
  'cramps',
  'headache', 
  'cravings',
  'fatigue',
  'bloating'
];

export const DEFAULT_TASKS: Array<{ 
  key: TaskKey; 
  title: string; 
  required: boolean;
  pmsOnly?: boolean;
}> = [
  { key: 'workout1', title: 'Workout 1 (45 min)', required: true },
  { key: 'workout2', title: 'Workout 2 (45 min)', required: true },
  { key: 'water', title: 'Drink water (1 gallon)', required: true },
  { key: 'read', title: 'Read 10 pages', required: true },
  { key: 'diet', title: 'Follow diet', required: true },
  { key: 'photo', title: 'Progress photo', required: true },
  { key: 'rest_recovery', title: 'Rest & Recovery', required: false, pmsOnly: true },
];
