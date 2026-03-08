import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { getDocuments, deleteDocument } from '@/api/documents';
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
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!currentGroup) return;
    setLoading(true);
    getDocuments(currentGroup.id, category === 'all' ? undefined : category).then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
  }, [currentGroup, category]);

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
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
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Upload className="h-4 w-4" /> Încarcă</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Încarcă document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Trage fișierele aici sau apasă pentru a selecta</p>
                  <Input type="file" className="mt-3" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" />
                </div>
                <div className="space-y-2">
                  <Label>Categorie</Label>
                  <Select defaultValue="activitati">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => { setUploadOpen(false); toast.success('Document încărcat!'); }}>
                  Încarcă
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <div className={`${viewMode === 'grid' ? 'mb-3 h-28' : 'h-12 w-12 shrink-0'} rounded-lg bg-muted/50 flex items-center justify-center`}>
                  {doc.tip_fisier === 'pdf' ? (
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
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(doc.id_info)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
