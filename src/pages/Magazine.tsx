import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Newspaper, Plus, CheckCircle2, XCircle, Clock, Eye, Send, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { areRol } from '@/utils/roles';
import {
  getArticles, createArticle, updateArticle,
  type MagazineArticle
} from '@/api/magazine';
import { format } from 'date-fns';

const CATEGORIES = ['general', 'sport', 'cultura', 'stiinta', 'editorial', 'eveniment'];

export default function MagazinePage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const isReviewer = areRol(user?.status || '', 'profesor') || areRol(user?.status || '', 'director') || areRol(user?.status || '', 'administrator');
  const [articles, setArticles] = useState<MagazineArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [showReject, setShowReject] = useState<string | null>(null);
  const [newArt, setNewArt] = useState({ titlu: '', continut: '', categorie: 'general' });

  const reload = async () => {
    if (!orgId) return;
    const data = await getArticles(orgId);
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId]);

  const handleSubmit = async () => {
    if (!newArt.titlu || !newArt.continut || !orgId) { toast.error('Completează titlul și conținutul'); return; }
    try {
      await createArticle({
        organization_id: orgId,
        titlu: newArt.titlu,
        continut: newArt.continut,
        categorie: newArt.categorie,
        autor_id: user?.id || '',
        autor_nume: user?.nume_prenume || '',
        status: 'review',
      });
      toast.success('Articol trimis spre recenzie!');
      setShowSubmit(false);
      setNewArt({ titlu: '', continut: '', categorie: 'general' });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateArticle(id, { status: 'published', reviewer_id: user?.id, published_at: new Date().toISOString() } as any);
      toast.success('Articol publicat!');
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async (id: string) => {
    if (!reviewComment) { toast.error('Adaugă un comentariu'); return; }
    try {
      await updateArticle(id, { status: 'rejected', reviewer_id: user?.id, reviewer_comment: reviewComment } as any);
      toast.success('Articol respins cu feedback');
      setShowReject(null);
      setReviewComment('');
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!orgId) return null;
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const reviewQueue = articles.filter(a => a.status === 'review');
  const published = articles.filter(a => a.status === 'published');
  const myArticles = articles.filter(a => a.autor_id === user?.id);
  const rejected = articles.filter(a => a.status === 'rejected');

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Ciornă' },
      review: { variant: 'outline', label: 'În recenzie' },
      published: { variant: 'default', label: 'Publicat' },
      rejected: { variant: 'destructive', label: 'Respins' },
    };
    const s = map[status] || map.draft;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" /> Revista Școlii
          </h1>
          <p className="text-sm text-muted-foreground">{published.length} articole publicate</p>
        </div>
        <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Trimite articol</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Articol nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titlu</Label><Input value={newArt.titlu} onChange={e => setNewArt(p => ({ ...p, titlu: e.target.value }))} placeholder="Titlul articolului" /></div>
              <div>
                <Label>Categorie</Label>
                <Select value={newArt.categorie} onValueChange={v => setNewArt(p => ({ ...p, categorie: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conținut</Label>
                <Textarea rows={10} value={newArt.continut} onChange={e => setNewArt(p => ({ ...p, continut: e.target.value }))} placeholder="Scrie articolul aici..." />
              </div>
              <Button onClick={handleSubmit} className="w-full gap-1.5"><Send className="h-4 w-4" /> Trimite spre recenzie</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={isReviewer ? 'review' : 'published'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="published" className="gap-1.5"><Eye className="h-4 w-4" /> Publicate ({published.length})</TabsTrigger>
          {isReviewer && (
            <TabsTrigger value="review" className="gap-1.5">
              <Clock className="h-4 w-4" /> Recenzie ({reviewQueue.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="mine" className="gap-1.5"><Newspaper className="h-4 w-4" /> Articolele mele ({myArticles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          {published.map(a => (
            <ArticleCard key={a.id} article={a} statusBadge={statusBadge} />
          ))}
          {published.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun articol publicat</p>}
        </TabsContent>

        {isReviewer && (
          <TabsContent value="review" className="space-y-4">
            {reviewQueue.map(a => (
              <Card key={a.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold">{a.titlu}</p>
                        {statusBadge(a.status)}
                        <Badge variant="secondary">{a.categorie}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">de {a.autor_nume} · {format(new Date(a.created_at), 'dd.MM.yyyy')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{a.continut}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5" onClick={() => handleApprove(a.id)}>
                      <CheckCircle2 className="h-4 w-4" /> Aprobă
                    </Button>
                    <Dialog open={showReject === a.id} onOpenChange={open => { setShowReject(open ? a.id : null); setReviewComment(''); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="gap-1.5">
                          <XCircle className="h-4 w-4" /> Respinge
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Respinge articolul</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div><Label>Comentariu pentru autor</Label><Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Motivul respingerii..." /></div>
                          <Button variant="destructive" onClick={() => handleReject(a.id)} className="w-full">Respinge cu feedback</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
            {reviewQueue.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun articol în așteptare</p>}
          </TabsContent>
        )}

        <TabsContent value="mine" className="space-y-4">
          {myArticles.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{a.titlu}</p>
                  {statusBadge(a.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{a.continut}</p>
                {a.status === 'rejected' && a.reviewer_comment && (
                  <div className="mt-2 rounded-lg bg-destructive/10 p-3 flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-destructive">Feedback recenzor:</p>
                      <p className="text-xs text-destructive">{a.reviewer_comment}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {myArticles.length === 0 && <p className="text-center py-8 text-muted-foreground">Nu ai trimis articole</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ArticleCard({ article, statusBadge }: { article: MagazineArticle; statusBadge: (s: string) => JSX.Element }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-base font-semibold">{article.titlu}</p>
          {statusBadge(article.status)}
          <Badge variant="secondary">{article.categorie}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">de {article.autor_nume} · {article.published_at ? format(new Date(article.published_at), 'dd.MM.yyyy') : format(new Date(article.created_at), 'dd.MM.yyyy')}</p>
        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{article.continut}</p>
      </CardContent>
    </Card>
  );
}
