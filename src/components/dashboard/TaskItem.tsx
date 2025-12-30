import { Task, TaskKey } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Droplets, 
  BookOpen, 
  Apple, 
  Camera, 
  Sparkles,
  Info,
  Upload
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  isPMSWindow: boolean;
  onToggle: (taskId: string, completed: boolean) => void;
  onVariantChange?: (taskId: string, variant: string) => void;
}

const TASK_ICONS: Record<TaskKey, React.ReactNode> = {
  workout1: <Dumbbell className="h-5 w-5" />,
  workout2: <Dumbbell className="h-5 w-5" />,
  water: <Droplets className="h-5 w-5" />,
  read: <BookOpen className="h-5 w-5" />,
  diet: <Apple className="h-5 w-5" />,
  photo: <Camera className="h-5 w-5" />,
  rest_recovery: <Sparkles className="h-5 w-5" />,
};

const TASK_DETAILS: Record<TaskKey, string> = {
  workout1: 'Any physical activity for 45 minutes. One must be outdoors.',
  workout2: 'Second 45-minute workout of the day. One must be outdoors.',
  water: 'Drink one gallon (3.8L) of water throughout the day.',
  read: 'Read 10 pages of a non-fiction/self-improvement book.',
  diet: 'Stick to your chosen diet plan. No cheat meals or alcohol.',
  photo: 'Take a progress photo to track your transformation.',
  rest_recovery: 'Focus on rest and gentle recovery activities.',
};

export function TaskItem({ task, isPMSWindow, onToggle, onVariantChange }: TaskItemProps) {
  const showVariantSelector = isPMSWindow && task.key === 'workout2';
  
  const getDisplayTitle = () => {
    if (task.key === 'workout2' && task.variant) {
      return task.variant === 'walk' ? 'Walk (45 min)' : 'Yoga (30 min)';
    }
    return task.title;
  };

  return (
    <div className={cn(
      'group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 transition-all duration-200',
      task.completed && 'bg-primary/5 border-primary/20',
      !task.required && 'opacity-80'
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        className="h-6 w-6 rounded-lg"
      />
      
      <div className={cn(
        'flex items-center justify-center h-10 w-10 rounded-xl',
        task.completed ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
      )}>
        {TASK_ICONS[task.key]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            task.completed && 'line-through text-muted-foreground'
          )}>
            {getDisplayTitle()}
          </span>
          {!task.required && (
            <Badge variant="secondary" className="text-xs">Optional</Badge>
          )}
          {task.key === 'rest_recovery' && (
            <Badge className="bg-pms-accent/20 text-pms-accent text-xs">PMS-Safe</Badge>
          )}
        </div>
        
        {showVariantSelector && (
          <Select
            value={task.variant || 'normal'}
            onValueChange={(value) => onVariantChange?.(task.id, value)}
          >
            <SelectTrigger className="h-8 w-48 mt-2 text-sm">
              <SelectValue placeholder="Choose workout type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Standard (45 min workout)</SelectItem>
              <SelectItem value="walk">Walk (45 min)</SelectItem>
              <SelectItem value="yoga">Yoga (30 min)</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm">
            {TASK_DETAILS[task.key]}
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
