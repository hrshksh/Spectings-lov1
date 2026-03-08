import { Navigate } from 'react-router-dom';
import { useUserSectionAccess, PROSPECT_SUBSECTIONS } from '@/hooks/useSectionAccess';
import { DashboardLayout } from '@/components/layout';
import { Loader2 } from 'lucide-react';

export default function PeopleIntelligence() {
  const { data: sections = [], isLoading } = useUserSectionAccess();

  if (isLoading) {
    return (
      <DashboardLayout title="Prospects" subtitle="">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to first assigned subsection
  const firstSub = PROSPECT_SUBSECTIONS.find(s => sections.includes(s.key));
  const redirectPath = firstSub?.path || '/prospects/for-sales';

  return <Navigate to={redirectPath} replace />;
}
