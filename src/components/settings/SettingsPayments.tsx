import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getStripeConnectStatus } from '@/api/contributions';
import { toast } from 'sonner';

interface Props {
  orgId: string;
}

export default function SettingsPayments({ orgId }: Props) {
  const [status, setStatus] = useState<string>('not_connected');
  const [bankName, setBankName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStripeConnectStatus().then(data => {
      if (data) {
        setStatus(data.status);
        setBankName(data.bank_name);
      }
      setLoading(false);
    });
  }, []);

  const handleConnect = () => {
    toast.info(
      'Funcționalitatea Stripe Connect va fi disponibilă în curând. Veți putea conecta contul bancar al instituției pentru a primi plăți online direct.',
      { duration: 6000 }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Plăți & Cont Bancar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configurați recepția plăților online de la părinți prin Stripe Connect.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Cont bancar instituție</h3>
              <div className="flex items-center gap-2 mt-1">
                {status === 'active' ? (
                  <Badge variant="default" className="gap-1 bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Conectat
                  </Badge>
                ) : status === 'pending' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> În curs de verificare
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> Neconectat
                  </Badge>
                )}
                {bankName && <span className="text-sm text-muted-foreground">{bankName}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Conectând contul bancar, veți putea primi plăți online direct de la părinți. 
                Platforma reține un comision de <strong>2.5%</strong> din fiecare tranzacție, 
                iar Stripe percepe un comision suplimentar de procesare (~1.4% + 0.25€ per tranzacție).
              </p>
              <Button className="mt-4 gap-2" onClick={handleConnect}>
                <CreditCard className="h-4 w-4" />
                {status === 'not_connected' ? 'Conectează cu Stripe' : 'Gestionează contul'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-sm">Cum funcționează?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Conectați contul</strong> — Creați sau conectați un cont Stripe al instituției.</p>
            <p>2. <strong>Părinții plătesc online</strong> — Contribuția alimentară lunară, direct din aplicație.</p>
            <p>3. <strong>Primiți banii</strong> — Sumele sunt transferate automat în contul bancar conectat.</p>
          </div>
          <div className="border-t pt-3 mt-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comisioane</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comision platformă:</span>
                <span className="font-medium">2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procesare Stripe:</span>
                <span className="font-medium">~1.4% + 0.25€</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
