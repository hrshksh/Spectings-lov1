import { ReactNode } from 'react';
import { Sidebar, SidebarProvider, MobileMenuTrigger, useSidebarState } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

function DashboardContent({ children, title, subtitle, isAdmin }: DashboardLayoutProps) {
  const { collapsed } = useSidebarState();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className={cn('transition-all duration-300', collapsed ? 'md:pl-14' : 'md:pl-56')}>
        <Header title={title} subtitle={subtitle} mobileMenuTrigger={<MobileMenuTrigger />} />
        <main className="px-4 py-5 lg:px-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent {...props} />
    </SidebarProvider>
  );
}
