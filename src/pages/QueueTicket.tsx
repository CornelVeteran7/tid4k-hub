import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, CheckCircle2, Bell, Timer } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ro } from 'date-fns/locale';

interface OrgInfo {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  vertical_type: string;
}

interface QueueEntry {
  id: string;
  numar_tichet: number;
  status: string;
  cabinet: string | null;
  created_at: string;
  called_at: string | null;
}

export default function QueueTicket() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [myTicket, setMyTicket] = useState<QueueEntry | null>(null);
  const [waitingAhead, setWaitingAhead] = useState(0);
  const [estimatedWaitMin, setEstimatedWaitMin] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const todayStart = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00';
  const ticketKey = `queue_ticket_${orgSlug}`;

  const loadOrg = useCallback(async () => {
    // Try slug first, then name fallback
    let { data } = await supabase
      .from('organizations')
      .select('id, name, logo_url, primary_color, vertical_type')
      .eq('slug', orgSlug || '')
      .maybeSingle();
    if (!data) {
      ({ data } = await supabase
        .from('organizations')
        .select('id, name, logo_url, primary_color, vertical_type')
        .eq('name', orgSlug || '')
        .maybeSingle());
    }
    if (data) setOrg(data as OrgInfo);
    setLoading(false);
    return data as OrgInfo | null;
  }, [orgSlug]);

  const loadTicketStatus = useCallback(async (ticketId: string, orgId: string) => {
    const { data: ticket } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (!ticket || ticket.status === 'completed') {
      setMyTicket(null);
      sessionStorage.removeItem(ticketKey);
      return;
    }

    setMyTicket(ticket as QueueEntry);

    if (ticket.status === 'waiting') {
      const { count } = await supabase
        .from('queue_entries')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'waiting')
        .lt('numar_tichet', ticket.numar_tichet)
        .gte('created_at', todayStart);
      const ahead = count || 0;
      setWaitingAhead(ahead);

      // Get avg service time from config or estimate from completed
      const { data: qConfig } = await supabase
        .from('queue_config')
        .select('avg_service_minutes')
        .eq('organization_id', orgId)
        .maybeSingle();
      const avgMin = qConfig?.avg_service_minutes || 10;
      setEstimatedWaitMin(ahead * avgMin);
    }
  }, [ticketKey, todayStart]);

  useEffect(() => {
    (async () => {
      const orgData = await loadOrg();
      if (!orgData) return;
      const savedId = sessionStorage.getItem(ticketKey);
      if (savedId) {
        await loadTicketStatus(savedId, orgData.id);
      }
    })();
  }, [loadOrg, ticketKey, loadTicketStatus]);

  // Realtime updates for my ticket
  useEffect(() => {
    if (!org || !myTicket) return;
    const channel = supabase
      .channel(`my-ticket-${myTicket.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queue_entries',
        filter: `id=eq.${myTicket.id}` }, (payload) => {
        const updated = payload.new as QueueEntry;
        setMyTicket(updated);
        if (updated.status === 'called' || updated.status === 'serving') {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
          try { new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA').play(); } catch {}
        }
        if (updated.status === 'completed') {
          sessionStorage.removeItem(ticketKey);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [org, myTicket?.id, ticketKey]);

  // Refresh waiting count periodically
  useEffect(() => {
    if (!org || !myTicket || myTicket.status !== 'waiting') return;
    const interval = setInterval(() => loadTicketStatus(myTicket.id, org.id), 10000);
    return () => clearInterval(interval);
  }, [org, myTicket, loadTicketStatus]);

  const generateTicket = async () => {
    if (!org) return;
    setGenerating(true);

    // Use atomic DB function to prevent race conditions on ticket numbers
    const { data, error } = await supabase.rpc('generate_queue_ticket', {
      _org_id: org.id,
    });

    if (error || !data || data.length === 0) {
      console.error('Ticket generation failed:', error);
      setGenerating(false);
      return;
    }

    const ticket = data[0] as QueueEntry;
    setMyTicket(ticket);
    sessionStorage.setItem(ticketKey, ticket.id);

    const { count } = await supabase
      .from('queue_entries')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .eq('status', 'waiting')
      .lt('numar_tichet', ticket.numar_tichet)
      .gte('created_at', todayStart);
    const ahead = count || 0;
    setWaitingAhead(ahead);

    const { data: qConfig } = await supabase
      .from('queue_config')
      .select('avg_service_minutes')
      .eq('organization_id', org.id)
      .maybeSingle();
    setEstimatedWaitMin(ahead * (qConfig?.avg_service_minutes || 10));

    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Organizație negăsită</p>
      </div>
    );
  }

  const primaryColor = org.primary_color || '#4F46E5';
  const isMedicine = org.vertical_type === 'medicine';
  const emptyIcon = isMedicine ? '🏥' : '🎓';
  const serviceLabel = isMedicine ? 'cabinet' : 'ghișeu';

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="text-center px-4 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${primaryColor}18, transparent)` }}>
        {org.logo_url && (
          <img src={org.logo_url} alt="" className="h-16 w-16 mx-auto rounded-xl object-contain mb-3"
            style={{ background: `${primaryColor}15`, padding: 6 }} />
        )}
        <h1 className="text-2xl font-display font-bold text-foreground">{org.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMedicine ? 'Sistem de gestionare coadă' : 'Sistem de gestionare coadă secretariat'}
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 pb-8 space-y-6">
        {!myTicket ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 rounded-full mx-auto flex items-center justify-center mb-6"
              style={{ background: `${primaryColor}15` }}>
              <Ticket className="h-12 w-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Ia un număr de ordine</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Apasă butonul pentru a primi un tichet. Vei fi notificat când este rândul tău.
            </p>
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6"
              onClick={generateTicket}
              disabled={generating}
            >
              {generating ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Ticket className="h-5 w-5" />
              )}
              Generează tichet
            </Button>
          </div>
        ) : myTicket.status === 'called' || myTicket.status === 'serving' ? (
          <Card className="border-2 border-primary animate-pulse">
            <CardContent className="p-8 text-center">
              <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4 bg-primary/10">
                <Bell className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Este rândul dumneavoastră!</h2>
              <div className="text-6xl font-bold text-foreground my-4">#{myTicket.numar_tichet}</div>
              {myTicket.cabinet && (
                <Badge className="text-lg px-4 py-1" variant="default">
                  → {myTicket.cabinet}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Vă rugăm prezentați-vă la {myTicket.cabinet || serviceLabel}
              </p>
            </CardContent>
          </Card>
        ) : myTicket.status === 'skipped' ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-muted-foreground mb-2">#{myTicket.numar_tichet}</div>
              <Badge variant="secondary">Omis</Badge>
              <p className="text-sm text-muted-foreground mt-4">
                Tichetul a fost omis. Vă rugăm prezentați-vă la recepție.
              </p>
              <Button className="mt-4" onClick={() => {
                setMyTicket(null);
                sessionStorage.removeItem(ticketKey);
              }}>
                Ia alt tichet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-muted">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Tichetul dumneavoastră</p>
              <div className="text-6xl font-bold text-foreground my-4">#{myTicket.numar_tichet}</div>
              <Badge variant="secondary" className="text-sm">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {waitingAhead === 0 ? 'Sunteți următorul!' : `${waitingAhead} persoane înaintea dvs.`}
              </Badge>
              {estimatedWaitMin > 0 && waitingAhead > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-primary">
                  <Timer className="h-4 w-4" />
                  <span>Estimare: ~{estimatedWaitMin} minute</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Ora emitere: {format(new Date(myTicket.created_at), 'HH:mm', { locale: ro })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Veți fi notificat când este rândul dumneavoastră.
                Nu părăsiți această pagină.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground">
          🔒 Nu se colectează date personale. Se folosesc doar numere de ordine.
        </p>
      </div>
    </div>
  );
}
