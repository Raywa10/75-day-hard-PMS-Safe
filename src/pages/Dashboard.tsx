import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your daily progress</p>
        </div>
        
        <Card className="rounded-3xl shadow-soft">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Set up your Supabase database tables to start tracking. See SQL migrations below.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
