import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Save } from 'lucide-react';

interface NotesAreaProps {
  notes: string;
  onSave: (notes: string) => void;
}

export function NotesArea({ notes, onSave }: NotesAreaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);

  const handleSave = () => {
    onSave(localNotes);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">Today's Notes</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Note</DialogTitle>
            </DialogHeader>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="How are you feeling today? Any thoughts or reflections..."
              className="min-h-[150px]"
            />
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      {notes ? (
        <p className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3 line-clamp-3">
          {notes}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic">
          No notes for today yet...
        </p>
      )}
    </div>
  );
}
