import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Play, Download, Clock, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface VideoJob {
  id: string;
  title: string;
  template: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  created_at: string;
  duration?: string;
  download_url?: string;
}

const TEMPLATES = [
  { value: 'slideshow', label: 'Prezentare fotografii' },
  { value: 'recap', label: 'Rezumat săptămânal' },
  { value: 'event', label: 'Eveniment special' },
  { value: 'promo', label: 'Promo / Reclamă' },
];

// Mock data for demo
const MOCK_JOBS: VideoJob[] = [
  { id: '1', title: 'Activități Ianuarie 2026', template: 'slideshow', status: 'ready', created_at: '2026-03-01T10:00:00Z', duration: '2:30', download_url: '#' },
  { id: '2', title: 'Serbare de Crăciun', template: 'event', status: 'generating', created_at: '2026-03-07T14:00:00Z' },
  { id: '3', title: 'Rezumat Februarie', template: 'recap', status: 'error', created_at: '2026-03-05T09:00:00Z' },
];

export default function VideoGenerationPage() {
  const [jobs, setJobs] = useState<VideoJob[]>(MOCK_JOBS);
  const [showCreate, setShowCreate] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', template: 'slideshow' });

  const handleCreate = () => {
    if (!newJob.title) { toast.error('Adaugă un titlu'); return; }
    const job: VideoJob = {
      id: Date.now().toString(),
      title: newJob.title,
      template: newJob.template,
      status: 'generating',
      created_at: new Date().toISOString(),
    };
    setJobs(prev => [job, ...prev]);
    setShowCreate(false);
    setNewJob({ title: '', template: 'slideshow' });
    toast.success('Generare video pornită! (Server VPS neconectat — simulare)');

    // Simulate completion after 5s
    setTimeout(() => {
      setJobs(prev => prev.map(j =>
        j.id === job.id
          ? { ...j, status: 'ready', duration: '1:45', download_url: '#' }
          : j
      ));
      toast.success(`Video "${job.title}" este gata!`);
    }, 5000);
  };

  const handleDelete = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const statusConfig: Record<string, { icon: any; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { icon: Clock, label: 'În așteptare', variant: 'outline' },
    generating: { icon: Clock, label: 'Se generează...', variant: 'secondary' },
    ready: { icon: CheckCircle2, label: 'Gata', variant: 'default' },
    error: { icon: AlertTriangle, label: 'Eroare', variant: 'destructive' },
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" /> Generare Video
          </h1>
          <p className="text-sm text-muted-foreground">{jobs.filter(j => j.status === 'ready').length} video-uri gata</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Generează Video</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Video nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Titlu</Label>
                <Input
                  value={newJob.title}
                  onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Activități Martie 2026"
                />
              </div>
              <div>
                <Label>Șablon</Label>
                <Select value={newJob.template} onValueChange={v => setNewJob(p => ({ ...p, template: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full gap-1.5">
                <Play className="h-4 w-4" /> Pornește generarea
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Server VPS neconectat — se va simula generarea
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {jobs.map(job => {
          const sc = statusConfig[job.status];
          const StatusIcon = sc.icon;
          return (
            <Card key={job.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                    job.status === 'generating' ? 'bg-primary/10 animate-pulse' :
                    job.status === 'ready' ? 'bg-primary/10' :
                    job.status === 'error' ? 'bg-destructive/10' : 'bg-muted'
                  }`}>
                    {job.status === 'generating' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Video className={`h-5 w-5 ${job.status === 'ready' ? 'text-primary' : job.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={sc.variant} className="text-[10px] gap-1">
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {TEMPLATES.find(t => t.value === job.template)?.label}
                      </span>
                      {job.duration && (
                        <span className="text-[10px] text-muted-foreground">· {job.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.status === 'ready' && job.download_url && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                      const link = document.createElement('a');
                      link.href = job.download_url!;
                      link.download = `video-${job.id}.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success('Descărcare inițiată!');
                    }}>
                      <Download className="h-4 w-4" /> Descarcă
                    </Button>
                  )}
                  {job.status === 'error' && (
                    <Button size="sm" variant="outline" onClick={() => {
                      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'generating' } : j));
                      setTimeout(() => {
                        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'ready', duration: '1:20', download_url: '#' } : j));
                      }, 3000);
                    }}>
                      Reîncearcă
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(job.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {jobs.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">Niciun video generat</p>
        )}
      </div>
    </div>
  );
}
