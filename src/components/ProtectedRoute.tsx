import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSectionAccess } from '@/hooks/useSectionAccess';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requiredSection?: string;
  /** For prospect subsections, also require the subsection key */
  requiredSubsection?: string;
}

export function ProtectedRoute({ children, requireAdmin = false, requiredSection, requiredSubsection }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const { data: sectionAccess, isLoading: sectionsLoading } = useUserSectionAccess();

  if (loading || sectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/lists" replace />;
  }

  // Admins bypass section access checks
  if (!isAdmin && requiredSection && sectionAccess) {
    if (!sectionAccess.includes(requiredSection)) {
      return <Navigate to="/lists" replace />;
    }
  }

  if (!isAdmin && requiredSubsection && sectionAccess) {
    if (!sectionAccess.includes(requiredSubsection)) {
      return <Navigate to="/lists" replace />;
    }
  }

  return <>{children}</>;
}
