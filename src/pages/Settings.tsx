import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Palette, LayoutGrid, Users, Monitor, Link2, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin as checkIsAdmin } from '@/utils/roles';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import SettingsGeneral from '@/components/settings/SettingsGeneral';
import SettingsBranding from '@/components/settings/SettingsBranding';
import SettingsModules from '@/components/settings/SettingsModules';
import SettingsUsers from '@/components/settings/SettingsUsers';
import SettingsDisplay from '@/components/settings/SettingsDisplay';
import SettingsIntegrations from '@/components/settings/SettingsIntegrations';
import SettingsVerticalConfig from '@/components/settings/SettingsVerticalConfig';

const TABS = [
  { value: 'general', label: 'General', icon: Building2 },
  { value: 'branding', label: 'Branding', icon: Palette },
  { value: 'vertical', label: 'Vertical', icon: Wrench },
  { value: 'modules', label: 'Module', icon: LayoutGrid },
  { value: 'users', label: 'Utilizatori', icon: Users },
  { value: 'display', label: 'Display', icon: Monitor },
  { value: 'integrations', label: 'Integrări', icon: Link2 },
];

export default function Settings() {
  const { user } = useAuth();

  if (!user || !checkIsAdmin(user.status, user.nume_prenume)) {
    return <Navigate to="/" replace />;
  }

  const orgId = user.organization_id;
  const verticalType = (user.vertical_type || 'kids') as VerticalType;
  const verticalDef = VERTICAL_DEFINITIONS[verticalType];

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Nu ești asociat unei organizații.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Configurări</h1>
        <p className="text-sm text-muted-foreground">
          Setări pentru {verticalDef.label} — {user.org_name}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 shrink-0 text-xs sm:text-sm">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general">
          <SettingsGeneral orgId={orgId} />
        </TabsContent>
        <TabsContent value="branding">
          <SettingsBranding orgId={orgId} />
        </TabsContent>
        <TabsContent value="vertical">
          <SettingsVerticalConfig orgId={orgId} verticalType={verticalType} />
        </TabsContent>
        <TabsContent value="modules">
          <SettingsModules orgId={orgId} verticalType={verticalType} />
        </TabsContent>
        <TabsContent value="users">
          <SettingsUsers orgId={orgId} verticalType={verticalType} />
        </TabsContent>
        <TabsContent value="display">
          <SettingsDisplay orgId={orgId} />
        </TabsContent>
        <TabsContent value="integrations">
          <SettingsIntegrations orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
