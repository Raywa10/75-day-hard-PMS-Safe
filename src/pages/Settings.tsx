import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Palette, Save, LogOut, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { if (user) loadProfile(); setDarkMode(document.documentElement.classList.contains('dark')); }, [user]);

  async function loadProfile() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    if (data) setFullName(data.full_name || '');
    setLoading(false);
  }

  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (!error) toast({ title: 'Settings saved' });
    else toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    setSaving(false);
  }

  if (loading) return <AppLayout><div className="max-w-2xl mx-auto space-y-6"><Skeleton className="h-16 w-full rounded-2xl"/><Skeleton className="h-48 w-full rounded-2xl"/></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-serif font-bold">Settings</h1><p className="text-muted-foreground mt-1">Manage your account</p></div>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Profile</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email||''} disabled className="bg-muted"/></div>
          <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Your name"/></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/>Notifications</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-muted-foreground">Daily reminders</p></div><Switch checked={emailNotifications} onCheckedChange={setEmailNotifications}/></div>
          <Separator/>
          <div className="flex items-center justify-between"><div><p className="font-medium">Push Notifications</p><p className="text-sm text-muted-foreground">Device notifications</p></div><Switch checked={pushNotifications} onCheckedChange={setPushNotifications}/></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/>Appearance</CardTitle></CardHeader><CardContent>
          <div className="flex items-center justify-between"><div className="flex items-center gap-3">{darkMode?<Moon className="h-5 w-5"/>:<Sun className="h-5 w-5"/>}<div><p className="font-medium">Dark Mode</p></div></div><Switch checked={darkMode} onCheckedChange={toggleDarkMode}/></div>
        </CardContent></Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleSave} disabled={saving} className="flex-1 h-12 rounded-xl"><Save className="h-4 w-4 mr-2"/>{saving?'Saving...':'Save Changes'}</Button>
          <Button variant="outline" onClick={signOut} className="flex-1 h-12 rounded-xl text-destructive hover:text-destructive"><LogOut className="h-4 w-4 mr-2"/>Sign Out</Button>
        </div>
      </div>
    </AppLayout>
  );
}