import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Banknote } from 'lucide-react';
import { getCashDeclarations, confirmCashDeclaration, type CashDeclaration } from '@/api/contributions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Props {
  month: number;
  year: number;
  groupId?: string;
}

export default function AdminCashDeclarations({ month, year, groupId }: Props) {
  const [declarations, setDeclarations] = useState<CashDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDeclarations = async () => {
    setLoading(true);
    try {
      const data = await getCashDeclarations(month, year, groupId);
      setDeclarations(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeclarations();
  }, [month, year, groupId]);

  const handleConfirm = async (id: string, confirmed: boolean) => {
    setProcessingId(id);
    try {
      await confirmCashDeclaration(id, confirmed);
      toast.success(confirmed ? 'Plata confirmată!' : 'Plata respinsă.');
      fetchDeclarations();
    } catch {
      toast.error('Eroare la procesarea declarației');
    }
    setProcessingId(null);
  };

  const pending = declarations.filter(d => d.status === 'declared');
  const processed = declarations.filter(d => d.status !== 'declared');

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (declarations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nu există declarații cash pentru această perioadă.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending declarations */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4 text-amber-500" />
            Declarații în așteptare ({pending.length})
          </h3>
          {pending.map(d => (
            <Card key={d.id} className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.child_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.group_name} · Declarat de {d.declared_by_name} · {format(new Date(d.created_at), 'd MMM yyyy', { locale: ro })}
                  </p>
                  {d.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">"{d.notes}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-bold text-sm">{d.amount} lei</Badge>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleConfirm(d.id, true)}
                    disabled={processingId === d.id}
                  >
                    {processingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Confirmă
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={() => handleConfirm(d.id, false)}
                    disabled={processingId === d.id}
                  >
                    <X className="h-3 w-3" /> Respinge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Istoric declarații</h3>
          {processed.map(d => (
            <Card key={d.id} className="opacity-70">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.child_name} — {d.group_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.amount} lei · {d.declared_by_name}
                    {d.notes && ` · "${d.notes}"`}
                  </p>
                </div>
                <Badge variant={d.status === 'confirmed' ? 'default' : 'destructive'} className={d.status === 'confirmed' ? 'bg-emerald-600' : ''}>
                  {d.status === 'confirmed' ? 'Confirmat' : 'Respins'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
