import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Trophy, AlertCircle, Download, Flame, Target, Calendar } from 'lucide-react';
import { getChallengeDays, calculateStreak } from '@/lib/database';
import { ChallengeDay, TaskKey } from '@/types/database';
import { supabase } from '@/lib/supabase';

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [taskConsistency, setTaskConsistency] = useState<Array<{key:string;label:string;percentage:number;completedDays:number;totalDays:number}>>([]);
  const [completionData, setCompletionData] = useState<Array<{week:string;rate:number}>>([]);
  const today = new Date().toISOString().split('T')[0];
  const elapsedDays = days.filter(d => d.date <= today);
  const completedDays = elapsedDays.filter(d => d.is_completed);
  const completionRate = elapsedDays.length > 0 ? (completedDays.length / elapsedDays.length) * 100 : 0;

  useEffect(() => { if (user) loadProgress(); }, [user]);

  async function loadProgress() {
    if (!user) return;
    setLoading(true);
    const allDays = await getChallengeDays(user.id);
    setDays(allDays);
    setStreak(await calculateStreak(user.id));
    const { data: tasks } = await supabase.from('tasks').select('key, completed, challenge_day_id').eq('user_id', user.id);
    if (tasks) {
      const pastDayIds = new Set(allDays.filter(d => d.date <= today).map(d => d.id));
      const pastTasks = tasks.filter(t => pastDayIds.has(t.challenge_day_id));
      const labels: Record<string,string> = { workout1:'Workout 1', workout2:'Workout 2', water:'Water', read:'Reading', diet:'Diet', photo:'Photo' };
      const consistency = (['workout1','workout2','water','read','diet','photo'] as TaskKey[]).map(key => {
        const keyTasks = pastTasks.filter(t => t.key === key);
        const completed = keyTasks.filter(t => t.completed).length;
        return { key, label: labels[key], completedDays: completed, totalDays: keyTasks.length, percentage: keyTasks.length > 0 ? (completed/keyTasks.length)*100 : 0 };
      });
      setTaskConsistency(consistency);
    }
    const pastDays = allDays.filter(d => d.date <= today);
    const weeklyData = [];
    for (let i = 0; i < Math.ceil(pastDays.length/7); i++) {
      const week = pastDays.slice(i*7, (i+1)*7);
      weeklyData.push({ week: `Week ${i+1}`, rate: Math.round(week.length > 0 ? (week.filter(d=>d.is_completed).length/week.length)*100 : 0) });
    }
    setCompletionData(weeklyData);
    setLoading(false);
  }

  const wins = taskConsistency.filter(t=>t.percentage>=80).map(t=>`Strong ${t.label.toLowerCase()}!`);
  const slips = taskConsistency.filter(t=>t.percentage<50&&t.totalDays>0).map(t=>`${t.label} needs attention`);
  if (streak >= 7) wins.unshift(`${streak}-day streak!`);

  if (loading) return <AppLayout><div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-20 w-full rounded-2xl"/><div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i=><Skeleton key={i} className="h-28 rounded-2xl"/>)}</div><Skeleton className="h-64 w-full rounded-2xl"/></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-serif font-bold">Your Progress</h1><p className="text-muted-foreground mt-1">Track your journey</p></div><Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2"/>Export</Button></div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="h-6 w-6 text-primary"/></div><div><p className="text-3xl font-bold">{elapsedDays.length}</p><p className="text-sm text-muted-foreground">Days Elapsed</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><Flame className="h-6 w-6 text-accent"/></div><div><p className="text-3xl font-bold">{streak}</p><p className="text-sm text-muted-foreground">Current Streak</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Target className="h-6 w-6 text-primary"/></div><div><p className="text-3xl font-bold">{Math.round(completionRate)}%</p><p className="text-sm text-muted-foreground">Completion Rate</p></div></div></CardContent></Card>
        </div>
        {completionData.length>0&&<Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Completion Over Time</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={completionData}><XAxis dataKey="week" tick={{fontSize:12}}/><YAxis domain={[0,100]} tick={{fontSize:12}}/><Tooltip formatter={(v)=>[`${v}%`,'Completion']}/><Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2}/></LineChart></ResponsiveContainer></div></CardContent></Card>}
        <Card><CardHeader><CardTitle>Task Consistency</CardTitle></CardHeader><CardContent className="space-y-4">{taskConsistency.map(t=><div key={t.key} className="space-y-2"><div className="flex justify-between text-sm"><span>{t.label}</span><span className="text-muted-foreground">{t.completedDays}/{t.totalDays} ({Math.round(t.percentage)}%)</span></div><ProgressBar value={t.percentage} className="h-2"/></div>)}</CardContent></Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-primary"><Trophy className="h-5 w-5"/>Wins</CardTitle></CardHeader><CardContent>{wins.length>0?<ul className="space-y-2">{wins.slice(0,4).map((w,i)=><li key={i} className="text-sm">✓ {w}</li>)}</ul>:<p className="text-sm text-muted-foreground">Keep going!</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5"/>Needs Love</CardTitle></CardHeader><CardContent>{slips.length>0?<ul className="space-y-2">{slips.slice(0,4).map((s,i)=><li key={i} className="text-sm text-muted-foreground">→ {s}</li>)}</ul>:<p className="text-sm text-muted-foreground">You're doing great!</p>}</CardContent></Card>
        </div>
      </div>
    </AppLayout>
  );
}