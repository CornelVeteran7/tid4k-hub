import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck, Plus, FileText, CheckCircle2, AlertTriangle, Trash2, ClipboardList, Download
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTemplates, createTemplate, deleteTemplate,
  getChecklists, createChecklist, updateChecklist,
  type SSMTemplate, type SSMChecklist
} from '@/api/ssm';
import { format, isBefore, startOfDay } from 'date-fns';

export default function SSMPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [templates, setTemplates] = useState<SSMTemplate[]>([]);
  const [checklists, setChecklists] = useState<SSMChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<SSMChecklist | null>(null);
  const [newTmpl, setNewTmpl] = useState({ nume: '', itemsText: '' });
  const [pdfChecklist, setPdfChecklist] = useState<SSMChecklist | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const reload = async () => {
    if (!orgId) return;
    const [t, c] = await Promise.all([getTemplates(orgId), getChecklists(orgId)]);
    setTemplates(t);
    setChecklists(c);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId]);

  const handleAddTemplate = async () => {
    if (!newTmpl.nume || !newTmpl.itemsText || !orgId) { toast.error('Completează toate câmpurile'); return; }
    const items = newTmpl.itemsText.split('\n').filter(Boolean).map(text => ({ text: text.trim() }));
    try {
      await createTemplate({ organization_id: orgId, nume: newTmpl.nume, items });
      toast.success('Șablon creat!');
      setShowAddTemplate(false);
      setNewTmpl({ nume: '', itemsText: '' });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteTemplate = async (id: string) => {
    try { await deleteTemplate(id); toast.success('Șablon șters'); reload(); } catch (e: any) { toast.error(e.message); }
  };

  const startChecklist = async (tmpl: SSMTemplate) => {
    if (!orgId) return;
    const items = tmpl.items.map(i => ({ text: i.text, checked: false }));
    try {
      await createChecklist({
        organization_id: orgId,
        template_id: tmpl.id,
        data: format(new Date(), 'yyyy-MM-dd'),
        completat_de: user?.nume_prenume || '',
        completat_de_id: user?.id || '',
        items,
      });
      toast.success('Checklist pornit!');
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleItem = async (checklist: SSMChecklist, index: number) => {
    const updated = [...checklist.items];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    try {
      await updateChecklist(checklist.id, { items: updated } as any);
      setActiveChecklist({ ...checklist, items: updated });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  // Signature canvas handlers
  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitChecklist = async () => {
    if (!activeChecklist) return;
    const canvas = canvasRef.current;
    const sigData = canvas ? canvas.toDataURL('image/png') : '';
    try {
      await updateChecklist(activeChecklist.id, {
        status: 'completed',
        semnatura_data: sigData,
        completed_at: new Date().toISOString(),
      } as any);
      toast.success('Checklist completat cu semnătură!');
      setActiveChecklist(null);
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const generatePDF = (checklist: SSMChecklist) => {
    const template = templates.find(t => t.id === checklist.template_id);
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) { toast.error('Permite pop-up-uri pentru a genera PDF'); return; }
    
    const itemsHtml = checklist.items.map((item, i) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
        <td style="padding:8px;border:1px solid #ddd;">${item.text}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;font-size:18px;">${item.checked ? '✅' : '❌'}</td>
      </tr>
    `).join('');

    w.document.write(`
      <html>
      <head><title>Raport SSM — ${checklist.data}</title></head>
      <body style="font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;">
        <h1 style="text-align:center;color:#1a1a1a;">RAPORT SSM</h1>
        <h2 style="text-align:center;color:#666;">${template?.nume || 'Checklist'}</h2>
        <hr style="margin:20px 0;" />
        
        <table style="width:100%;margin-bottom:16px;">
          <tr><td><strong>Data:</strong> ${checklist.data}</td><td><strong>Completat de:</strong> ${checklist.completat_de}</td></tr>
          <tr><td><strong>Status:</strong> ${checklist.status === 'completed' ? 'COMPLETAT ✅' : 'INCOMPLET ⚠️'}</td>
              <td><strong>Completat la:</strong> ${checklist.completed_at ? format(new Date(checklist.completed_at), 'dd.MM.yyyy HH:mm') : '—'}</td></tr>
        </table>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;border:1px solid #ddd;width:40px;">Nr.</th>
              <th style="padding:8px;border:1px solid #ddd;">Punct de verificare</th>
              <th style="padding:8px;border:1px solid #ddd;width:60px;">Status</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top:30px;">
          <p><strong>Rezumat:</strong> ${checklist.items.filter(i => i.checked).length} / ${checklist.items.length} puncte îndeplinite</p>
        </div>

        ${checklist.semnatura_data ? `
          <div style="margin-top:30px;text-align:center;">
            <p><strong>Semnătura:</strong></p>
            <img src="${checklist.semnatura_data}" style="max-width:300px;border:1px solid #ddd;border-radius:8px;" />
          </div>
        ` : ''}

        <div style="margin-top:40px;text-align:center;color:#999;font-size:12px;">
          <p>Document generat automat — SSM Module</p>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  if (!orgId) return null;
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayChecklists = checklists.filter(c => c.data === today);
  const completedToday = todayChecklists.filter(c => c.status === 'completed').length;
  const overdue = checklists.filter(c => c.status === 'incomplete' && isBefore(new Date(c.data), startOfDay(new Date())));

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> SSM — Sănătate și Securitate
        </h1>
        <p className="text-sm text-muted-foreground">Checklist-uri zilnice de securitate</p>
      </div>

      {/* Compliance dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completedToday}</p>
            <p className="text-sm text-muted-foreground">Completate azi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{todayChecklists.length}</p>
            <p className="text-sm text-muted-foreground">Total azi</p>
          </CardContent>
        </Card>
        <Card className={overdue.length > 0 ? 'border-destructive' : ''}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-bold ${overdue.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{overdue.length}</p>
            <p className="text-sm text-muted-foreground">Restanțe</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checklists" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklists" className="gap-1.5"><ClipboardList className="h-4 w-4" /> Checklist-uri</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><FileText className="h-4 w-4" /> Șabloane</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="space-y-4">
          {/* Start from template */}
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <Button key={t.id} variant="outline" className="gap-1.5" onClick={() => startChecklist(t)}>
                <Plus className="h-4 w-4" /> {t.nume}
              </Button>
            ))}
          </div>

          {/* Active checklists */}
          {activeChecklist ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checklist — {activeChecklist.data}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeChecklist.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(activeChecklist, idx)}
                    />
                    <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                  </div>
                ))}

                {/* Signature pad */}
                <div className="space-y-2">
                  <Label>Semnătură</Label>
                  <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="w-full cursor-crosshair bg-background touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={stopDraw}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearSignature}>Șterge semnătura</Button>
                  </div>
                </div>

                <Button onClick={submitChecklist} className="w-full gap-1.5" disabled={!activeChecklist.items.every(i => i.checked)}>
                  <CheckCircle2 className="h-4 w-4" /> Finalizează cu semnătură
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="divide-y divide-border">
              {checklists.slice(0, 20).map(c => {
                const isOld = c.status === 'incomplete' && isBefore(new Date(c.data), startOfDay(new Date()));
                return (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {c.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isOld ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        )}
                        <p className="text-sm font-medium">{c.data}</p>
                        <Badge variant={c.status === 'completed' ? 'default' : isOld ? 'destructive' : 'secondary'}>
                          {c.status === 'completed' ? 'Completat' : isOld ? 'RESTANȚĂ' : 'Incomplet'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground ml-7">
                        {c.completat_de} · {c.items.filter(i => i.checked).length}/{c.items.length} puncte
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {c.status === 'incomplete' && (
                        <Button size="sm" variant="outline" onClick={() => setActiveChecklist(c)}>Continuă</Button>
                      )}
                      {c.status === 'completed' && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => generatePDF(c)}>
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> Șablon nou</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Șablon SSM nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nume șablon</Label><Input value={newTmpl.nume} onChange={e => setNewTmpl(p => ({ ...p, nume: e.target.value }))} placeholder="Ex: Control zilnic șantier" /></div>
                <div>
                  <Label>Puncte de verificare (câte una pe linie)</Label>
                  <Textarea
                    rows={8}
                    value={newTmpl.itemsText}
                    onChange={e => setNewTmpl(p => ({ ...p, itemsText: e.target.value }))}
                    placeholder="Echipament protecție verificat&#10;Zona de lucru delimitată&#10;Schelele ancorate corespunzător&#10;Extinctoare în zona de acces&#10;Echipa instruită pe proceduri"
                  />
                </div>
                <Button onClick={handleAddTemplate} className="w-full">Creează șablon</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            {templates.map(t => (
              <Card key={t.id}>
                <CardContent className="p-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.nume}</p>
                    <p className="text-xs text-muted-foreground">{t.items.length} puncte de verificare</p>
                    <ul className="mt-2 space-y-1">
                      {t.items.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
