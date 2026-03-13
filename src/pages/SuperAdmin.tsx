import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, PlusCircle, LayoutTemplate, Building2, Grid3X3, BarChart3, Monitor, Activity, Calculator } from 'lucide-react';
import SuperAdminDocs from '@/components/superadmin/SuperAdminDocs';
import SuperAdminClients from '@/components/superadmin/SuperAdminClients';
import SuperAdminNewClient from '@/components/superadmin/SuperAdminNewClient';
import SuperAdminTemplates from '@/components/superadmin/SuperAdminTemplates';
import SuperAdminOrganizations from '@/components/superadmin/SuperAdminOrganizations';
import SuperAdminModuleMatrix from '@/components/superadmin/SuperAdminModuleMatrix';
import SuperAdminBI from '@/components/superadmin/SuperAdminBI';
import SuperAdminDisplayMonitor from '@/components/superadmin/SuperAdminDisplayMonitor';
import SuperAdminActivityFeed from '@/components/superadmin/SuperAdminActivityFeed';
import { type VerticalType } from '@/config/verticalConfig';

export default function SuperAdmin() {
  const { user } = useAuth();
  const isInky = user?.status?.includes('inky') || user?.status?.includes('administrator');
  const [activeTab, setActiveTab] = useState('orgs');
  const [templatePreFill, setTemplatePreFill] = useState<VerticalType | null>(null);

  if (!isInky) return <Navigate to="/" replace />;

  const handleUseTemplate = (vertical: VerticalType) => {
    setTemplatePreFill(vertical);
    setActiveTab('new');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Superadmin Panel</h1>
        <p className="text-sm text-muted-foreground">Organizații, module, business intelligence și monitorizare</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="orgs" className="gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Organizații
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1.5 text-xs">
              <Grid3X3 className="h-3.5 w-3.5" /> Module
            </TabsTrigger>
            <TabsTrigger value="bi" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> BI
            </TabsTrigger>
            <TabsTrigger value="displays" className="gap-1.5 text-xs">
              <Monitor className="h-3.5 w-3.5" /> Display-uri
            </TabsTrigger>
            <TabsTrigger value="feed" className="gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" /> Activitate
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Documentație
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Clienți
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" /> Client Nou
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs">
              <LayoutTemplate className="h-3.5 w-3.5" /> Șabloane
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="orgs"><SuperAdminOrganizations /></TabsContent>
        <TabsContent value="matrix"><SuperAdminModuleMatrix /></TabsContent>
        <TabsContent value="bi"><SuperAdminBI /></TabsContent>
        <TabsContent value="displays"><SuperAdminDisplayMonitor /></TabsContent>
        <TabsContent value="feed"><SuperAdminActivityFeed /></TabsContent>
        <TabsContent value="docs"><SuperAdminDocs /></TabsContent>
        <TabsContent value="clients"><SuperAdminClients /></TabsContent>
        <TabsContent value="new">
          <SuperAdminNewClient
            preFilledVertical={templatePreFill}
            onPreFillConsumed={() => setTemplatePreFill(null)}
          />
        </TabsContent>
        <TabsContent value="templates">
          <SuperAdminTemplates onUseTemplate={handleUseTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
