import { useState, useEffect } from 'react';
import { getSchools } from '@/api/schools';
import { getSchedule, saveSchedule } from '@/api/schedule';
import type { School, ScheduleCell } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const ZILE = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const ORE = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

export default function ScheduleTab() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrupa, setSelectedGrupa] = useState('');
  const [cells, setCells] = useState<ScheduleCell[]>([]);
  const currentSchool = schools.find(s => s.id_scoala.toString() === selectedSchool);

  useEffect(() => { getSchools().then(s => { setSchools(s); if (s.length) setSelectedSchool(s[0].id_scoala.toString()); }); }, []);

  useEffect(() => {
    if (selectedGrupa) getSchedule(selectedGrupa).then(setCells);
  }, [selectedGrupa]);

  useEffect(() => {
    if (currentSchool?.grupe.length) setSelectedGrupa(currentSchool.grupe[0]);
  }, [selectedSchool]);

  const getCell = (zi: string, ora: string) => cells.find(c => c.zi === zi && c.ora === ora);

  const updateCell = (zi: string, ora: string, field: keyof ScheduleCell, value: string) => {
    setCells(prev => {
      const exists = prev.find(c => c.zi === zi && c.ora === ora);
      if (exists) return prev.map(c => c.zi === zi && c.ora === ora ? { ...c, [field]: value } : c);
      return [...prev, { zi, ora, materie: '', profesor: '', culoare: '#E3F2FD', [field]: value }];
    });
  };

  const handleSave = async () => {
    await saveSchedule(selectedGrupa, cells);
    toast.success('Orar salvat!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px]">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger><SelectValue placeholder="Școală" /></SelectTrigger>
            <SelectContent>{schools.map(s => <SelectItem key={s.id_scoala} value={s.id_scoala.toString()}>{s.nume}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px]">
          <Select value={selectedGrupa} onValueChange={setSelectedGrupa}>
            <SelectTrigger><SelectValue placeholder="Grupă" /></SelectTrigger>
            <SelectContent>{(currentSchool?.grupe || []).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" className="gap-1.5 ml-auto" onClick={handleSave}><Save className="h-4 w-4" />Salvează</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground w-16">Ora</th>
                  {ZILE.map(z => <th key={z} className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[120px]">{z}</th>)}
                </tr>
              </thead>
              <tbody>
                {ORE.map(ora => (
                  <tr key={ora} className="border-b last:border-0">
                    <td className="p-2 text-xs font-mono text-muted-foreground">{ora}</td>
                    {ZILE.map(zi => {
                      const cell = getCell(zi, ora);
                      return (
                        <td key={zi} className="p-1">
                          <div className="space-y-1">
                            <Input
                              placeholder="Materie"
                              value={cell?.materie || ''}
                              onChange={e => updateCell(zi, ora, 'materie', e.target.value)}
                              className="h-7 text-xs"
                            />
                            <Input
                              placeholder="Profesor"
                              value={cell?.profesor || ''}
                              onChange={e => updateCell(zi, ora, 'profesor', e.target.value)}
                              className="h-7 text-xs text-muted-foreground"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
