import { useState, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  X,
  Menu,
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
  setMobileOpen: () => {},
});

export const useSidebarState = () => useContext(SidebarContext);

interface SidebarProps {
  isAdmin?: boolean;
}

const userNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'People', path: '/people' },
  { icon: Building2, label: 'Companies', path: '/companies' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Task Queue', path: '/admin' },
  { icon: Users, label: 'Users & Roles', path: '/admin/users' },
  { icon: FileText, label: 'Data Management', path: '/admin/data' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function MobileMenuTrigger() {
  const { setMobileOpen } = useSidebarState();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden h-8 w-8"
      onClick={() => setMobileOpen(true)}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    setMobileOpen(false);
  };

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = location.pathname === path;
    const showLabel = !collapsed || mobileOpen;
    const linkContent = (
      <Link
        to={path}
        onClick={handleNavClick}
        className={cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent',
          !showLabel && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {showLabel && <span>{label}</span>}
      </Link>
    );

    if (!showLabel) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
          // Mobile: hidden by default, shown as overlay when mobileOpen
          'hidden md:flex',
          collapsed ? 'w-14' : 'w-52'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AB</span>
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground">AlllBrackets</span>
            </Link>
          )}
          {collapsed && (
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-xs">AB</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7', collapsed && 'hidden')}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {isAdmin && !collapsed && (
            <div className="mb-3 px-2.5">
              <Badge variant="default" className="text-[10px] py-0.5 px-1.5">Admin</Badge>
            </div>
          )}
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {!isAdmin && <NavItem icon={BookOpen} label="Case Studies" path="/case-studies" />}
          {!isAdmin && <NavItem icon={Shield} label="Admin Panel" path="/admin" />}
          {isAdmin && <NavItem icon={LayoutDashboard} label="User Dashboard" path="/dashboard" />}
          <button
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
            className={cn(
              'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Expand button */}
        {collapsed && (
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="mx-auto text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7 flex"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col w-64 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AB</span>
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground">AlllBrackets</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {isAdmin && (
            <div className="mb-3 px-2.5">
              <Badge variant="default" className="text-[10px] py-0.5 px-1.5">Admin</Badge>
            </div>
          )}
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {!isAdmin && <NavItem icon={BookOpen} label="Case Studies" path="/case-studies" />}
          {!isAdmin && <NavItem icon={Shield} label="Admin Panel" path="/admin" />}
          {isAdmin && <NavItem icon={LayoutDashboard} label="User Dashboard" path="/dashboard" />}
          <button
            onClick={async () => {
              setMobileOpen(false);
              await signOut();
              navigate('/auth');
            }}
            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
