import { useParams, useNavigate } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganization';
import { useCallback } from 'react';

/**
 * Provides the current org slug from the URL and helpers
 * to build slug-prefixed paths.
 */
export function useOrgSlug() {
  const { slug } = useParams<{ slug: string }>();
  const { organization, isLoading } = useOrganization();
  const navigate = useNavigate();

  const orgSlug = organization?.slug || slug || '';

  /** Build an absolute path prefixed with the org slug */
  const slugPath = useCallback(
    (path: string) => `/${orgSlug}${path}`,
    [orgSlug]
  );

  /** Navigate to a slug-prefixed path */
  const slugNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      navigate(slugPath(path), options);
    },
    [navigate, slugPath]
  );

  return {
    slug: orgSlug,
    organization,
    isLoading,
    slugPath,
    slugNavigate,
    /** Whether the URL slug matches the user's org */
    isValidSlug: !isLoading && !!slug && slug === organization?.slug,
  };
}
