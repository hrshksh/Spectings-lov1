import { Navigate } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Redirects to a slug-prefixed path using the user's org slug.
 * Used for legacy routes like /dashboard → /:slug/lists.
 */
export function SlugRedirect({ to }: { to: string }) {
  const { user, loading } = useAuth();
  const { organization, isLoading } = useOrganization();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const slug = organization?.slug || 'default';
  return <Navigate to={`/${slug}${to}`} replace />;
}
