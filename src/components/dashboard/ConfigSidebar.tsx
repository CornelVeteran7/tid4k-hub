import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare, History, BarChart3, UserCircle, UserPlus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ModuleVisibility } from './ModuleHub';

const MODULE_ITEMS = [
  { key: 'prezenta', label: 'Prezența', icon: ClipboardList, color: '#1ABC9C' },
  { key: 'imagini', label: 'Imagini', icon: Image, color: '#2ECC71' },
  { key: 'documente', label: 'Documente', icon: FileText, color: '#3498DB' },
  { key: 'povesti', label: 'Povești / Ateliere', icon: BookOpen, color: '#9B59B6' },
  { key: 'meniu', label: 'Meniu', icon: UtensilsCrossed, color: '#E67E22' },
  { key: 'mesaje', label: 'Mesaje', icon: MessageSquare, color: '#E91E63' },
] as const;

const NAV_LINKS = [
  { label: 'Istoric prezență', icon: History, route: '/prezenta' },
  { label: 'Statistici', icon: BarChart3, route: '/rapoarte' },
  { label: 'Profilul meu', icon: UserCircle, route: '/profil' },
];

interface ConfigSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: ModuleVisibility;
  onToggle: (key: keyof ModuleVisibility) => void;
}

export default function ConfigSidebar({ open, onOpenChange, visibility, onToggle }: ConfigSidebarProps) {
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[340px]">
        <SheetHeader>
          <SheetTitle className="text-lg">Configurare module</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {MODULE_ITEMS.map(item => (
            <div key={item.key} className="flex items-center gap-3 py-3 px-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}25` }}
              >
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <Switch
                checked={visibility[item.key as keyof ModuleVisibility]}
                onCheckedChange={() => onToggle(item.key as keyof ModuleVisibility)}
              />
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => {
                if (link.route) {
                  navigate(link.route);
                  onOpenChange(false);
                } else {
                  toast.info('În curând!');
                }
              }}
              className="w-full flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors card-tappable"
            >
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground text-left">{link.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
