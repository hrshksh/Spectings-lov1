import { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useUserSectionAccess, PROSPECT_SUBSECTIONS, hasSection, hasProspectSubsection } from '@/hooks/useSectionAccess';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Eye,
  Activity,
  List,
  BookOpen,
  Shield,
  X,
  ImagePlus,
  Menu,
  Megaphone,
  Library,
  Settings,
} from 'lucide-react';

// Context to share sidebar state with layout
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {}
});

export const useSidebarState = () => useContext(SidebarContext);

interface SidebarProps {
  isAdmin?: boolean;
}

const userNavItems = [
{ icon: UsersRound, label: 'Prospects', path: '/people', section: 'prospects' },
{ icon: Eye, label: 'Inspects', path: '/inspects', section: 'inspects' },
{ icon: Activity, label: 'Perspects', path: '/perspects', section: 'perspects' },
{ icon: List, label: 'Lists', path: '/lists', section: null }];


const adminNavItems: Array<{ icon: React.ElementType; label: string; path: string; section: string | null }> = [
{ icon: LayoutDashboard, label: 'Task Queue', path: '/admin', section: null },
{ icon: Users, label: 'Users & Roles', path: '/admin/users', section: null },
{ icon: UsersRound, label: 'Prospects', path: '/admin/prospects', section: null },
{ icon: Eye, label: 'Inspects', path: '/admin/inspects', section: null },
{ icon: Activity, label: 'Perspects', path: '/admin/perspects', section: null },
{ icon: Library, label: 'Services', path: '/admin/services', section: null },
{ icon: Megaphone, label: 'Ad Management', path: '/admin/ads', section: null },
{ icon: ImagePlus, label: 'Logo', path: '/admin/logo', section: null }];


export function SidebarProvider({ children }: {children: React.ReactNode;}) {
  const [collapsed] = useState(false);
  const setCollapsed = () => {};
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>);

}

