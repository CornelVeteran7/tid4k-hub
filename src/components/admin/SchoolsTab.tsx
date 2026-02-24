import { useState, useEffect } from 'react';
import { createSchool } from '@/api/schools';
import { getSponsors } from '@/api/sponsors';
import type { Sponsor } from '@/types/sponsor';
import type { School } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, School as SchoolIcon, Users, GraduationCap, MapPin, X, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';

interface Props {
  selectedSchoolId: string;
  schools: School[];
  onSchoolsChange: (schools: School[]) => void;
}

export default function SchoolsTab({ selectedSchoolId, schools, onSchoolsChange }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [newSchool, setNewSchool] = useState<Partial<School>>({ tip: 'gradinita' });
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    getSponsors().then(setAllSponsors);
  }, []);

  // Auto-expand when a specific school is selected globally
  useEffect(() => {
    if (selectedSchoolId !== 'all') {
      const school = schools.find(s => s.id_scoala.toString() === selectedSchoolId);
      setDetailSchool(school || null);
    } else {
      setDetailSchool(null);
    }
  }, [selectedSchoolId, schools]);

  const displayedSchools = selectedSchoolId === 'all'
    ? schools
    : schools.filter(s => s.id_scoala.toString() === selectedSchoolId);

  const handleCreate = async () => {
    const s = await createSchool(newSchool);
    onSchoolsChange([...schools, s]);
    setCreateOpen(false);
    setNewSchool({ tip: 'gradinita' });
    toast.success('Școală creată cu succes!');
  };

  const CreateForm = (
    <div className="space-y-4">
      <div><Label>Nume instituție</Label><Input placeholder="ex: Grădinița Floarea Soarelui" value={newSchool.nume || ''} onChange={e => setNewSchool({ ...newSchool, nume: e.target.value })} /></div>
      <div><Label>Adresă</Label><Input placeholder="Str. Exemplu nr. 1, București" value={newSchool.adresa || ''} onChange={e => setNewSchool({ ...newSchool, adresa: e.target.value })} /></div>
      <div>
        <Label>Tip instituție</Label>
        <Select value={newSchool.tip || 'gradinita'} onValueChange={v => setNewSchool({ ...newSchool, tip: v as School['tip'] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gradinita">Grădiniță</SelectItem>
            <SelectItem value="scoala">Școală</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={handleCreate} disabled={!newSchool.nume}>Creează școală</Button>
    </div>
  );

  const DetailPanel = detailSchool && (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{detailSchool.nume}</h3>
        <Button variant="ghost" size="icon" onClick={() => setDetailSchool(null)}><X className="h-4 w-4" /></Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />{detailSchool.adresa}
      </div>
      <Badge variant={detailSchool.activ ? 'default' : 'secondary'}>{detailSchool.activ ? 'Activ' : 'Inactiv'}</Badge>

      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{detailSchool.nr_copii}</p><p className="text-xs text-muted-foreground">Copii</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{detailSchool.nr_profesori}</p><p className="text-xs text-muted-foreground">Profesori</p></CardContent></Card>
      </div>

      <div>
        <Label className="text-sm font-medium">Grupe / Clase</Label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {detailSchool.grupe.map(g => (
            <Badge key={g} variant="outline">{g}</Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><Plus className="h-3 w-3" />Adaugă</Button>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5"><Award className="h-4 w-4" />Sponsori activi</Label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {detailSchool.sponsori_activi.map(sid => {
            const sponsor = allSponsors.find(s => s.id_sponsor === sid);
            return sponsor ? (
              <Badge
                key={sid}
                className="text-xs text-white gap-1"
                style={{ backgroundColor: sponsor.culoare_brand }}
              >
                {sponsor.nume}
                <button
                  className="ml-1 opacity-70 hover:opacity-100"
                  onClick={() => {
                    const updated = { ...detailSchool, sponsori_activi: detailSchool.sponsori_activi.filter(id => id !== sid) };
                    setDetailSchool(updated);
                    onSchoolsChange(schools.map(s => s.id_scoala === updated.id_scoala ? updated : s));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {allSponsors.filter(s => !detailSchool.sponsori_activi.includes(s.id_sponsor)).length > 0 && (
            <Select onValueChange={v => {
              const updated = { ...detailSchool, sponsori_activi: [...detailSchool.sponsori_activi, Number(v)] };
              setDetailSchool(updated);
              onSchoolsChange(schools.map(s => s.id_scoala === updated.id_scoala ? updated : s));
            }}>
              <SelectTrigger className="h-6 w-auto text-xs gap-1 px-2">
                <Plus className="h-3 w-3" />Adaugă
              </SelectTrigger>
              <SelectContent>
                {allSponsors.filter(s => !detailSchool.sponsori_activi.includes(s.id_sponsor)).map(s => (
                  <SelectItem key={s.id_sponsor} value={s.id_sponsor.toString()}>
                    {s.nume}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{displayedSchools.length} unități de învățământ</p>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />Școală nouă
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayedSchools.map(school => (
          <Card
            key={school.id_scoala}
            className={`cursor-pointer transition-all hover:shadow-md ${detailSchool?.id_scoala === school.id_scoala ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setDetailSchool(detailSchool?.id_scoala === school.id_scoala ? null : school)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SchoolIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm truncate">{school.nume}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{school.adresa}</p>
                </div>
                <Badge variant={school.activ ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                  {school.activ ? 'Activ' : 'Inactiv'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{school.nr_copii} copii</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{school.nr_profesori} profesori</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {school.grupe.slice(0, 3).map(g => <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>)}
                {school.grupe.length > 3 && <Badge variant="outline" className="text-[10px]">+{school.grupe.length - 3}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedSchoolId === 'all' && (
          <Card className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-center min-h-[140px]" onClick={() => setCreateOpen(true)}>
            <div className="text-center text-muted-foreground">
              <Plus className="h-8 w-8 mx-auto mb-1 opacity-40" />
              <p className="text-sm font-medium">Adaugă instituție</p>
            </div>
          </Card>
        )}
      </div>

      {/* Detail panel */}
      {isMobile ? (
        <Sheet open={!!detailSchool} onOpenChange={open => !open && setDetailSchool(null)}>
          <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
            <SheetHeader><SheetTitle>Detalii școală</SheetTitle></SheetHeader>
            {DetailPanel}
          </SheetContent>
        </Sheet>
      ) : (
        detailSchool && (
          <Card className="p-6">{DetailPanel}</Card>
        )
      )}

      {/* Create dialog */}
      {isMobile ? (
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
            <SheetHeader><SheetTitle>Școală nouă</SheetTitle></SheetHeader>
            <div className="mt-4">{CreateForm}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Școală nouă</DialogTitle></DialogHeader>
            {CreateForm}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
