import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, FileText, MessageSquare, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface PublicAnnouncement {
  id: string;
  titlu: string;
  continut: string;
  prioritate: string;
  created_at: string;
}

export default function QRCancelarie() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [orgName, setOrgName] = useState(orgSlug || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Load org info
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('name', orgSlug || '')
        .maybeSingle();
      if (org) setOrgName(org.name);

      // Load public announcements (non-expired, not hidden)
      const { data } = await supabase
        .from('announcements')
        .select('id, titlu, continut, prioritate, created_at')
        .eq('ascuns_banda', false)
        .or('data_expirare.is.null,data_expirare.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      setAnnouncements(data || []);
      setLoading(false);
    }
    load();
  }, [orgSlug]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{orgName}</h1>
        <p className="text-muted-foreground text-sm">Informații publice</p>
        {isAuthenticated && (
          <Badge className="mt-2 bg-success text-success-foreground">
            <Shield className="h-3 w-3 mr-1" /> Conectat ca {user?.nume_prenume}
          </Badge>
        )}
      </div>

      {/* Public section: Announcements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Anunțuri
        </h2>
        {announcements.length === 0 ? (
          <Card><CardContent className="p-4 text-center text-muted-foreground">Nu sunt anunțuri recente</CardContent></Card>
        ) : (
          announcements.map(ann => (
            <Card key={ann.id} className={ann.prioritate === 'urgent' ? 'border-destructive/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{ann.titlu}</h3>
                      {ann.prioritate === 'urgent' && (
                        <Badge variant="destructive" className="text-xs">⚠️ Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{ann.continut}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(ann.created_at), 'd MMMM yyyy, HH:mm', { locale: ro })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Authenticated section: personal info */}
      {isAuthenticated && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Informații personale
          </h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Mesaje necitite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuthenticatedMessages userId={user?.id || ''} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documente recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuthenticatedDocuments />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Orar azi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Consultă orarul complet din aplicație.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-muted/50 rounded-xl text-center">
          <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Conectează-te pentru a vedea mesaje, documente și informații personale.
          </p>
          <a href="/login" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
            Autentifică-te →
          </a>
        </div>
      )}
    </div>
  );
}

function AuthenticatedMessages({ userId }: { userId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('citit', false)
      .neq('sender_id', userId)
      .then(({ count }) => setCount(count || 0));
  }, [userId]);

  if (count === null) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;
  return (
    <p className="text-sm">
      {count > 0 ? (
        <span className="font-semibold text-destructive">{count} mesaje necitite</span>
      ) : (
        <span className="text-muted-foreground">Niciun mesaj necitit</span>
      )}
    </p>
  );
}

function AuthenticatedDocuments() {
  const [docs, setDocs] = useState<{ nume_fisier: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from('documents')
      .select('nume_fisier, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setDocs(data || []));
  }, []);

  if (docs.length === 0) return <p className="text-sm text-muted-foreground">Niciun document recent</p>;
  return (
    <ul className="space-y-1">
      {docs.map((d, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">{d.nume_fisier}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {format(new Date(d.created_at), 'd MMM', { locale: ro })}
          </span>
        </li>
      ))}
    </ul>
  );
}
