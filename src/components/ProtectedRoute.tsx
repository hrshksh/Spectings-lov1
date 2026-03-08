import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserSectionAccess } from '@/hooks/useSectionAccess';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requiredSection?: string;
  requiredSubsection?: string;
}

export function ProtectedRoute({ children, requireAdmin = false, requiredSection, requiredSubsection }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const { organization, isLoading: orgLoading } = useOrganization();
  const { data: sectionAccess, isLoading: sectionsLoading } = useUserSectionAccess();
  const { slug } = useParams<{ slug: string }>();

  if (loading || sectionsLoading || orgLoading) {
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
    const orgSlug = organization?.slug || 'default';
    return <Navigate to={`/${orgSlug}/lists`} replace />;
  }

  // For slug-based routes, validate the slug matches user's org
  if (slug && organization?.slug && slug !== organization.slug) {
    return <Navigate to={`/${organization.slug}/lists`} replace />;
  }

  const orgSlug = slug || organization?.slug || 'default';

  // Admins bypass section access checks
  if (!isAdmin && requiredSection && sectionAccess) {
    if (!sectionAccess.includes(requiredSection)) {
      return <Navigate to={`/${orgSlug}/lists`} replace />;
    }
  }

  if (!isAdmin && requiredSubsection && sectionAccess) {
    if (!sectionAccess.includes(requiredSubsection)) {
      return <Navigate to={`/${orgSlug}/lists`} replace />;
    }
  }

  return <>{children}</>;
}
