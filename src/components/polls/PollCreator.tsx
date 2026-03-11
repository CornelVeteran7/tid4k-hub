import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { createPoll } from '@/api/polls';

interface PollCreatorProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  orgId: string;
  isDemo: boolean;
  onCreated: () => void;
}

export default function PollCreator({ open, onClose, userId, orgId, isDemo, onCreated }: PollCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState<'single' | 'multiple' | 'free_text'>('single');
  const [resultsVisibility, setResultsVisibility] = useState<'always' | 'after_vote' | 'after_close'>('after_vote');
  const [deadline, setDeadline] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => setOptions(prev => [...prev, '']);
  const removeOption = (idx: number) => setOptions(prev => prev.filter((_, i) => i !== idx));
  const updateOption = (idx: number, val: string) => setOptions(prev => prev.map((o, i) => i === idx ? val : o));

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Titlul este obligatoriu'); return; }
    if (!deadline) { toast.error('Data limită este obligatorie'); return; }
    if (new Date(deadline) <= new Date()) { toast.error('Data limită trebuie să fie în viitor'); return; }

    const validOptions = options.filter(o => o.trim());
    if (pollType !== 'free_text' && validOptions.length < 2) {
      toast.error('Adaugă cel puțin 2 opțiuni');
      return;
    }

    setSubmitting(true);
    try {
      if (!isDemo) {
        await createPoll({
          organization_id: orgId,
          title: title.trim(),
          description: description.trim() || undefined,
          poll_type: pollType,
          results_visibility: resultsVisibility,
          deadline: new Date(deadline).toISOString(),
          created_by: userId,
          options: validOptions,
        });
      }
      toast.success('Sondaj creat cu succes!');
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Eroare la crearea sondajului');
    } finally {
      setSubmitting(false);
    }
  };

  // Min date for deadline input (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sondaj nou</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titlu *</Label>
            <Input
              placeholder="Întrebarea sondajului..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descriere (opțional)</Label>
            <Textarea
              placeholder="Context suplimentar..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              className="min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tip sondaj</Label>
              <Select value={pollType} onValueChange={v => setPollType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Alegere unică</SelectItem>
                  <SelectItem value="multiple">Alegere multiplă</SelectItem>
                  <SelectItem value="free_text">Text liber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Vizibilitate rezultate</Label>
              <Select value={resultsVisibility} onValueChange={v => setResultsVisibility(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Mereu vizibile</SelectItem>
                  <SelectItem value="after_vote">După vot</SelectItem>
                  <SelectItem value="after_close">După închidere</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Data limită *</Label>
            <Input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={minDate}
            />
          </div>

          {pollType !== 'free_text' && (
            <div className="space-y-2">
              <Label>Opțiuni</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <Input
                    placeholder={`Opțiunea ${idx + 1}`}
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                    maxLength={200}
                  />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => removeOption(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1.5 w-full">
                  <Plus className="h-3.5 w-3.5" />
                  Adaugă opțiune
                </Button>
              )}
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Se creează...' : 'Creează sondaj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
