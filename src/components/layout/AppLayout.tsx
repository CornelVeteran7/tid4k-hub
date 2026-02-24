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
  BookOpen, BarChart3, Settings, LogOut, Menu, X, Monitor, Facebook, MessageCircle, ClipboardList, Bell, ArrowLeft, Image, Paintbrush, SlidersHorizontal, User, GraduationCap, Award
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from 'react-router-dom';
import logoWhite from '@/assets/logo-white.png';
import InkyAssistant from '@/components/InkyAssistant';
import TutorialOverlay from '@/components/TutorialOverlay';

// Secondary nav — items NOT on the dashboard
const SECONDARY_NAV = [
  { path: '/orar', label: 'Orar', icon: Calendar, roles: ['profesor', 'parinte', 'director', 'administrator'] },
  { path: '/anunturi', label: 'Anunțuri', icon: Megaphone, roles: ['profesor', 'parinte', 'director', 'administrator'] },
];

// Admin nav — role-gated
const ADMIN_NAV = [
  { path: '/rapoarte', label: 'Rapoarte', icon: BarChart3, roles: ['director', 'administrator'] },
  { path: '/utilizatori', label: 'Utilizatori', icon: Users, roles: ['administrator'] },
  { path: '/configurari', label: 'Configurări', icon: Settings, roles: ['administrator'] },
  { path: '/sponsori', label: 'Sponsori', icon: Award, roles: ['administrator'] },
  { path: '/sponsor-dashboard', label: 'Dashboard Sponsor', icon: Award, roles: ['sponsor'] },
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
  const { unreadMessages, newAnnouncements } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avizierOpen, setAvizierOpen] = useState(false);
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

  const showGroupSelector =
    areRol(userStatus, 'director') ||
    areRol(userStatus, 'administrator') ||
    userIsInky ||
    availableGroups.length > 1;

  const canSee = (roles: string[]) =>
    roles.some((role) => areRol(userStatus, role) || userIsInky);

  const visibleSecondary = SECONDARY_NAV.filter(i => canSee(i.roles));
  const visibleAdmin = ADMIN_NAV.filter(i => canSee(i.roles));

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
    <div className="flex h-screen overflow-hidden">
      {/* ===== DESKTOP SIDEBAR — persistent, minimal ===== */}
      <aside className="hidden lg:flex lg:relative w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center px-4 py-5 border-b border-sidebar-border">
          <img src={logoWhite} alt="InfoDisplay" className="h-7" />
        </div>

        {/* Group selector */}
        {showGroupSelector && (
          <div data-tutorial="group-selector" className="px-3 py-3 border-b border-sidebar-border">
            <Select value={currentGroup?.id || ''} onValueChange={switchGroup}>
              <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Primary: Home */}
          <NavLink to="/" end className={navLinkClass} activeClassName={activeClass}>
            <Home className="h-5 w-5 shrink-0" />
            <span>Acasă</span>
          </NavLink>

          {/* Secondary: Orar, Anunturi */}
          {visibleSecondary.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin section */}
          {visibleAdmin.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Admin</span>
              </div>
              {visibleAdmin.map((item) => (
                <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Inky exclusive */}
          {userIsInky && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Superuser</span>
              </div>
              {INKY_ITEMS.map((item) => (
                <NavLink key={item.path} to={item.path} className={navLinkClass} activeClassName={activeClass}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Tutorial replay */}
          <div className="pt-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('restart-tutorial'))}
              className={navLinkClass}
            >
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
                {userRoles.slice(0, 2).map((r) => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                    {getRoleLabel(r)}
                  </span>
                ))}
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
        <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-0">
          <SheetHeader className="px-4 pt-5 pb-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold shrink-0">
                {user.nume_prenume.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-sm font-semibold text-sidebar-foreground truncate text-left">
                  {user.nume_prenume}
                </SheetTitle>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {userRoles.slice(0, 2).map((r) => (
                    <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                      {getRoleLabel(r)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {/* Configurare module */}
            <button
              onClick={handleOpenConfigSidebar}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5 shrink-0" />
              <span>Configurare module</span>
            </button>

            {/* Secondary nav */}
            {visibleSecondary.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}

            {/* Profilul meu (coming soon) */}
            <button
              disabled
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-foreground/40 cursor-not-allowed"
            >
              <User className="h-5 w-5 shrink-0" />
              <span>Profilul meu</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider opacity-60">În curând</span>
            </button>

            {/* Tutorial */}
            <button
              onClick={() => { window.dispatchEvent(new CustomEvent('restart-tutorial')); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
            >
              <GraduationCap className="h-5 w-5 shrink-0" />
              <span>Tutorial</span>
            </button>

            {/* Admin section */}
            {visibleAdmin.length > 0 && (
              <>
                <Separator className="my-2 bg-sidebar-border" />
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Admin</span>
                </div>
                {visibleAdmin.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </>
            )}

            {/* Inky exclusive */}
            {userIsInky && (
              <>
                <Separator className="my-2 bg-sidebar-border" />
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Superuser</span>
                </div>
                {INKY_ITEMS.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
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
            {!isHome ? (
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Button data-tutorial="menu-button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Center: group selector — mobile only */}
          {showGroupSelector && (
            <div data-tutorial="group-selector" className="flex-1 flex justify-center min-w-0 px-2 lg:hidden">
              <Select value={currentGroup?.id || ''} onValueChange={switchGroup}>
                <SelectTrigger className="w-full max-w-[180px]">
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
                }}
              />
            </div>

            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button data-tutorial="notifications" variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4.5 w-4.5" />
                  {(unreadMessages + newAnnouncements > 0) && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadMessages + newAnnouncements}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0 glass-card">
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold">Notificări</p>
                </div>
                <div className="p-2 space-y-1">
                  {unreadMessages > 0 && (
                    <button
                      onClick={() => { navigate('/mesaje'); setNotifOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                    >
                      <MessageSquare className="h-4 w-4 text-accent shrink-0" />
                      <span className="flex-1">{unreadMessages} mesaje necitite</span>
                    </button>
                  )}
                  {newAnnouncements > 0 && (
                    <button
                      onClick={() => { navigate('/anunturi'); setNotifOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Megaphone className="h-4 w-4 text-warning shrink-0" />
                      <span className="flex-1">{newAnnouncements} anunțuri noi</span>
                    </button>
                  )}
                  {unreadMessages === 0 && newAnnouncements === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">Nicio notificare nouă</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <a href="https://tid4kdemo.ro/avizier/tid4k.html" target="_blank" rel="noopener noreferrer" className="focus:outline-none shrink-0">
              <img src="/favicon.png" alt="InfoDisplay — Avizier" className="h-7 w-7" />
            </a>
          </div>
        </header>

        {/* Search bar — mobile only */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-3 py-2 border-b border-border/30 lg:hidden">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
            <input
              type="text"
              placeholder="Cauta..."
              className="w-full h-10 rounded-lg bg-muted/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) => {
                window.dispatchEvent(new CustomEvent('dashboard-search', { detail: e.target.value }));
              }}
            />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24">
          {children}
        </main>
        <InkyAssistant />
        <TutorialOverlay />
      </div>
    </div>
  );
}
