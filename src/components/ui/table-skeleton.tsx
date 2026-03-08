import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  flush?: boolean;
}

export function TableSkeleton({ columns, rows = 12, flush = false }: TableSkeletonProps) {
  return (
    <div className={flush ? 'flex flex-col h-[calc(100vh-57px)]' : ''}>
      <div className={flush ? 'flex-1 overflow-hidden' : ''}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/60">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-3 py-2.5 border-b border-r border-border last:border-r-0">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-3 py-2.5 border-b border-r border-border last:border-r-0">
                    <Skeleton
                      className={`h-3 ${colIdx === 0 ? 'w-4' : colIdx === 1 ? 'w-4' : 'w-full max-w-[120px]'}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
