import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, Users, Calendar, UtensilsCrossed, Award, Settings } from 'lucide-react';
import { getSchools } from '@/api/schools';
import type { School as SchoolType } from '@/types';
import SchoolsTab from '@/components/admin/SchoolsTab';
import UsersTab from '@/components/admin/UsersTab';
import ScheduleTab from '@/components/admin/ScheduleTab';
import MenuTab from '@/components/admin/MenuTab';
import SponsorsTab from '@/components/admin/SponsorsTab';
import SettingsTab from '@/components/admin/SettingsTab';

const TABS = [
  { value: 'scoli', label: 'Școli', icon: School },
  { value: 'utilizatori', label: 'Utilizatori', icon: Users },
  { value: 'orar', label: 'Orar', icon: Calendar },
  { value: 'meniu', label: 'Meniu', icon: UtensilsCrossed },
  { value: 'sponsori', label: 'Sponsori', icon: Award },
  { value: 'setari', label: 'Setări', icon: Settings },
];

export default function AdminPanel() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');

  useEffect(() => { getSchools().then(setSchools); }, []);

  const currentSchool = schools.find(s => s.id_scoala.toString() === selectedSchoolId);

  return (
    <div className="space-y-5 pb-20 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            Panou Administrare
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestionează unitățile de învățământ, utilizatorii și sponsorii
          </p>
        </div>

        {/* Global school selector */}
        <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
          <SelectTrigger className="w-full sm:w-[260px] shrink-0">
            <SelectValue placeholder="Selectează școala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate unitățile</SelectItem>
            {schools.map(s => (
              <SelectItem key={s.id_scoala} value={s.id_scoala.toString()}>
                {s.nume}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scoli" className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 shrink-0 text-xs sm:text-sm">
                <tab.icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="overflow-y-auto">
          <TabsContent value="scoli"><SchoolsTab selectedSchoolId={selectedSchoolId} schools={schools} onSchoolsChange={setSchools} /></TabsContent>
          <TabsContent value="utilizatori"><UsersTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
          <TabsContent value="orar"><ScheduleTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
          <TabsContent value="meniu"><MenuTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
          <TabsContent value="sponsori"><SponsorsTab /></TabsContent>
          <TabsContent value="setari"><SettingsTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
