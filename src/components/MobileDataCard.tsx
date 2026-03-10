import { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MobileDataCardProps {
  id: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export function MobileDataCard({ id, selected, onSelect, children, className }: MobileDataCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 transition-colors',
        selected && 'bg-muted/50 border-primary/20',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(id)}
            className="mt-0.5 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

interface CardFieldProps {
  label: string;
  children: ReactNode;
}

export function CardField({ label, children }: CardFieldProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-xs text-right truncate">{children}</span>
    </div>
  );
}
