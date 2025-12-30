import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function Log() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Daily Log</h1>
        <Card className="rounded-3xl shadow-soft">
          <CardContent className="p-8 text-center text-muted-foreground">
            Select a day to edit your log entries.
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
