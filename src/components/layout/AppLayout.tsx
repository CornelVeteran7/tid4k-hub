import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { areRol, isInky, getRoleLabel, getRoles } from '@/utils/roles';
import { NavLink } from '@/components/NavLink';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Home, Users, FileText, MessageSquare, Megaphone, Calendar, UtensilsCrossed,
  BookOpen, BarChart3, Settings, LogOut, Menu, X, Monitor, Facebook, MessageCircle, ClipboardList, Bell
} from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocation, useNavigate } from 'react-router-dom';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';
import infodisplayLogoHeader from '@/assets/infodisplay-logo-header.png';
import InkyAssistant from '@/components/InkyAssistant';

const NAV_ITEMS = [
  { path: '/', label: 'Acasă', icon: Home, roles: ['all'] },
  { path: '/prezenta', label: 'Prezența', icon: ClipboardList, roles: ['profesor', 'director', 'administrator'] },
  { path: '/documente', label: 'Documente', icon: FileText, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/mesaje', label: 'Mesaje', icon: MessageSquare, roles: ['profesor', 'parinte', 'director', 'administrator'], badge: true },
  { path: '/anunturi', label: 'Anunțuri', icon: Megaphone, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/orar', label: 'Orar', icon: Calendar, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/meniu', label: 'Meniul', icon: UtensilsCrossed, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/povesti', label: 'Povești', icon: BookOpen, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/rapoarte', label: 'Rapoarte', icon: BarChart3, roles: ['director', 'administrator'] },
  { path: '/utilizatori', label: 'Utilizatori', icon: Users, roles: ['administrator'] },
  { path: '/configurari', label: 'Configurări', icon: Settings, roles: ['administrator'] },
  { path: '/infodisplay', label: 'Infodisplay', icon: Monitor, roles: ['profesor', 'director', 'administrator'] },
];

const INKY_ITEMS = [
  { path: '/orar-cancelarie', label: 'Orar CANCELARIE', icon: Calendar },
  { path: '/social-facebook', label: 'Facebook', icon: Facebook },
  { path: '/social-whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { currentGroup, availableGroups, switchGroup } = useGroup();
  const { unreadMessages } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const userStatus = user.status;
  const userIsInky = isInky(userStatus, user.nume_prenume);
  const userRoles = getRoles(userStatus);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles.includes('all')) return true;
    return item.roles.some((role) => areRol(userStatus, role) || userIsInky);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground 
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <img src={logoWhite} alt="InfoDisplay" className="h-7" />
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && unreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs h-5 min-w-[20px] flex items-center justify-center">
                    {unreadMessages}
                  </Badge>
                )}
              </NavLink>
            ))}

            {/* Inky exclusive items */}
            {userIsInky && (
              <>
                <div className="pt-4 pb-2 px-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Superuser</span>
                </div>
                {INKY_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User info at bottom */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold">
                {user.nume_prenume.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nume_prenume}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {userRoles.slice(0, 2).map((r) => (
                    <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                      {getRoleLabel(r)}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="relative flex items-center border-b bg-card px-4 py-3 lg:px-6 safe-top">
          {/* Left: hamburger */}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: group selector (absolute centered) */}
          {availableGroups.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <Select value={currentGroup?.id || ''} onValueChange={switchGroup}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selectează grupa" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.nume}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Right: logo */}
          <div className="ml-auto">
            <button onClick={() => navigate('/')} className="focus:outline-none">
              <img src="/favicon.png" alt="InfoDisplay — Acasă" className="h-8 w-8" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
          <InkyAssistant />
        </main>
      </div>
    </div>
  );
}
