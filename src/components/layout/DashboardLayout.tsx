import { ReactNode } from 'react';
import { Sidebar, SidebarProvider, MobileMenuTrigger } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

export function DashboardLayout({ children, title, subtitle, isAdmin = false }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar isAdmin={isAdmin} />
        <div className="md:pl-14 transition-all duration-300">
          <Header title={title} subtitle={subtitle} mobileMenuTrigger={<MobileMenuTrigger />} />
          <main className="px-4 py-5 lg:px-6 max-w-[1400px]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
