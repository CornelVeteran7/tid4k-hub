import { useState, useEffect } from 'react';
import { getFacebookSettings, getPostLog } from '@/api/facebook';
import type { FacebookPost } from '@/api/facebook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Facebook } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function SocialMediaFacebook() {
  const [settings, setSettings] = useState<{ page_id: string; token_status: string } | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);

  useEffect(() => {
    getFacebookSettings().then(setSettings);
    getPostLog().then(setPosts);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Facebook className="h-6 w-6" /> Facebook
        </h1>
        <p className="text-muted-foreground">Integrare pagina Facebook</p>
      </div>

      {settings && (
        <Card>
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Page ID</span><span className="font-mono">{settings.page_id}</span></div>
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
        <CardHeader><CardTitle className="text-base">Jurnal postări</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.map((post) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
