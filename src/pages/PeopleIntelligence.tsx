import { Navigate } from 'react-router-dom';
import { useProspectSelections, PROSPECT_SUBSECTIONS } from '@/hooks/useProspectSelections';
import { DashboardLayout } from '@/components/layout';
import { Loader2 } from 'lucide-react';

export default function PeopleIntelligence() {
  const { data: selections, isLoading } = useProspectSelections();

  if (isLoading) {
    return (
      <DashboardLayout title="Prospects" subtitle="">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to first selected subsection, or For Sales by default
  const firstSelected = PROSPECT_SUBSECTIONS.find(s => selections?.includes(s.key));
  const redirectPath = firstSelected?.path || '/prospects/for-sales';

  return <Navigate to={redirectPath} replace />;
}
