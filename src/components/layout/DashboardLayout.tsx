import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
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
      <div className="pl-52 transition-all duration-300">
        <Header title={title} subtitle={subtitle} />
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
