import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

export function DashboardLayout({ children, title, subtitle, isAdmin = false }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="pl-14 transition-all duration-300">
        <Header title={title} subtitle={subtitle} />
        <main className="px-4 py-5 lg:px-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
