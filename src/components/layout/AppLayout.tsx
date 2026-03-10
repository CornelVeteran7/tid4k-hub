import { useAuth } from '@/contexts/AuthContext';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { useActiveModules } from '@/hooks/useActiveModules';
import { useGroup } from '@/contexts/GroupContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { NotificationItem } from '@/contexts/NotificationContext';
import { areRol, isInky, getRoleLabel, getRoles } from '@/utils/roles';
import { NavLink } from '@/components/NavLink';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Home, Users, FileText, MessageSquare, Megaphone, Calendar, UtensilsCrossed,
  BookOpen, BarChart3, Settings, LogOut, Menu, X, Monitor, Facebook, MessageCircle, ClipboardList, Bell, ArrowLeft, Image, Paintbrush, SlidersHorizontal, User, GraduationCap, Award, Package, ShieldCheck, Newspaper, Theater, HardHat, Video, Ticket, Coins } from
'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useExternalLink } from '@/contexts/ExternalLinkContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.png';
import InkyAssistant from '@/components/InkyAssistant';
import TutorialOverlay from '@/components/TutorialOverlay';
import QuickUpload from '@/components/QuickUpload';
import WhiteLabelSwitcher from '@/components/WhiteLabelSwitcher';

/* Decorative SVG background for sidebar — white contour lines + flower + bee */
function SidebarDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 280 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">

        <g stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.08">
          {/* Fewer, more spaced curvy lines */}
          <path d="M-10,80 C40,50 100,110 160,75 C220,40 250,100 290,70" />
          <path d="M-10,250 C60,220 120,280 180,245 C240,210 270,260 290,240" />
          <path d="M-10,450 C50,480 120,420 180,460 C240,500 260,440 290,470" />
          <path d="M-10,650 C70,620 130,680 190,645 C250,610 270,660 290,640" />
          <path d="M-10,820 C40,850 110,790 170,830 C230,870 260,810 290,840" />
        </g>

        {/* Flower — upper-right area */}
        <g transform="translate(200, 180)" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45">
          <ellipse cx="0" cy="-10" rx="4" ry="8" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(72)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(144)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(216)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(288)" />
          <circle cx="0" cy="0" r="3.5" />
          <path d="M0,8 C-1,24 1,42 -2,60" />
          <path d="M-1,28 C-11,23 -12,33 -4,36" />
          <path d="M0,45 C8,40 11,48 4,52" />
        </g>

        {/* Bee — lower-left area */}
        <g transform="translate(70, 620) rotate(-15)" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45">
          <ellipse cx="0" cy="0" rx="9" ry="5" />
          <line x1="-2.5" y1="-4.5" x2="-2.5" y2="4.5" />
          <line x1="2.5" y1="-5" x2="2.5" y2="5" />
          <circle cx="11" cy="0" r="3.5" />
          <path d="M13,-2.5 C15,-8 18,-9 20,-6" />
          <path d="M13.5,-1.5 C17,-7 20,-6 21,-3" />
          <ellipse cx="-1" cy="-7.5" rx="6" ry="3" transform="rotate(-12, -1, -7.5)" />
          <ellipse cx="3" cy="-8" rx="5.5" ry="2.5" transform="rotate(10, 3, -8)" />
          <line x1="-9" y1="0" x2="-12" y2="0.5" />
        </g>
      </svg>
    </div>);

}

