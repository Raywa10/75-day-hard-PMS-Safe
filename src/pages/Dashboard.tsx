import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsHeader } from '@/components/dashboard/StatsHeader';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { DayTimeline } from '@/components/dashboard/DayTimeline';
import { NotesArea } from '@/components/dashboard/NotesArea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { Check, Sparkles } from 'lucide-react';
import {
  seedUserData, getUserSettings, getChallengeDays, getChallengeDayByDate,
  getChallengeDay, getTasks, updateTask, updateChallengeDay, calculateStreak,
  isInPMSWindow, ensureTasks,
} from '@/lib/database';
import { ChallengeDay, Task, UserSettings } from '@/types/database';
import { parseISO } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [currentDay, setCurrentDay] = useState<ChallengeDay | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [completing, setCompleting] = useState(false);

  const isPMSWindow = currentDay && settings ? isInPMSWindow(parseISO(currentDay.date), settings) : false;
  const requiredTasks = tasks.filter(t => t.required);
  const allRequiredComplete = requiredTasks.length > 0 && requiredTasks.every(t => t.completed);
  const completionRate = days.length > 0 ? (days.filter(d => d.is_completed).length / days.filter(d => d.date <= new Date().toISOString().split('T')[0]).length) * 100 : 0;

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      await seedUserData(user.id);
      const userSettings = await getUserSettings(user.id);
      setSettings(userSettings);
      const allDays = await getChallengeDays(user.id);
      setDays(allDays);
      const todayDay = await getChallengeDayByDate(user.id, new Date());
      if (todayDay && userSettings) {
        setCurrentDay(todayDay);
        const isPMS = isInPMSWindow(parseISO(todayDay.date), userSettings);
        await ensureTasks(user.id, todayDay.id, isPMS);
        const dayTasks = await getTasks(todayDay.id);
        setTasks(dayTasks);
      }
      setStreak(await calculateStreak(user.id));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
    } finally { setLoading(false); }
  }

  async function handleTaskToggle(taskId: string, completed: boolean) {
    const updated = await updateTask(taskId, { completed });
    if (updated) setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }

  async function handleVariantChange(taskId: string, variant: string) {
    const updated = await updateTask(taskId, { variant: variant === 'normal' ? null : variant });
    if (updated) setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }

  async function handleNoteSave(notes: string) {
    if (!currentDay) return;
    const updated = await updateChallengeDay(currentDay.id, { notes });
    if (updated) { setCurrentDay(updated); toast({ title: 'Note saved' }); }
  }

  async function handleCompleteDay() {
    if (!currentDay || !allRequiredComplete) return;
    setCompleting(true);
    try {
      const updated = await updateChallengeDay(currentDay.id, { is_completed: true, completed_at: new Date().toISOString() });
      if (updated) {
        setCurrentDay(updated);
        setDays(prev => prev.map(d => d.id === updated.id ? updated : d));
        setStreak(await calculateStreak(user!.id));
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6B8E6B', '#8B9B7A', '#C4B7D4'] });
        toast({ title: '🎉 Day Complete!', description: `Day ${currentDay.day_number} done!` });
      }
    } finally { setCompleting(false); }
  }

  if (loading) return <AppLayout><div className="max-w-6xl mx-auto space-y-6"><Skeleton className="h-32 w-full rounded-2xl" /><div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-4">{[1,2,3,4,5,6].map(i=><Skeleton key={i} className="h-20 w-full rounded-2xl"/>)}</div><Skeleton className="h-96 rounded-2xl"/></div></div></AppLayout>;

  if (!currentDay) return <AppLayout><div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]"><div className="text-center"><h2 className="text-xl font-medium mb-2">No challenge day found</h2><Button onClick={loadData}>Refresh</Button></div></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <StatsHeader dayNumber={currentDay.day_number} streak={streak} completionRate={completionRate} isPMSSafe={isPMSWindow} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Today's Tasks</h2><span className="text-sm text-muted-foreground">{tasks.filter(t=>t.completed).length}/{tasks.length}</span></div>
            <div className="space-y-3">{tasks.map(task=><TaskItem key={task.id} task={task} isPMSWindow={isPMSWindow} onToggle={handleTaskToggle} onVariantChange={handleVariantChange}/>)}</div>
            <Button onClick={handleCompleteDay} disabled={!allRequiredComplete || currentDay.is_completed || completing} size="lg" className="w-full mt-6 h-14 text-lg rounded-2xl">
              {currentDay.is_completed ? <><Sparkles className="h-5 w-5 mr-2"/>Day Completed!</> : <><Check className="h-5 w-5 mr-2"/>Complete Day {currentDay.day_number}</>}
            </Button>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/50 p-4"><h3 className="font-medium mb-4">75-Day Timeline</h3><DayTimeline days={days} currentDayNumber={currentDay.day_number} onSelectDay={(d)=>navigate(`/log?day=${d}`)}/></div>
            <div className="bg-card rounded-2xl border border-border/50 p-4"><NotesArea notes={currentDay.notes} onSave={handleNoteSave}/></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}