import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, Users, Calendar, UtensilsCrossed, Settings, Paintbrush, BookOpen, Palette, HelpCircle, BarChart3 } from 'lucide-react';
import { getSchools } from '@/api/schools';
import type { School as SchoolType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin as checkIsAdmin } from '@/utils/roles';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import SchoolsTab from '@/components/admin/SchoolsTab';
import UsersTab from '@/components/admin/UsersTab';
import ScheduleTab from '@/components/admin/ScheduleTab';
import MenuTab from '@/components/admin/MenuTab';
import SettingsTab from '@/components/admin/SettingsTab';
import WorkshopsTab from '@/components/admin/WorkshopsTab';
import DocsTab from '@/components/admin/DocsTab';
import BrandingTab from '@/components/admin/BrandingTab';
import UserGuideTab from '@/components/admin/UserGuideTab';
import BusinessIntelligenceTab from '@/components/admin/BusinessIntelligenceTab';

export default function AdminPanel() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');

  useEffect(() => { getSchools().then(setSchools); }, []);

  // Access control: only admin/director/inky
  if (!user || !checkIsAdmin(user.status, user.nume_prenume)) {
    return <Navigate to="/" replace />;
  }

  const verticalType = (user.vertical_type || 'kids') as VerticalType;
  const verticalDef = VERTICAL_DEFINITIONS[verticalType];
  const TABS = [
    { value: 'scoli', label: verticalDef.entityLabelPlural, icon: School, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'utilizatori', label: 'Utilizatori', icon: Users, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'orar', label: 'Orar', icon: Calendar, verticals: ['kids', 'schools', 'medicine', 'students', 'culture'] },
    { value: 'meniu', label: 'Meniu', icon: UtensilsCrossed, verticals: ['kids'] },
    { value: 'ateliere', label: 'Ateliere', icon: Paintbrush, verticals: ['kids'] },
    { value: 'setari', label: 'Setări', icon: Settings, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'ghid', label: 'Ghid', icon: HelpCircle, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'docs', label: 'Docs', icon: BookOpen, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'branding', label: 'Branding', icon: Palette, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
    { value: 'bi', label: 'BI', icon: BarChart3, verticals: ['kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'] },
  ];
  const visibleTabs = TABS.filter(t => t.verticals.includes(verticalType));


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
            Gestionează {verticalDef.entityLabelPlural.toLowerCase()}, utilizatorii și setările
          </p>
        </div>

        {/* Global selector */}
        <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
          <SelectTrigger className="w-full sm:w-[260px] shrink-0">
            <SelectValue placeholder={`Selectează ${verticalDef.entityLabel.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate {verticalDef.entityLabelPlural.toLowerCase()}</SelectItem>
            {schools.map(s => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.nume}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={visibleTabs[0]?.value || 'scoli'} className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            {visibleTabs.map(tab => (
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
          <TabsContent value="ateliere"><WorkshopsTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
          <TabsContent value="setari"><SettingsTab schoolId={selectedSchoolId} schools={schools} /></TabsContent>
          <TabsContent value="ghid"><UserGuideTab /></TabsContent>
          <TabsContent value="docs"><DocsTab /></TabsContent>
          <TabsContent value="branding"><BrandingTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
