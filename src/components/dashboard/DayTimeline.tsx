import { cn } from '@/lib/utils';
import { ChallengeDay } from '@/types/database';
import { Check, Circle, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DayTimelineProps {
  days: ChallengeDay[];
  currentDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export function DayTimeline({ days, currentDayNumber, onSelectDay }: DayTimelineProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="grid grid-cols-5 gap-2">
        {days.map((day) => {
          const isFuture = day.date > today;
          const isCurrent = day.day_number === currentDayNumber;
          const isCompleted = day.is_completed;

          return (
            <button
              key={day.id}
              onClick={() => !isFuture && onSelectDay(day.day_number)}
              disabled={isFuture}
              className={cn(
                'relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200',
                isFuture && 'bg-muted/50 text-muted-foreground cursor-not-allowed',
                isCompleted && !isCurrent && 'bg-primary/20 text-primary',
                isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                !isCompleted && !isFuture && !isCurrent && 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              )}
            >
              {isFuture ? (
                <Lock className="h-3 w-3" />
              ) : isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                day.day_number
              )}
              <span className="absolute -bottom-5 text-xs text-muted-foreground">
                {isCurrent && 'Today'}
              </span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
