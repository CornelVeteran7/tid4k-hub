import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Camera, MapPin, AlertTriangle, Clock, ArrowRight, HardHat, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getTasks, updateTask, type ConstructionTask } from '@/api/construction';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function ConstructionWorker() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadTasks = async () => {
    if (!orgId) return;
    try {
      const all = await getTasks(orgId);
      // Worker sees only active tasks (today or no date, not done)
      const filtered = all.filter(t =>
        t.status !== 'done' && (!t.data_limita || t.data_limita <= today)
      );
      setTasks(filtered);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, [orgId]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTask(id, {
        status,
        ...(status === 'done' ? {
          completed_at: new Date().toISOString(),
          completed_by: user?.nume_prenume || ''
        } : {}),
      });
      toast.success(status === 'done' ? '✅ GATA!' : 'Actualizat');
      loadTasks();
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePhotoUpload = async (taskId: string, file: File) => {
    setUploading(taskId);
    try {
      const ext = file.name.split('.').pop();
      const path = `tasks/${taskId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('construction-photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('construction-photos')
        .getPublicUrl(path);

      await updateTask(taskId, { photo_url: publicUrl });
      toast.success('📸 Poză încărcată!');
      loadTasks();
    } catch (e: any) { toast.error(e.message); }
    setUploading(null);
  };

  const triggerPhoto = (taskId: string) => {
    setActiveTaskId(taskId);
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeTaskId) {
      handlePhotoUpload(activeTaskId, file);
    }
    e.target.value = '';
  };

  if (!orgId) return null;
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  const overdue = tasks.filter(t => t.data_limita && t.data_limita < today);
  const todayTasks = tasks.filter(t => !overdue.includes(t));

  return (
    <div className="space-y-4 pb-24 px-1">
      {/* Hidden file input for camera */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Header — big, bold */}
      <div className="text-center pt-2">
        <HardHat className="h-10 w-10 text-primary mx-auto" />
        <h1 className="text-2xl font-bold mt-2">Taskurile Mele</h1>
        <p className="text-base text-muted-foreground">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: ro })}</p>
      </div>

      {/* Overdue warning */}
      {overdue.length > 0 && (
        <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 p-4">
          <p className="text-lg font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> {overdue.length} ÎNTÂRZIATE
          </p>
        </div>
      )}

      {/* Task count */}
      <div className="text-center">
        <p className="text-4xl font-bold text-primary">{tasks.length}</p>
        <p className="text-lg text-muted-foreground">taskuri de făcut</p>
      </div>

      {/* Tasks — BIG cards */}
      <div className="space-y-4">
        {[...overdue, ...todayTasks].sort((a, b) => {
          if (a.prioritate === 'urgent' && b.prioritate !== 'urgent') return -1;
          if (b.prioritate === 'urgent' && a.prioritate !== 'urgent') return 1;
          return 0;
        }).map(task => {
          const isOverdue = task.data_limita && task.data_limita < today;
          return (
            <Card
              key={task.id}
              className={`overflow-hidden ${
                isOverdue ? 'border-2 border-destructive' :
                task.prioritate === 'urgent' ? 'border-2 border-orange-400' : ''
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Title + badges */}
                <div>
                  <div className="flex items-start gap-2 flex-wrap">
                    <h2 className="text-xl font-bold leading-tight">{task.titlu}</h2>
                    {task.prioritate === 'urgent' && (
                      <Badge variant="destructive" className="text-sm px-3 py-1">URGENT</Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="text-sm px-3 py-1 gap-1">
                        <AlertTriangle className="h-4 w-4" /> ÎNTÂRZIAT
                      </Badge>
                    )}
                  </div>
                  {task.descriere && (
                    <p className="text-base text-muted-foreground mt-2">{task.descriere}</p>
                  )}
                </div>

                {/* Location & deadline — big text */}
                <div className="flex flex-wrap gap-3 text-base">
                  {task.locatie && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-5 w-5" /> {task.locatie}
                    </span>
                  )}
                  {task.data_limita && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-5 w-5" /> {task.data_limita}
                    </span>
                  )}
                </div>

                {/* Photo proof if exists */}
                {task.photo_url && (
                  <img src={task.photo_url} alt="Dovadă" className="w-full h-48 object-cover rounded-xl" />
                )}

                {/* BIG action buttons */}
                <div className="grid grid-cols-1 gap-3">
                  {task.status === 'todo' && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-16 text-lg font-bold gap-3"
                      onClick={() => handleStatusChange(task.id, 'in_progress')}
                    >
                      <ArrowRight className="h-7 w-7" /> ÎNCEP LUCRUL
                    </Button>
                  )}

                  {/* Photo button */}
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-16 text-lg font-bold gap-3"
                    disabled={uploading === task.id}
                    onClick={() => triggerPhoto(task.id)}
                  >
                    {uploading === task.id ? (
                      <><Loader2 className="h-7 w-7 animate-spin" /> Se încarcă...</>
                    ) : (
                      <><Camera className="h-7 w-7" /> 📸 POZĂ</>
                    )}
                  </Button>

                  {/* Done button — biggest */}
                  <Button
                    size="lg"
                    className="h-20 text-xl font-bold gap-3 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(task.id, 'done')}
                  >
                    <CheckCircle2 className="h-8 w-8" /> AM TERMINAT ✓
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <p className="text-2xl font-bold mt-4">Totul e gata!</p>
          <p className="text-lg text-muted-foreground mt-2">Nu ai taskuri pentru azi.</p>
        </div>
      )}
    </div>
  );
}
