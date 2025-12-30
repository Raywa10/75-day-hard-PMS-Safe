import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getChallengeDay, getChallengeDays, getTasks, updateTask, updateChallengeDay, getUserSettings, isInPMSWindow, ensureTasks } from '@/lib/database';
import { ChallengeDay, Task, UserSettings, MOODS, SYMPTOMS } from '@/types/database';
import { parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Log() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<ChallengeDay | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const dayParam = searchParams.get('day');
  const selectedDayNumber = dayParam ? parseInt(dayParam) : 1;
  const isPMSWindow = selectedDay && settings ? isInPMSWindow(parseISO(selectedDay.date), settings) : false;
  const today = new Date().toISOString().split('T')[0];
  const canEdit = selectedDay && selectedDay.date <= today;

  useEffect(() => { if (user) loadInitialData(); }, [user]);
  useEffect(() => { if (user && settings && days.length > 0) loadDayData(selectedDayNumber); }, [selectedDayNumber, user, settings, days]);

  async function loadInitialData() {
    if (!user) return;
    setLoading(true);
    try {
      const userSettings = await getUserSettings(user.id);
      setSettings(userSettings);
      const allDays = await getChallengeDays(user.id);
      setDays(allDays);
      if (!dayParam) {
        const todayDay = allDays.find(d => d.date === today);
        if (todayDay) setSearchParams({ day: todayDay.day_number.toString() });
      }
    } finally { setLoading(false); }
  }

  async function loadDayData(dayNumber: number) {
    if (!user || !settings) return;
    const day = await getChallengeDay(user.id, dayNumber);
    if (day) {
      setSelectedDay(day); setNotes(day.notes); setMood(day.mood); setSymptoms(day.symptoms || []);
      const isPMS = isInPMSWindow(parseISO(day.date), settings);
      await ensureTasks(user.id, day.id, isPMS);
      setTasks(await getTasks(day.id));
    }
  }

  async function handleTaskToggle(taskId: string, completed: boolean) {
    if (!canEdit) return;
    const updated = await updateTask(taskId, { completed });
    if (updated) setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }

  async function handleVariantChange(taskId: string, variant: string) {
    if (!canEdit) return;
    const updated = await updateTask(taskId, { variant: variant === 'normal' ? null : variant });
    if (updated) setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }

  async function handleSave() {
    if (!selectedDay || !canEdit) return;
    setSaving(true);
    const updated = await updateChallengeDay(selectedDay.id, { notes, mood, symptoms });
    if (updated) { setSelectedDay(updated); toast({ title: 'Saved', description: `Day ${selectedDay.day_number} updated.` }); }
    setSaving(false);
  }

  function goToDay(dayNumber: number) { if (dayNumber >= 1 && dayNumber <= 75) setSearchParams({ day: dayNumber.toString() }); }

  if (loading) return <AppLayout><div className="max-w-3xl mx-auto space-y-6"><Skeleton className="h-16 w-full rounded-2xl"/>{[1,2,3,4].map(i=><Skeleton key={i} className="h-20 w-full rounded-2xl"/>)}</div></AppLayout>;
  if (!selectedDay) return <AppLayout><div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]"><p className="text-muted-foreground">Day not found</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => goToDay(selectedDayNumber - 1)} disabled={selectedDayNumber <= 1}><ChevronLeft className="h-5 w-5"/></Button>
            <div className="flex items-center gap-4">
              <Select value={selectedDayNumber.toString()} onValueChange={(v) => goToDay(parseInt(v))}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent className="max-h-64">{Array.from({length:75},(_,i)=>i+1).map(num=><SelectItem key={num} value={num.toString()}>Day {num}</SelectItem>)}</SelectContent></Select>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/><span className="text-sm">{format(parseISO(selectedDay.date), 'MMMM d, yyyy')}</span></div>
              {selectedDay.is_completed && <Badge className="bg-primary/20 text-primary">Completed</Badge>}
              {isPMSWindow && <Badge className="bg-pms-accent/20 text-pms-accent">PMS Window</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => goToDay(selectedDayNumber + 1)} disabled={selectedDayNumber >= 75}><ChevronRight className="h-5 w-5"/></Button>
          </div>
        </div>
        {!canEdit && <div className="bg-secondary/50 rounded-2xl p-4 text-center text-muted-foreground">Future day - view only.</div>}
        <div className="space-y-3"><h2 className="text-lg font-medium">Tasks</h2>{tasks.map(task=><TaskItem key={task.id} task={task} isPMSWindow={isPMSWindow} onToggle={handleTaskToggle} onVariantChange={handleVariantChange}/>)}</div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3"><h3 className="font-medium">How are you feeling?</h3><div className="flex flex-wrap gap-2">{MOODS.map(m=><Button key={m} variant={mood===m?'default':'outline'} size="sm" onClick={()=>canEdit&&setMood(mood===m?null:m)} disabled={!canEdit} className="rounded-xl">{m}</Button>)}</div></div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3"><h3 className="font-medium">Any symptoms?</h3><div className="flex flex-wrap gap-2">{SYMPTOMS.map(s=><Badge key={s} variant={symptoms.includes(s)?'default':'outline'} className={cn('cursor-pointer capitalize',symptoms.includes(s)&&'bg-pms-accent/20 text-pms-accent',!canEdit&&'cursor-not-allowed opacity-50')} onClick={()=>canEdit&&setSymptoms(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s])}>{s}</Badge>)}</div></div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3"><h3 className="font-medium">Notes</h3><Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="How did today go?" className="min-h-[120px]" disabled={!canEdit}/></div>
        <Button onClick={handleSave} disabled={!canEdit||saving} size="lg" className="w-full h-14 rounded-2xl"><Save className="h-5 w-5 mr-2"/>{saving?'Saving...':'Save Changes'}</Button>
      </div>
    </AppLayout>
  );
}