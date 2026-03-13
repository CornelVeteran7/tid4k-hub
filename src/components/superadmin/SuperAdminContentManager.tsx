import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { FolderOpen, Trash2, FileText, Image, AlertTriangle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface DocRow {
  id: string;
  nume_fisier: string;
  url: string;
  tip_fisier: string | null;
  categorie: string | null;
  marime: number | null;
  created_at: string | null;
  uploadat_de_nume: string | null;
  thumbnail_url: string | null;
}

export default function SuperAdminContentManager() {
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<DocRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: orgs } = useQuery({
    queryKey: ['sa-orgs-content'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('id, name, vertical_type').order('name');
      return data || [];
    },
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['sa-docs', selectedOrg],
    enabled: !!selectedOrg,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, nume_fisier, url, tip_fisier, categorie, marime, created_at, uploadat_de_nume, thumbnail_url')
        .eq('organization_id', selectedOrg)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DocRow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: DocRow) => {
      // Delete from documents table
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;

      // Try to delete from storage too
      try {
        const urlPath = new URL(doc.url).pathname;
        const storagePath = urlPath.split('/object/public/documents/')[1];
        if (storagePath) {
          await supabase.storage.from('documents').remove([decodeURIComponent(storagePath)]);
        }
      } catch {
        // Storage delete is best-effort
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-docs', selectedOrg] });
      setDeleteTarget(null);
      toast.success('Fișier șters cu succes');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isImage = (type: string | null) => type?.startsWith('image') || type?.includes('jpg') || type?.includes('png') || type?.includes('jpeg') || type?.includes('webp');

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const totalSize = (documents || []).reduce((sum, d) => sum + (d.marime || 0), 0);
  const imageCount = (documents || []).filter(d => isImage(d.tip_fisier)).length;
  const docCount = (documents || []).length - imageCount;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Manager Conținut — Documente & Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selectează organizația..." />
            </SelectTrigger>
            <SelectContent>
              {(orgs || []).map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                  <span className="text-muted-foreground ml-1 text-[10px]">({org.vertical_type})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedOrg && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{documents?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground">Total fișiere</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{imageCount} / {docCount}</p>
                <p className="text-[10px] text-muted-foreground">Imagini / Documente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{formatSize(totalSize)}</p>
                <p className="text-[10px] text-muted-foreground">Spațiu utilizat</p>
              </CardContent>
            </Card>
          </div>

          {/* File grid */}
          {docsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : (documents || []).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Niciun fișier pentru această organizație</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(documents || []).map(doc => (
                <Card key={doc.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Thumbnail / icon */}
                    <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                      {isImage(doc.tip_fisier) ? (
                        <img
                          src={doc.thumbnail_url || doc.url}
                          alt={doc.nume_fisier}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                      )}
                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setPreviewUrl(doc.url)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                          <a href={doc.url} target="_blank" rel="noopener" download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteTarget(doc)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2 space-y-1">
                      <p className="text-[11px] font-medium text-foreground truncate" title={doc.nume_fisier}>
                        {doc.nume_fisier}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[8px]">
                          {isImage(doc.tip_fisier) ? '🖼️ Imagine' : '📄 Document'}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{formatSize(doc.marime)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span className="truncate">{doc.uploadat_de_nume || '—'}</span>
                        <span className="shrink-0">
                          {doc.created_at ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ro }) : ''}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmare Ștergere
            </DialogTitle>
            <DialogDescription>
              Ești sigur că vrei să ștergi <strong>"{deleteTarget?.nume_fisier}"</strong>? Această acțiune este ireversibilă.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Anulează</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Se șterge...' : 'Șterge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={open => { if (!open) setPreviewUrl(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Previzualizare</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
            ) : (
              <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg border-0" title="Document preview" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