// Secondary nav — items NOT on the dashboard
const SECONDARY_NAV: { path: string; label: string; icon: any; roles: string[]; moduleKey?: string; verticals?: string[] }[] = [
{ path: '/prezenta', label: 'Prezența', icon: ClipboardList, roles: ['profesor', 'parinte', 'director', 'administrator', 'secretara'], verticals: ['kids', 'schools'] },
{ path: '/orar', label: 'Orar', icon: Calendar, roles: ['profesor', 'parinte', 'director', 'administrator'], moduleKey: 'orar' },
{ path: '/anunturi', label: 'Anunțuri', icon: Megaphone, roles: ['profesor', 'parinte', 'director', 'administrator'], moduleKey: 'anunturi' },
{ path: '/povesti', label: 'Povești', icon: BookOpen, roles: ['profesor', 'parinte', 'director', 'administrator'], verticals: ['kids'] },
{ path: '/santiere', label: 'Șantiere', icon: HardHat, roles: ['profesor', 'director', 'administrator'], verticals: ['construction'] },
{ path: '/inventar', label: 'Inventar QR', icon: Package, roles: ['profesor', 'director', 'administrator'], verticals: ['workshops', 'construction', 'kids', 'schools', 'living'] },
{ path: '/ssm', label: 'SSM', icon: ShieldCheck, roles: ['profesor', 'director', 'administrator'], verticals: ['construction'] },
{ path: '/revista', label: 'Revista Școlii', icon: Newspaper, roles: ['profesor', 'parinte', 'director', 'administrator'], verticals: ['schools'] },
{ path: '/supratitrare', label: 'Supratitrare', icon: Theater, roles: ['profesor', 'director', 'administrator'], verticals: ['culture'] },
{ path: '/video', label: 'Generare Video', icon: Video, roles: ['profesor', 'director', 'administrator'], verticals: ['kids', 'schools', 'medicine', 'culture'] },
{ path: '/social-whatsapp', label: 'WhatsApp', icon: MessageCircle, roles: ['director', 'administrator'], verticals: ['kids', 'schools'] },
{ path: '/social-facebook', label: 'Facebook', icon: Facebook, roles: ['director', 'administrator'], verticals: ['kids', 'schools'] },
{ path: '/coada', label: 'Gestionare Coadă', icon: Ticket, roles: ['profesor', 'director', 'administrator'], verticals: ['medicine', 'students'] },
{ path: '/contributii', label: 'Contribuții', icon: Coins, roles: ['profesor', 'parinte', 'director', 'administrator', 'secretara'], verticals: ['kids'] },
];


// Admin nav — role-gated
const ADMIN_NAV = [
{ path: '/sponsori', label: 'Sponsori', icon: Award, roles: ['director', 'administrator'] },
{ path: '/rapoarte', label: 'Rapoarte', icon: BarChart3, roles: ['director', 'administrator'] },
{ path: '/settings', label: 'Configurări', icon: Settings, roles: ['director', 'administrator'] },
{ path: '/admin', label: 'Panou Admin', icon: Settings, roles: ['administrator'] },
{ path: '/infodisplay', label: 'InfoDisplay', icon: Monitor, roles: ['profesor', 'director', 'administrator'] }];


const INKY_ITEMS = [
{ path: '/superadmin', label: 'Super Admin', icon: Settings },
{ path: '/orar-cancelarie', label: 'Orar CANCELARIE', icon: Calendar }];


