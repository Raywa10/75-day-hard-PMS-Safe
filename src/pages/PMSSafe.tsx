import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Calendar, Droplets, Dumbbell, Sparkles, Save } from 'lucide-react';
import { getUserSettings, updateUserSettings, isInPMSWindow } from '@/lib/database';
import { UserSettings } from '@/types/database';
import { parseISO, differenceInDays } from 'date-fns';

export default function PMSSafe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pmsSafeEnabled, setPmsSafeEnabled] = useState(false);
  const [cycleLength, setCycleLength] = useState(28);
  const [pmsWindowLength, setPmsWindowLength] = useState(7);
  const [cycleDay1Date, setCycleDay1Date] = useState('');
  const [pmsWaterGoal, setPmsWaterGoal] = useState(3.0);

  useEffect(() => { if (user) loadSettings(); }, [user]);

  async function loadSettings() {
    if (!user) return;
    setLoading(true);
    const s = await getUserSettings(user.id);
    if (s) { setPmsSafeEnabled(s.pms_safe_enabled); setCycleLength(s.cycle_length); setPmsWindowLength(s.pms_window_length); setCycleDay1Date(s.cycle_day1_date||''); setPmsWaterGoal(s.pms_water_goal_liters); }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const updated = await updateUserSettings(user.id, { pms_safe_enabled: pmsSafeEnabled, cycle_length: cycleLength, pms_window_length: pmsWindowLength, cycle_day1_date: cycleDay1Date||null, pms_water_goal_liters: pmsWaterGoal });
    if (updated) {
      toast({ title: 'Settings saved' });
      await loadSettings();
    }
    setSaving(false);
  }

  // Calculate dynamic PMS status
  const pmsStatus = useMemo(() => {
    if (!pmsSafeEnabled || !cycleDay1Date) {
      return null;
    }

    try {
      const today = new Date();
      const cycleStart = parseISO(cycleDay1Date);
      const daysSinceStart = differenceInDays(today, cycleStart);
      const dayInCycle = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
      const pmsStartDay = cycleLength - pmsWindowLength;
      const isInPMS = dayInCycle >= pmsStartDay;
      
      const currentSettings: UserSettings = {
        id: '',
        user_id: '',
        pms_safe_enabled: pmsSafeEnabled,
        cycle_length: cycleLength,
        pms_window_length: pmsWindowLength,
        cycle_day1_date: cycleDay1Date,
        pms_water_goal_liters: pmsWaterGoal,
        created_at: '',
        updated_at: '',
      };
      
      const isTodayInPMS = isInPMSWindow(today, currentSettings);
      
      let daysUntilPMS = 0;
      let daysRemainingInPMS = 0;
      
      if (isInPMS) {
        daysRemainingInPMS = cycleLength - dayInCycle;
      } else {
        daysUntilPMS = pmsStartDay - dayInCycle;
      }

      return {
        dayInCycle: dayInCycle + 1, // 1-based for display
        isInPMS,
        isTodayInPMS,
        daysUntilPMS,
        daysRemainingInPMS,
      };
    } catch (error) {
      return null;
    }
  }, [pmsSafeEnabled, cycleDay1Date, cycleLength, pmsWindowLength, pmsWaterGoal]);

  if (loading) return <AppLayout><div className="max-w-2xl mx-auto space-y-6"><Skeleton className="h-20 w-full rounded-2xl"/><Skeleton className="h-64 w-full rounded-2xl"/></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2"><h1 className="text-3xl font-serif font-bold flex items-center gap-3"><Heart className="h-8 w-8 text-pms-accent"/>PMS-Safe Mode</h1><p className="text-muted-foreground">Adjust your challenge to work with your body.</p></div>
        
        {/* Dynamic PMS Status Card */}
        {pmsStatus && (
          <Card className={pmsStatus.isTodayInPMS ? "border-2 border-pms-accent bg-pms-background/50" : "border border-border"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Current Cycle Status
                </CardTitle>
                {pmsStatus.isTodayInPMS && (
                  <Badge className="bg-pms-accent/20 text-pms-accent border-pms-accent/30">
                    PMS Window Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Day in Cycle</span>
                  <span className="font-semibold text-lg">Day {pmsStatus.dayInCycle} of {cycleLength}</span>
                </div>
                {pmsStatus.isInPMS ? (
                  <div className="p-3 rounded-lg bg-pms-accent/10 border border-pms-accent/20">
                    <p className="text-sm font-medium text-pms-accent">
                      You're in your PMS window. {pmsStatus.daysRemainingInPMS > 0 ? `${pmsStatus.daysRemainingInPMS} day${pmsStatus.daysRemainingInPMS !== 1 ? 's' : ''} remaining.` : 'Last day of PMS window.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {pmsStatus.daysUntilPMS > 0 ? `${pmsStatus.daysUntilPMS} day${pmsStatus.daysUntilPMS !== 1 ? 's' : ''} until PMS window starts.` : 'PMS window will start soon.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-pms-accent/30 bg-pms-background/50"><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Enable PMS-Safe Mode</CardTitle><CardDescription>Gentler options during PMS window</CardDescription></div><Switch checked={pmsSafeEnabled} onCheckedChange={setPmsSafeEnabled} className="data-[state=checked]:bg-green-500"/></div></CardHeader></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Cycle Configuration</CardTitle></CardHeader><CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>Cycle Length (days)</Label><Input type="number" min={21} max={40} value={cycleLength} onChange={(e)=>setCycleLength(parseInt(e.target.value)||28)}/></div><div className="space-y-2"><Label>PMS Window (days)</Label><Input type="number" min={3} max={14} value={pmsWindowLength} onChange={(e)=>setPmsWindowLength(parseInt(e.target.value)||7)}/></div></div>
          <div className="space-y-2"><Label>Day 1 of Current Cycle</Label><Input type="date" value={cycleDay1Date} onChange={(e)=>setCycleDay1Date(e.target.value)}/></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5"/>During PMS Window</CardTitle></CardHeader><CardContent className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-xl"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Dumbbell className="h-5 w-5 text-primary"/></div><div><h4 className="font-medium">Workout 2 Substitution</h4><p className="text-sm text-muted-foreground mt-1">45-min Walk or 30-min Yoga</p></div></div>
          <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-xl"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Droplets className="h-5 w-5 text-primary"/></div><div className="flex-1"><h4 className="font-medium">Adjusted Water Goal</h4><div className="flex items-center gap-3 mt-2"><Input type="number" step={0.1} min={2} max={4} value={pmsWaterGoal} onChange={(e)=>setPmsWaterGoal(parseFloat(e.target.value)||3)} className="w-24"/><span className="text-sm text-muted-foreground">liters</span></div></div></div>
          <div className="flex items-start gap-4 p-4 bg-pms-background/50 rounded-xl border border-pms-accent/20"><div className="h-10 w-10 rounded-xl bg-pms-accent/10 flex items-center justify-center"><Heart className="h-5 w-5 text-pms-accent"/></div><div><h4 className="font-medium">Rest & Recovery Task</h4><p className="text-sm text-muted-foreground mt-1">Optional task encouraging self-care.</p></div></div>
        </CardContent></Card>
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full h-14 rounded-2xl"><Save className="h-5 w-5 mr-2"/>{saving?'Saving...':'Save Settings'}</Button>
      </div>
    </AppLayout>
  );
}