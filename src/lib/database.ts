import { supabase } from '@/lib/supabase';
import { ChallengeDay, Task, Profile, UserSettings, DEFAULT_TASKS } from '@/types/database';
import { addDays, format, differenceInDays, parseISO, isWithinInterval } from 'date-fns';

// Ensure profile exists
export async function ensureProfile(userId: string, fullName?: string): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name: fullName })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

// Ensure user settings exist
export async function ensureUserSettings(userId: string): Promise<UserSettings | null> {
  const { data: existing } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Error creating user settings:', error);
    return null;
  }

  return data;
}

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

// Update user settings
export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data;
}

// Check if a date is within PMS window
export function isInPMSWindow(
  date: Date,
  settings: UserSettings
): boolean {
  if (!settings.pms_safe_enabled || !settings.cycle_day1_date) {
    return false;
  }

  const cycleStart = parseISO(settings.cycle_day1_date);
  const daysSinceStart = differenceInDays(date, cycleStart);
  const dayInCycle = ((daysSinceStart % settings.cycle_length) + settings.cycle_length) % settings.cycle_length;
  
  // PMS window is the last X days of the cycle
  const pmsStartDay = settings.cycle_length - settings.pms_window_length;
  return dayInCycle >= pmsStartDay;
}

// Get challenge start date (Day 1 date)
export async function getChallengeStartDate(userId: string): Promise<Date | null> {
  const { data } = await supabase
    .from('challenge_days')
    .select('date')
    .eq('user_id', userId)
    .eq('day_number', 1)
    .maybeSingle();

  return data ? parseISO(data.date) : null;
}

// Ensure all 75 challenge days exist
export async function ensureChallengeDays(userId: string): Promise<void> {
  // Check if days already exist
  const { data: existingDays, error: fetchError } = await supabase
    .from('challenge_days')
    .select('day_number')
    .eq('user_id', userId);

  if (fetchError) {
    console.error('Error fetching challenge days:', fetchError);
    return;
  }

  const existingDayNumbers = new Set(existingDays?.map(d => d.day_number) || []);
  
  if (existingDayNumbers.size === 75) {
    return; // All days exist
  }

  // Get start date or use today
  let startDate: Date;
  if (existingDays && existingDays.length > 0) {
    const day1 = await supabase
      .from('challenge_days')
      .select('date')
      .eq('user_id', userId)
      .eq('day_number', 1)
      .maybeSingle();
    
    startDate = day1.data ? parseISO(day1.data.date) : new Date();
  } else {
    startDate = new Date();
  }

  // Create missing days
  const missingDays: Array<{
    user_id: string;
    day_number: number;
    date: string;
    notes: string;
    symptoms: string[];
  }> = [];

  for (let i = 1; i <= 75; i++) {
    if (!existingDayNumbers.has(i)) {
      missingDays.push({
        user_id: userId,
        day_number: i,
        date: format(addDays(startDate, i - 1), 'yyyy-MM-dd'),
        notes: '',
        symptoms: [],
      });
    }
  }

  if (missingDays.length > 0) {
    const { error } = await supabase
      .from('challenge_days')
      .insert(missingDays);

    if (error) {
      console.error('Error creating challenge days:', error);
    }
  }
}

// Get all challenge days for a user
export async function getChallengeDays(userId: string): Promise<ChallengeDay[]> {
  const { data, error } = await supabase
    .from('challenge_days')
    .select('*')
    .eq('user_id', userId)
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching challenge days:', error);
    return [];
  }

  return data || [];
}

// Get a specific challenge day
export async function getChallengeDay(
  userId: string,
  dayNumber: number
): Promise<ChallengeDay | null> {
  const { data, error } = await supabase
    .from('challenge_days')
    .select('*')
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching challenge day:', error);
    return null;
  }

  return data;
}

// Get challenge day by date
export async function getChallengeDayByDate(
  userId: string,
  date: Date
): Promise<ChallengeDay | null> {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('challenge_days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (error) {
    console.error('Error fetching challenge day by date:', error);
    return null;
  }

  return data;
}

// Update challenge day
export async function updateChallengeDay(
  dayId: string,
  updates: Partial<ChallengeDay>
): Promise<ChallengeDay | null> {
  const { data, error } = await supabase
    .from('challenge_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) {
    console.error('Error updating challenge day:', error);
    return null;
  }

  return data;
}

// Ensure tasks exist for a challenge day
export async function ensureTasks(
  userId: string,
  challengeDayId: string,
  isPMSWindow: boolean
): Promise<void> {
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('key')
    .eq('challenge_day_id', challengeDayId);

  const existingKeys = new Set(existingTasks?.map(t => t.key) || []);

  const tasksToCreate: Array<{
    user_id: string;
    challenge_day_id: string;
    key: string;
    title: string;
    required: boolean;
  }> = [];

  for (const task of DEFAULT_TASKS) {
    // Skip PMS-only tasks if not in PMS window
    if (task.pmsOnly && !isPMSWindow) continue;
    
    if (!existingKeys.has(task.key)) {
      tasksToCreate.push({
        user_id: userId,
        challenge_day_id: challengeDayId,
        key: task.key,
        title: task.title,
        required: task.required,
      });
    }
  }

  if (tasksToCreate.length > 0) {
    const { error } = await supabase
      .from('tasks')
      .insert(tasksToCreate);

    if (error) {
      console.error('Error creating tasks:', error);
    }
  }
}

// Get tasks for a challenge day
export async function getTasks(challengeDayId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('challenge_day_id', challengeDayId)
    .order('key');

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

// Update a task
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data;
}

// Calculate current streak
export async function calculateStreak(userId: string): Promise<number> {
  const { data: days } = await supabase
    .from('challenge_days')
    .select('day_number, is_completed, date')
    .eq('user_id', userId)
    .order('day_number', { ascending: false });

  if (!days || days.length === 0) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  let streak = 0;
  let foundToday = false;

  for (const day of days) {
    // Skip future days
    if (day.date > today) continue;
    
    if (day.date === today) {
      foundToday = true;
      if (day.is_completed) {
        streak++;
      }
      continue;
    }

    // For past days, streak breaks if not completed
    if (day.is_completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get current day number based on today's date
export async function getCurrentDayNumber(userId: string): Promise<number> {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data } = await supabase
    .from('challenge_days')
    .select('day_number')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  return data?.day_number || 1;
}

// Full seed routine for new users
export async function seedUserData(userId: string, fullName?: string): Promise<void> {
  await ensureProfile(userId, fullName);
  await ensureUserSettings(userId);
  await ensureChallengeDays(userId);

  // Ensure tasks for all days
  const days = await getChallengeDays(userId);
  const settings = await getUserSettings(userId);

  if (days && settings) {
    for (const day of days) {
      const isPMS = isInPMSWindow(parseISO(day.date), settings);
      await ensureTasks(userId, day.id, isPMS);
    }
  }
}
