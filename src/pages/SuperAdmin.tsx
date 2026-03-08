import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, PlusCircle, LayoutTemplate } from 'lucide-react';
import SuperAdminDocs from '@/components/superadmin/SuperAdminDocs';
import SuperAdminClients from '@/components/superadmin/SuperAdminClients';
import SuperAdminNewClient from '@/components/superadmin/SuperAdminNewClient';
import SuperAdminTemplates from '@/components/superadmin/SuperAdminTemplates';
import { type VerticalType } from '@/config/verticalConfig';

export default function SuperAdmin() {
  const { user } = useAuth();
  const isInky = user?.status?.includes('inky');
  const [activeTab, setActiveTab] = useState('docs');
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
        <p className="text-sm text-muted-foreground">Documentație, clienți și provizionare organizații</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
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
