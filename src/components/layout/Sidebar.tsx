import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

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

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = location.pathname === path;
    const linkContent = (
      <Link
        to={path}
        className={cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );

    if (collapsed) {
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
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
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
  );
}
