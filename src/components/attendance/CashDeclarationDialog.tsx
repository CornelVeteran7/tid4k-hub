import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Banknote } from 'lucide-react';
import { declareCashPayment } from '@/api/contributions';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
  month: number;
  year: number;
  suggestedAmount: number;
  onSuccess: () => void;
}

const MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];

export default function CashDeclarationDialog({
  open, onOpenChange, childId, childName, month, year, suggestedAmount, onSuccess
}: Props) {
  const [amount, setAmount] = useState(suggestedAmount);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast.error('Introduceți o sumă validă');
      return;
    }
    setSaving(true);
    try {
      await declareCashPayment(childId, month, year, amount, notes);
      toast.success('Plata cash a fost declarată. Așteaptă confirmarea staff-ului.');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error('Eroare la declararea plății');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Declară plată cash
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {childName} — {MONTHS[month - 1]} {year}
          </p>
          <div>
            <Label className="text-xs">Sumă plătită (lei)</Label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Notițe (opțional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Plătit la secretariat pe 15 martie"
              className="mt-1 h-20"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Declarația va fi trimisă pentru confirmare de către secretariat/administrator.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
            Declară plata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
