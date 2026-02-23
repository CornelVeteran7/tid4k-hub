import { useState, useEffect } from 'react';
import { getWhatsappMappings, syncStatus } from '@/api/whatsapp';
import type { WhatsappMapping } from '@/api/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function SocialMediaWhatsapp() {
  const [mappings, setMappings] = useState<WhatsappMapping[]>([]);
  const [status, setStatus] = useState<{ status: string; last_sync: string } | null>(null);

  useEffect(() => {
    getWhatsappMappings().then(setMappings);
    syncStatus().then(setStatus);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> WhatsApp
        </h1>
        <p className="text-muted-foreground">Sincronizare grupuri WhatsApp</p>
      </div>

      {status && (
        <Card>
          <CardHeader><CardTitle className="text-base">Status sincronizare</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <Badge className="bg-success text-success-foreground">{status.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Ultima sincronizare</span>
              <span>{format(new Date(status.last_sync), 'd MMM yyyy, HH:mm', { locale: ro })}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Mapări grupuri</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mappings.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{m.grupa} → {m.whatsapp_group}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{m.sync_type === 'bidirectional' ? 'Bidirecțional' : 'Unidirecțional'}</Badge>
                    {m.consent && <Badge className="bg-success text-success-foreground text-xs">Consimțământ</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
