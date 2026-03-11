import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const guestMessageSchema = z.object({
  name: z.string().trim().min(2, 'Numele trebuie să aibă cel puțin 2 caractere').max(100),
  email: z.string().trim().email('Adresa de email nu este validă').max(255),
  message: z.string().trim().min(5, 'Mesajul trebuie să aibă cel puțin 5 caractere').max(2000),
});

interface GuestMessageFormProps {
  orgId: string;
  orgName?: string;
}

export default function GuestMessageForm({ orgId, orgName }: GuestMessageFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = guestMessageSchema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('guest_messages' as any)
        .insert({
          organization_id: orgId,
          sender_name: result.data.name,
          sender_email: result.data.email,
          mesaj: result.data.message,
        });

      if (error) throw error;
      setSent(true);
      toast.success('Mesajul a fost trimis cu succes!');
    } catch (err: any) {
      toast.error(err.message || 'Eroare la trimiterea mesajului');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Mesaj trimis!</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Mesajul tău a fost trimis către {orgName || 'instituție'}. Vei primi un răspuns pe email.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false);
            setName('');
            setEmail('');
            setMessage('');
          }}
        >
          Trimite alt mesaj
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Contactează-ne</h3>
            <p className="text-[11px] text-muted-foreground">Lasă un mesaj pentru {orgName || 'instituție'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="guest-name">Numele tău *</Label>
          <Input
            id="guest-name"
            placeholder="Ion Popescu"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-email">Adresa de email *</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="ion.popescu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            maxLength={255}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-message">Mesajul tău *</Label>
          <Textarea
            id="guest-message"
            placeholder="Scrie mesajul tău aici..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={2000}
            className="min-h-[120px]"
          />
          <p className="text-[11px] text-muted-foreground text-right">{message.length}/2000</p>
        </div>

        <Button
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Se trimite...' : 'Trimite mesajul'}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Vei primi un răspuns pe adresa de email indicată.
        </p>
      </div>
    </div>
  );
}