function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Acum';
  if (diffMins < 60) return `Acum ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Acum ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `Acum ${diffDays} zile`;
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

export function AppLayout({ children }: {children: React.ReactNode;}) {
  const { user, logout, isDemo } = useAuth();
  const { currentGroup, availableGroups, switchGroup } = useGroup();
  const { unreadMessages, newAnnouncements, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { openLink } = useExternalLink();
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!user) return null;

  const userStatus = user.status;
  const userIsInky = isInky(userStatus, user.nume_prenume);
  const userRoles = getRoles(userStatus);
  const isHome = location.pathname === '/';
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;
  const verticalDef = VERTICAL_DEFINITIONS[verticalType];
  const { activeModules } = useActiveModules(user.organization_id, verticalType);

  const showGroupSelector =
  areRol(userStatus, 'director') ||
  areRol(userStatus, 'administrator') ||
  userIsInky ||
  availableGroups.length > 1;

  const canSee = (roles: string[]) =>
  roles.some((role) => areRol(userStatus, role) || userIsInky);

  const visibleSecondary = SECONDARY_NAV.filter((i) => {
    if (!canSee(i.roles)) return false;
    if (i.verticals && !i.verticals.includes(verticalType)) return false;
    if (i.moduleKey && !activeModules.has(i.moduleKey)) return false;
    return true;
  });
  const visibleAdmin = ADMIN_NAV.filter((i) => canSee(i.roles));

  const navLinkClass = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";
  const activeClass = "bg-sidebar-accent text-sidebar-accent-foreground";

  const handleOpenConfigSidebar = () => {
    setMobileMenuOpen(false);
    // Navigate home first if not there, then dispatch event
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-config-sidebar')), 300);
    } else {
      window.dispatchEvent(new CustomEvent('open-config-sidebar'));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Demo mode banner */}
      {isDemo && (
        <div className="bg-amber-500 text-amber-950 text-center text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-3 shrink-0 z-50">
          <span>⚠️ MOD DEMO — Datele nu sunt salvate</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="underline hover:no-underline font-bold"
          >
            Ieși din demo
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
      {/* ===== DESKTOP SIDEBAR — persistent, minimal ===== */}
      <aside className="hidden lg:flex lg:relative w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 relative overflow-hidden">
        <SidebarDecoration />
        {/* Logo */}
        <div className="flex items-center px-4 py-5 border-b border-sidebar-border">
          <img src={logoWhite} alt="InfoDisplay" className="h-11" />
        </div>

        {/* Group selector */}
        {showGroupSelector &&
        <div data-tutorial="group-selector" className="px-3 py-3 border-b border-sidebar-border">
            <Select value={currentGroup?.id || ''} onValueChange={switchGroup}>
              <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue placeholder={`Selectează ${verticalDef.entityLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((g) =>
              <SelectItem key={g.id} value={g.id}>{g.nume}</SelectItem>
              )}
              </SelectContent>
            </Select>
          </div>
        }

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Primary: Home */}
          <NavLink to="/" end className={navLinkClass} activeClassName={activeClass}>
            <Home className="h-5 w-5 shrink-0" />
            <span>Acasă</span>
          </NavLink>

          {/* Secondary: Orar, Anunturi */}
          {visibleSecondary.map((item) =>
          <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )}

          {/* Admin section */}
          {visibleAdmin.length > 0 &&
          <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Admin</span>
              </div>
              {visibleAdmin.map((item) =>
            <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
            )}
            </>
          }

          {/* Inky exclusive */}
          {userIsInky &&
          <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Superuser</span>
              </div>
              {INKY_ITEMS.map((item) =>
            <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
            )}
            </>
          }

          {/* Profilul meu */}
          <NavLink to="/profil" className={navLinkClass} activeClassName={activeClass}>
            <User className="h-5 w-5 shrink-0" />
            <span>Profilul meu</span>
          </NavLink>

          {/* Tutorial replay */}
          <div className="pt-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('restart-tutorial'))}
              className={navLinkClass}>

              <GraduationCap className="h-5 w-5 shrink-0" />
              <span>Tutorial</span>
            </button>
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold shrink-0">
              {user.nume_prenume.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nume_prenume}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {userRoles.slice(0, 2).map((r) =>
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                    {getRoleLabel(r)}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM SHEET MENU ===== */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 bg-accent/90 text-accent-foreground p-0 overflow-hidden">
          <SidebarDecoration />
          <SheetHeader className="px-4 pt-5 pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user.nume_prenume.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-sm font-semibold text-white truncate text-left">
                  {user.nume_prenume}
                </SheetTitle>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {userRoles.slice(0, 2).map((r) =>
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded text-white bg-white/20">
                      {getRoleLabel(r)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {/* Configurare module */}
            <button
              onClick={handleOpenConfigSidebar}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">

              <SlidersHorizontal className="h-5 w-5 shrink-0" />
              <span>Configurare module</span>
            </button>

            {/* Secondary nav */}
            {visibleSecondary.map((item) =>
            <button
              key={item.path}
              onClick={() => {navigate(item.path);setMobileMenuOpen(false);}}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              location.pathname === item.path ?
              'bg-white/20 text-white' :
              'text-white/80 hover:bg-white/10'}`
              }>

                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )}

            {/* Profilul meu */}
            <button
              onClick={() => {navigate('/profil');setMobileMenuOpen(false);}}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              location.pathname === '/profil' ?
              'bg-white/20 text-white' :
              'text-white/80 hover:bg-white/10'}`
              }>

              <User className="h-5 w-5 shrink-0" />
              <span>Profilul meu</span>
            </button>

            {/* Tutorial */}
            <button
              onClick={() => {window.dispatchEvent(new CustomEvent('restart-tutorial'));setMobileMenuOpen(false);}}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">

              <GraduationCap className="h-5 w-5 shrink-0" />
              <span>Tutorial</span>
            </button>

            {/* Admin section */}
            {visibleAdmin.length > 0 &&
            <>
                <Separator className="my-2 bg-white/15" />
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Admin</span>
                </div>
                {visibleAdmin.map((item) =>
              <button
                key={item.path}
                onClick={() => {navigate(item.path);setMobileMenuOpen(false);}}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.path ?
                'bg-white/20 text-white' :
                'text-white/80 hover:bg-white/10'}`
                }>

                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
              )}
              </>
            }

            {/* Inky exclusive */}
            {userIsInky &&
            <>
                <Separator className="my-2 bg-white/15" />
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Superuser</span>
                </div>
                {INKY_ITEMS.map((item) =>
              <button
                key={item.path}
                onClick={() => {navigate(item.path);setMobileMenuOpen(false);}}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">

                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
              )}
              </>
            }
          </div>

          {/* Logout */}
          <div className="border-t border-white/15 p-3">
            <button
              onClick={() => {logout();setMobileMenuOpen(false);}}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">

              <LogOut className="h-5 w-5 shrink-0" />
              <span>Deconectare</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header ref={headerRef} className="glass-header relative flex items-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 lg:px-6 z-40">
          {/* Left: back arrow on inner pages (mobile) or hamburger */}
          <div className="flex items-center shrink-0">
            {!isHome ?
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button> :

            <Button data-tutorial="menu-button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            }
          </div>

          {/* Mobile: search icon OR expanded search input */}
          {!mobileSearchOpen ?
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 shrink-0"
            onClick={() => {
              setMobileSearchOpen(true);
              setTimeout(() => mobileSearchRef.current?.focus(), 50);
            }}>

              <Search className="h-4.5 w-4.5" />
            </Button> :

          <div className="flex-1 flex items-center min-w-0 px-1 lg:hidden">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Caută..."
                autoFocus
                className="w-full h-8 rounded-lg bg-muted/60 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => {
                  window.dispatchEvent(new CustomEvent('dashboard-search', { detail: e.target.value }));
                }}
                onBlur={(e) => {
                  if (!e.target.value) setMobileSearchOpen(false);
                }} />

                <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMobileSearchOpen(false);
                  window.dispatchEvent(new CustomEvent('dashboard-search', { detail: '' }));
                }}>

                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          }

          {/* Center: group selector — mobile only (hidden when search is expanded) */}
          {showGroupSelector && !mobileSearchOpen &&
          <div data-tutorial="group-selector" className="flex-1 flex justify-center min-w-0 px-2 lg:hidden">
              <Select value={currentGroup?.id || ''} onValueChange={switchGroup}>
                <SelectTrigger className="w-full max-w-[180px]">
                  <SelectValue placeholder={`Selectează ${verticalDef.entityLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((g) =>
                <SelectItem key={g.id} value={g.id}>{g.nume}</SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }

          {/* Desktop: page title */}
          <div className="hidden lg:flex flex-1 items-center min-w-0">
            <h2 className="text-lg font-display font-bold text-foreground truncate">
              {isHome ? `Bun venit, ${user.nume_prenume.split(' ')[0]}!` : ''}
            </h2>
          </div>

          {/* Right: notifications + favicon */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <div className="hidden lg:block relative mr-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
              <input
                type="text"
                placeholder="Cauta..."
                className="w-64 h-9 rounded-lg bg-muted/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => {
                  window.dispatchEvent(new CustomEvent('dashboard-search', { detail: e.target.value }));
                }} />

            </div>

            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button data-tutorial="notifications" variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadMessages + newAnnouncements > 0 &&
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadMessages + newAnnouncements}
                    </span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 glass-card">
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <p className="text-sm font-semibold">Notificări</p>
                  {notifications.some((n) => !n.read) &&
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">

                      Marchează toate ca citite
                    </button>
                  }
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ?
                  <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Nicio notificare</p>
                    </div> :

                  <div className="p-1.5 space-y-0.5">
                      {/* Unread section */}
                      {notifications.some((n) => !n.read) &&
                    <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Necitite</p>
                    }
                      {notifications.filter((n) => !n.read).map((notif) => {
                      const timeAgo = getTimeAgo(notif.timestamp);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            navigate(notif.navigateTo);
                            setNotifOpen(false);
                          }}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted/60 transition-all text-left bg-primary/5">

                            <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.icon === 'alert' ?
                          'bg-destructive/10 text-destructive' :
                          notif.icon === 'message' ?
                          'bg-sky-500/10 text-sky-600' :
                          notif.icon === 'paintbrush' ?
                          'bg-purple-500/10 text-purple-600' :
                          'bg-amber-500/10 text-amber-600'}`
                          }>
                              {notif.icon === 'message' ?
                            <MessageSquare className="h-4 w-4" /> :
                            notif.icon === 'paintbrush' ?
                            <Paintbrush className="h-4 w-4" /> :
                            <Megaphone className="h-4 w-4" />
                            }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold truncate">{notif.title}</span>
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.description}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo}</p>
                            </div>
                          </button>);

                    })}
                      {/* Read history section */}
                      {notifications.some((n) => n.read) &&
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Istoric</p>
                    }
                      {notifications.filter((n) => n.read).map((notif) => {
                      const timeAgo = getTimeAgo(notif.timestamp);
                      return (
                        <button
                          key={notif.id}
                          onClick={() => {
                            navigate(notif.navigateTo);
                            setNotifOpen(false);
                          }}
                          className="w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/40 transition-all text-left opacity-60">

                            <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.icon === 'alert' ?
                          'bg-destructive/10 text-destructive' :
                          notif.icon === 'message' ?
                          'bg-sky-500/10 text-sky-600' :
                          notif.icon === 'paintbrush' ?
                          'bg-purple-500/10 text-purple-600' :
                          'bg-amber-500/10 text-amber-600'}`
                          }>
                              {notif.icon === 'message' ?
                            <MessageSquare className="h-4 w-4" /> :
                            notif.icon === 'paintbrush' ?
                            <Paintbrush className="h-4 w-4" /> :
                            <Megaphone className="h-4 w-4" />
                            }
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{notif.title}</span>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.description}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo}</p>
                            </div>
                          </button>);

                    })}
                    </div>
                  }
                </div>
              </PopoverContent>
            </Popover>
            <button onClick={() => openLink('https://tid4kdemo.ro/avizier/tid4k.html')} className="focus:outline-none shrink-0">
              <img src="/favicon.png" alt="InfoDisplay — Avizier" className="h-7 w-7" />
            </button>
          </div>
        </header>

        {/* Mobile search bar removed — now inline in header */}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24">
          {children}
        </main>
        <InkyAssistant />
        <TutorialOverlay />
        <QuickUpload />
        {isDemo && <WhiteLabelSwitcher />}
      </div>



    </div>
    </div>);

}