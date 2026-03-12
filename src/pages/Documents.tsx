import { useState, useEffect, useCallback } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { isStaff } from '@/utils/roles';
import { getDocuments, deleteDocument } from '@/api/documents';
import { API_BASE_URL, API_KEY } from '@/api/config';
import type { DocumentItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Upload, FileText, Image, Download, Trash2, Grid, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'activitati', label: 'Activități' },
  { value: 'administrativ', label: 'Administrativ' },
  { value: 'teme', label: 'Teme' },
  { value: 'fotografii', label: 'Fotografii' },
];

export default function Documents({ embedded }: { embedded?: boolean }) {
  const { currentGroup } = useGroup();
  const { user } = useAuth();
  const canManage = isStaff(user?.status || '', user?.nume_prenume || '');
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);

  // Incarca toate documentele o singura data, filtram local
  useEffect(() => {
    if (!currentGroup) return;
    setLoading(true);
    getDocuments(currentGroup.id).then((docs) => {
      setAllDocuments(docs);
      setLoading(false);
    });
  }, [currentGroup]);

  // Filtrare locala pe categorie
  const documents = category === 'all'
    ? allDocuments
    : allDocuments.filter(d => d.categorie === category);

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setAllDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document șters.');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {!embedded && (
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Documente</h1>
            <p className="text-muted-foreground text-sm">{currentGroup?.nume}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          {canManage && (
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" size="sm"><Upload className="h-4 w-4" /> Încarcă</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Încarcă document</DialogTitle>
                </DialogHeader>
                <UploadForm
                  groupId={currentGroup?.id || ''}
                  onUploaded={(doc) => {
                    setAllDocuments(prev => [doc, ...prev]);
                    setUploadOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Category Filter - horizontal scroll on mobile */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {[{ value: 'all', label: 'Toate' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Documents Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {documents.map((doc) => (
            <Card key={doc.id} className="glass-card overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                {/* Thumbnail */}
                <div className={`${viewMode === 'grid' ? 'mb-3 h-28' : 'h-12 w-12 shrink-0'} rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden`}>
                  {doc.thumbnail_url || (doc.url && doc.tip_fisier !== 'pdf') ? (
                    <img
                      src={doc.thumbnail_url || doc.url}
                      alt={doc.nume_fisier}
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : doc.tip_fisier === 'pdf' ? (
                    <FileText className="h-8 w-8 text-destructive" />
                  ) : (
                    <Image className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.nume_fisier}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{CATEGORIES.find((c) => c.value === doc.categorie)?.label}</Badge>
                    <span className="text-xs text-muted-foreground">{formatSize(doc.marime)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {doc.uploadat_de} · {format(new Date(doc.data_upload), 'd MMM yyyy', { locale: ro })}
                  </p>
                </div>
                <div className="flex gap-1 mt-2">
                  {/* Parents can only download documents (PDF), not images */}
                  {(canManage || doc.tip_fisier === 'pdf') && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {canManage && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadForm({ groupId, onUploaded }: { groupId: string; onUploaded: (doc: DocumentItem) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [cat, setCat] = useState('activitati');
  const [uploading, setUploading] = useState(false);

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  const handleUpload = async () => {
    if (!file) return;
    // Security: validate file type and size
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tip de fișier neacceptat. Acceptăm: PDF, JPG, PNG, GIF, WebP');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Fișierul depășește limita de 20MB');
      return;
    }
    setUploading(true);
    try {
      // Upload pe serverul TID4K via upload_fisier_hub.php
      // Salveaza pe disc SI inregistreaza in BD
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categorie', cat);

      const sessionCookie = localStorage.getItem('tid4k_session') || '';
      const response = await fetch(`${API_BASE_URL}/pages/upload_fisier_hub.php`, {
        method: 'POST',
        headers: {
          'X-TID4K-Session': sessionCookie,
        },
        body: formData,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Eroare la upload pe server');
      }

      const doc: DocumentItem = {
        id: String(result.id || Date.now()),
        nume_fisier: result.nume_fisier || file.name,
        tip_fisier: (result.extensie || file.name.split('.').pop() || 'pdf') as DocumentItem['tip_fisier'],
        categorie: cat as DocumentItem['categorie'],
        data_upload: result.data_upload || new Date().toISOString(),
        uploadat_de: '',
        uploadat_de_id: '',
        url: result.url || '',
        marime: file.size,
      };

      onUploaded(doc);
      toast.success('Document încărcat!');
    } catch (err: any) {
      toast.error(err.message || 'Eroare la upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Trage fișierele aici sau apasă pentru a selecta</p>
        <Input
          type="file"
          className="mt-3"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </div>
      {file && (
        <p className="text-sm text-muted-foreground">Selectat: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(0)} KB)</p>
      )}
      <div className="space-y-2">
        <Label>Categorie</Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Se încarcă...</> : 'Încarcă'}
      </Button>
    </div>
  );
}
