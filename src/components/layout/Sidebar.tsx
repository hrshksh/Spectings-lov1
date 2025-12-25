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
  { icon: Users, label: 'People Intelligence', path: '/people' },
  { icon: Building2, label: 'Company Intelligence', path: '/companies' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: BookOpen, label: 'Case Studies', path: '/case-studies' },
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
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AB</span>
              </div>
              <span className="font-semibold text-lg text-sidebar-foreground">AlllBrackets</span>
            </Link>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">AB</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8', collapsed && 'hidden')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {isAdmin && !collapsed && (
            <div className="mb-4 px-3">
              <Badge variant="default" className="text-xs">Admin Dashboard</Badge>
            </div>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {!isAdmin && (
            <Link
              to="/admin"
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                collapsed && 'justify-center px-2'
              )}
            >
              <Shield className="h-5 w-5" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                collapsed && 'justify-center px-2'
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {!collapsed && <span>User Dashboard</span>}
            </Link>
          )}
          <button
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse button */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mx-auto mb-4 text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
