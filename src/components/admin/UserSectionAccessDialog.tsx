import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  ASSIGNABLE_SECTIONS,
  PROSPECT_SUBSECTIONS,
  useUserSectionAccessById,
  useUpdateUserSectionAccess,
} from '@/hooks/useSectionAccess';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function UserSectionAccessDialog({ open, onOpenChange, userId, userName }: Props) {
  const { data: currentSections = [], isLoading } = useUserSectionAccessById(open ? userId : null);
  const updateAccess = useUpdateUserSectionAccess();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (currentSections.length >= 0) {
      setSelected([...currentSections]);
    }
  }, [currentSections]);

  const toggle = (key: string) => {
    setSelected(prev => {
      if (prev.includes(key)) {
        // If unchecking 'prospects', also remove subsections
        if (key === 'prospects') {
          return prev.filter(s => s !== key && !PROSPECT_SUBSECTIONS.some(sub => sub.key === s));
        }
        return prev.filter(s => s !== key);
      }
      return [...prev, key];
    });
  };

  const hasProspects = selected.includes('prospects');

  const handleSave = () => {
    updateAccess.mutate({ userId, sections: selected }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Section Access — {userName}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Lists is accessible to all users. Select which additional sections this user can access.</p>

            {/* Main sections */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Main Sections</Label>
              {ASSIGNABLE_SECTIONS.map(sec => (
                <div key={sec.key} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                  <Checkbox
                    id={sec.key}
                    checked={selected.includes(sec.key)}
                    onCheckedChange={() => toggle(sec.key)}
                  />
                  <label htmlFor={sec.key} className="text-sm font-medium cursor-pointer">{sec.label}</label>
                </div>
              ))}
            </div>

            {/* Prospect subsections — only shown if prospects is enabled */}
            {hasProspects && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prospect Subsections</Label>
                {PROSPECT_SUBSECTIONS.map(sub => (
                  <div key={sub.key} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 ml-4">
                    <Checkbox
                      id={sub.key}
                      checked={selected.includes(sub.key)}
                      onCheckedChange={() => toggle(sub.key)}
                    />
                    <label htmlFor={sub.key} className="text-sm font-medium cursor-pointer">{sub.label}</label>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleSave} disabled={updateAccess.isPending} className="w-full h-8 text-xs">
              {updateAccess.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Save Access
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
