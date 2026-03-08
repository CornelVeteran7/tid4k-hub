import { useState, useEffect } from 'react';
import { getFacebookSettings, getPostLog, postToFacebook } from '@/api/facebook';
import type { FacebookPost } from '@/api/facebook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Facebook, Plus, Link, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

export default function SocialMediaFacebook() {
  const [settings, setSettings] = useState<{ page_id: string; token_status: string } | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [pageId, setPageId] = useState('');
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    getFacebookSettings().then(s => { setSettings(s); setPageId(s.page_id); });
    getPostLog().then(setPosts);
  }, []);

  const handleSaveConfig = () => {
    setSettings(prev => prev ? { ...prev, page_id: pageId } : { page_id: pageId, token_status: 'activ' });
    setShowConfig(false);
    toast.success('Configurare Facebook salvată!');
  };

  const handlePost = async () => {
    if (!postContent) { toast.error('Scrie conținutul postării'); return; }
    try {
      const post = await postToFacebook(postContent);
      setPosts(prev => [post, ...prev]);
      setShowPost(false);
      setPostContent('');
      toast.success('Postare publicată pe Facebook!');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Facebook className="h-6 w-6 text-primary" /> Facebook
          </h1>
          <p className="text-muted-foreground text-sm">Integrare pagina Facebook</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1.5"><Settings2 className="h-4 w-4" /> Configurare</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Configurare Facebook</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Page ID</Label>
                  <Input value={pageId} onChange={e => setPageId(e.target.value)} placeholder="Ex: 123456789" />
                </div>
                <div>
                  <Label>Token Status</Label>
                  <Badge className={settings?.token_status === 'activ' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                    {settings?.token_status || 'neconfigurat'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Conectarea reală la Facebook Graph API necesită configurarea unui token de acces în Supabase Edge Functions.
                </p>
                <Button onClick={handleSaveConfig} className="w-full">Salvează</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showPost} onOpenChange={setShowPost}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> Postare nouă</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Postare Facebook</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Conținut</Label>
                  <Textarea
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    rows={5}
                    placeholder="Scrie postarea..."
                  />
                </div>
                <Button onClick={handlePost} className="w-full gap-1.5">
                  <Facebook className="h-4 w-4" /> Publică
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {settings && (
        <Card>
          <CardHeader><CardTitle className="text-base">Status conexiune</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Page ID</span><span className="font-mono">{settings.page_id || '—'}</span></div>
            <div className="flex justify-between">
              <span>Token</span>
              <Badge className={settings.token_status === 'activ' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                {settings.token_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Jurnal postări ({posts.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{post.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(post.posted_at), 'd MMM yyyy, HH:mm', { locale: ro })}</p>
                </div>
                <Badge variant={post.status === 'posted' ? 'default' : 'destructive'} className={post.status === 'posted' ? 'bg-success text-success-foreground' : ''}>
                  {post.status === 'posted' ? 'Publicat' : post.status}
                </Badge>
              </div>
            ))}
            {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nicio postare</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