export function MobileMenuTrigger() {
  const { setMobileOpen } = useSidebarState();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden h-8 w-8"
      onClick={() => setMobileOpen(true)}>

      <Menu className="h-4 w-4" />
    </Button>);

}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebarState();
  const location = useLocation();
  const { isAdmin: hasAdminAccess } = useAuth();
  const { resolvedTheme } = useTheme();
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const { data: sectionAccess = [] } = useUserSectionAccess();

  // Filter user nav items by section access (admin sees all)
  const filteredNavItems = isAdmin
    ? navItems
    : navItems.filter(item => item.section === null || hasSection(sectionAccess, item.section));

  // Prospect subsections the user has access to
  const selectedSubsections = PROSPECT_SUBSECTIONS.filter(s => hasProspectSubsection(sectionAccess, s.key));

  // Fetch site logo
  const { data: siteLogo } = useQuery({
    queryKey: ['site-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_logos')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const logoUrl = resolvedTheme === 'dark' ? siteLogo?.dark_logo_url : siteLogo?.light_logo_url;

  // Fetch active ad banner for user sidebar
  const { data: activeBanner } = useQuery({
    queryKey: ['active-ad-banner'],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('ad_banners').
      select('*').
      eq('is_active', true).
      eq('position', 'sidebar').
      limit(1).
      maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isAdmin
  });

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    setMobileOpen(false);
  };

  const NavItem = ({ icon: Icon, label, path }: {icon: React.ElementType;label: string;path: string;}) => {
    const isActive = location.pathname === path;
    const showLabel = !collapsed || mobileOpen;
    const linkContent =
    <Link
      to={path}
      onClick={handleNavClick}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200',
        isActive ?
        'bg-primary text-primary-foreground shadow-sm' :
        'text-sidebar-foreground hover:bg-sidebar-accent',
        !showLabel && 'justify-center px-2'
      )}>

        <Icon className="h-4 w-4 flex-shrink-0" />
        {showLabel && <span>{label}</span>}
      </Link>;


    if (!showLabel) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
        </Tooltip>);

    }

    return linkContent;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen &&
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={() => setMobileOpen(false)} />

      }

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
          // Mobile: hidden by default, shown as overlay when mobileOpen
          'hidden md:flex',
          collapsed ? 'w-14' : 'w-56'
        )}>

        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed &&
          <Link to={isAdmin ? '/admin' : '/people'} className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-7 w-14 object-contain" />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">BK</span>
                </div>
              )}
            </Link>
          }
          {collapsed &&
          <Link to={isAdmin ? '/admin' : '/people'} className="mx-auto">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-7 w-14 object-contain" />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">BK</span>
                </div>
              )}
            </Link>
          }
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {isAdmin && !collapsed &&
          <div className="mb-3 px-2.5">
              <Badge variant="default" className="text-[10px] py-0.5 px-1.5">Admin</Badge>
            </div>
          }
          {filteredNavItems.map((item) => (
            <div key={item.path}>
              <NavItem {...item} />
              {!isAdmin && item.label === 'Prospects' && selectedSubsections.length > 0 && (
                <div className="ml-[1.15rem] mt-0.5 relative">
                  {selectedSubsections.map((sub, idx) => {
                    const isLast = idx === selectedSubsections.length - 1;
                    return (
                      <div key={sub.path} className="relative">
                        <div className={cn(
                          'absolute left-0 top-0 w-0 border-l-2 border-sidebar-border',
                          isLast ? 'h-1/2' : 'h-full'
                        )} />
                        <div className="absolute left-0 top-1/2 w-3 h-0 border-t-2 border-sidebar-border" />
                        <Link
                          to={sub.path}
                          onClick={handleNavClick}
                          className={cn(
                            'block rounded-lg ml-4 px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200',
                            location.pathname === sub.path
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          )}>
                          {sub.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Ad Banner - user sidebar only, hidden when no active banner */}
        {!isAdmin && !collapsed && activeBanner?.image_url &&
        <div className="p-2">
            <a
            href={activeBanner.link_url || '#'}
            target={activeBanner.link_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity">

              <img src={activeBanner.image_url} alt={activeBanner.title} className="w-full h-auto rounded-lg" />
            </a>
          </div>
        }

        {/* Bottom nav links */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {!isAdmin && <NavItem icon={Library} label="Services" path="/services" />}
          {!isAdmin && <NavItem icon={BookOpen} label="Case Studies" path="/case-studies" />}
          {!isAdmin && <NavItem icon={Settings} label="Settings" path="/settings" />}
          {!isAdmin && hasAdminAccess && <NavItem icon={Shield} label="Admin Panel" path="/admin" />}
          {isAdmin && <NavItem icon={Users} label="User View" path="/people" />}
        </div>

      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col w-64 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>

        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <Link to={isAdmin ? '/admin' : '/people'} className="flex items-center" onClick={handleNavClick}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 w-14 object-contain" />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">BK</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7">

            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {isAdmin &&
          <div className="mb-3 px-2.5">
              <Badge variant="default" className="text-[10px] py-0.5 px-1.5">Admin</Badge>
            </div>
          }
          {filteredNavItems.map((item) => (
            <div key={item.path}>
              <NavItem {...item} />
              {!isAdmin && item.label === 'Prospects' && selectedSubsections.length > 0 && (
                <div className="ml-[1.15rem] mt-0.5 relative">
                  {selectedSubsections.map((sub, idx) => {
                    const isLast = idx === selectedSubsections.length - 1;
                    return (
                      <div key={sub.path} className="relative">
                        <div className={cn(
                          'absolute left-0 top-0 w-0 border-l-2 border-sidebar-border',
                          isLast ? 'h-1/2' : 'h-full'
                        )} />
                        <div className="absolute left-0 top-1/2 w-3 h-0 border-t-2 border-sidebar-border" />
                        <Link
                          to={sub.path}
                          onClick={handleNavClick}
                          className={cn(
                            'block rounded-lg ml-4 px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200',
                            location.pathname === sub.path
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          )}>
                          {sub.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Ad Banner - user mobile sidebar only, hidden when no active banner */}
        {!isAdmin && activeBanner?.image_url &&
        <div className="p-2">
            <a
            href={activeBanner.link_url || '#'}
            target={activeBanner.link_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity">

              <img src={activeBanner.image_url} alt={activeBanner.title} className="w-full h-auto rounded-lg" />
            </a>
          </div>
        }

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {!isAdmin && <NavItem icon={Library} label="Services" path="/services" />}
          {!isAdmin && <NavItem icon={BookOpen} label="Case Studies" path="/case-studies" />}
          {!isAdmin && <NavItem icon={Settings} label="Settings" path="/settings" />}
          {!isAdmin && hasAdminAccess && <NavItem icon={Shield} label="Admin Panel" path="/admin" />}
          {isAdmin && <NavItem icon={LayoutDashboard} label="User Dashboard" path="/dashboard" />}
        </div>
      </aside>
    </>);

}