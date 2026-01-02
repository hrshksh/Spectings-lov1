import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
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
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Task Queue', path: '/admin' },
  { icon: FileText, label: 'Evidence Viewer', path: '/admin/evidence' },
  { icon: Users, label: 'People Manager', path: '/admin/people' },
  { icon: Building2, label: 'Company Manager', path: '/admin/companies' },
  { icon: TrendingUp, label: 'Analytics Manager', path: '/admin/analytics' },
  { icon: BookOpen, label: 'Case Studies', path: '/admin/case-studies' },
  { icon: Settings, label: 'Automation', path: '/admin/automation' },
  { icon: Shield, label: 'Quality Control', path: '/admin/qc' },
];

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-12 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px]">AB</span>
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground">AlllBrackets</span>
            </Link>
          )}
          {collapsed && (
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-[10px]">AB</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('text-sidebar-foreground hover:bg-sidebar-accent h-6 w-6', collapsed && 'hidden')}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
          {isAdmin && !collapsed && (
            <div className="mb-2 px-2">
              <Badge variant="default" className="text-[10px] py-0.5 px-1.5">Admin Dashboard</Badge>
            </div>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5',
                  collapsed && 'justify-center px-1.5 hover:translate-x-0'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          {!isAdmin && (
            <Link
              to="/case-studies"
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200',
                location.pathname === '/case-studies'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5',
                collapsed && 'justify-center px-1.5 hover:translate-x-0'
              )}
            >
              <BookOpen className={cn(
                'h-4 w-4 transition-transform duration-200',
                location.pathname !== '/case-studies' && 'group-hover:scale-110'
              )} />
              {!collapsed && <span>Case Studies</span>}
            </Link>
          )}
          {!isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:translate-x-0.5',
                collapsed && 'justify-center px-1.5 hover:translate-x-0'
              )}
            >
              <Shield className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/dashboard"
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:translate-x-0.5',
                collapsed && 'justify-center px-1.5 hover:translate-x-0'
              )}
            >
              <LayoutDashboard className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>User Dashboard</span>}
            </Link>
          )}
          <button
            className={cn(
              'group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full hover:translate-x-0.5',
              collapsed && 'justify-center px-1.5 hover:translate-x-0'
            )}
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse button */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mx-auto mb-3 text-sidebar-foreground hover:bg-sidebar-accent h-6 w-6"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </aside>
  );
}
