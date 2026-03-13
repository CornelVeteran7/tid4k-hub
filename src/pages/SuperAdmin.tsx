import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2, Grid3X3, BarChart3, Monitor, Activity, BookOpen,
  Users, PlusCircle, LayoutTemplate, Calculator, Menu, FolderOpen,
  Eye, ChevronRight, Shield, TrendingUp, Kanban, FileText, ListTodo
} from 'lucide-react';
import SuperAdminDocs from '@/components/superadmin/SuperAdminDocs';
import SuperAdminClients from '@/components/superadmin/SuperAdminClients';
import SuperAdminNewClient from '@/components/superadmin/SuperAdminNewClient';
import SuperAdminTemplates from '@/components/superadmin/SuperAdminTemplates';
import SuperAdminOrganizations from '@/components/superadmin/SuperAdminOrganizations';
import SuperAdminModuleMatrix from '@/components/superadmin/SuperAdminModuleMatrix';
import SuperAdminBI from '@/components/superadmin/SuperAdminBI';
import SuperAdminDisplayMonitor from '@/components/superadmin/SuperAdminDisplayMonitor';
import SuperAdminActivityFeed from '@/components/superadmin/SuperAdminActivityFeed';
import SuperAdminCostCalculator from '@/components/superadmin/SuperAdminCostCalculator';
import SuperAdminContentManager from '@/components/superadmin/SuperAdminContentManager';
import SuperAdminPreview from '@/components/superadmin/SuperAdminPreview';
import CRMDashboard from '@/components/superadmin/crm/CRMDashboard';
import CRMPipeline from '@/components/superadmin/crm/CRMPipeline';
import CRMContracts from '@/components/superadmin/crm/CRMContracts';
import CRMTasks from '@/components/superadmin/crm/CRMTasks';
import { type VerticalType } from '@/config/verticalConfig';

type NavSection = {
  label: string;
  items: { key: string; label: string; icon: React.ElementType; badge?: string }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Operațiuni',
    items: [
      { key: 'orgs', label: 'Organizații', icon: Building2 },
      { key: 'clients', label: 'Clienți', icon: Users },
      { key: 'new', label: 'Client Nou', icon: PlusCircle },
      { key: 'templates', label: 'Șabloane', icon: LayoutTemplate },
    ],
  },
  {
    label: 'Monitorizare',
    items: [
      { key: 'bi', label: 'Business Intelligence', icon: BarChart3 },
      { key: 'displays', label: 'Display-uri', icon: Monitor },
      { key: 'feed', label: 'Activitate', icon: Activity },
      { key: 'matrix', label: 'Module', icon: Grid3X3 },
    ],
  },
  {
    label: 'Conținut',
    items: [
      { key: 'content', label: 'Documente & Media', icon: FolderOpen, badge: 'Nou' },
    ],
  },
  {
    label: 'Previzualizare',
    items: [
      { key: 'preview', label: 'Preview Utilizator', icon: Eye, badge: 'Nou' },
    ],
  },
  {
    label: 'Instrumente',
    items: [
      { key: 'calculator', label: 'Calculator Costuri', icon: Calculator },
      { key: 'docs', label: 'Documentație', icon: BookOpen },
    ],
  },
];

function NavItem({ item, active, onClick }: {
  item: NavSection['items'][0]; active: boolean; onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
          {item.badge}
        </Badge>
      )}
    </button>
  );
}

function SidebarNav({ activeTab, onSelect }: { activeTab: string; onSelect: (key: string) => void }) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  active={activeTab === item.key}
                  onClick={() => onSelect(item.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const isInky = user?.status?.includes('inky') || user?.status?.includes('administrator');
  const [activeTab, setActiveTab] = useState('orgs');
  const [templatePreFill, setTemplatePreFill] = useState<VerticalType | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isInky) return <Navigate to="/" replace />;

  const handleUseTemplate = (vertical: VerticalType) => {
    setTemplatePreFill(vertical);
    setActiveTab('new');
  };

  const handleSelect = (key: string) => {
    setActiveTab(key);
    setMobileNavOpen(false);
  };

  // Find current label
  const currentItem = NAV_SECTIONS.flatMap(s => s.items).find(i => i.key === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'orgs': return <SuperAdminOrganizations />;
      case 'matrix': return <SuperAdminModuleMatrix />;
      case 'bi': return <SuperAdminBI />;
      case 'displays': return <SuperAdminDisplayMonitor />;
      case 'feed': return <SuperAdminActivityFeed />;
      case 'docs': return <SuperAdminDocs />;
      case 'clients': return <SuperAdminClients />;
      case 'new': return (
        <SuperAdminNewClient
          preFilledVertical={templatePreFill}
          onPreFillConsumed={() => setTemplatePreFill(null)}
        />
      );
      case 'templates': return <SuperAdminTemplates onUseTemplate={handleUseTemplate} />;
      case 'calculator': return <SuperAdminCostCalculator />;
      case 'content': return <SuperAdminContentManager />;
      case 'preview': return <SuperAdminPreview />;
      default: return <SuperAdminOrganizations />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height,64px))] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Superadmin</h1>
              <p className="text-[10px] text-muted-foreground">Panou de control</p>
            </div>
          </div>
        </div>
        <SidebarNav activeTab={activeTab} onSelect={handleSelect} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header with drawer trigger */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Superadmin</h2>
                </div>
              </div>
              <SidebarNav activeTab={activeTab} onSelect={handleSelect} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5 min-w-0">
            {currentItem && <currentItem.icon className="h-4 w-4 text-primary shrink-0" />}
            <h2 className="text-sm font-semibold text-foreground truncate">{currentItem?.label || 'Superadmin'}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Shield className="h-3 w-3" />
            <span>Superadmin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{currentItem?.label}</span>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
