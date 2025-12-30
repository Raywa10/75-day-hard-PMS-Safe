import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Target, Heart } from 'lucide-react';

interface StatsHeaderProps {
  dayNumber: number;
  streak: number;
  completionRate: number;
  isPMSSafe: boolean;
}

export function StatsHeader({ dayNumber, streak, completionRate, isPMSSafe }: StatsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Day {dayNumber} of 75
          </h1>
          <p className="text-muted-foreground mt-1">
            Consistency compounds.
          </p>
        </div>
        
        {isPMSSafe && (
          <Badge className="bg-pms-accent/20 text-pms-accent border-pms-accent/30 px-4 py-1.5">
            <Heart className="h-4 w-4 mr-2 fill-current" />
            PMS-Safe Mode Active
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dayNumber}</p>
              <p className="text-xs text-muted-foreground">Current Day</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{dayNumber}/75 days</span>
        </div>
        <Progress value={(dayNumber / 75) * 100} className="h-3 rounded-full" />
      </div>
    </div>
  );
}
