import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Linkedin, Loader2, Users, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import type { Tables as DBTables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

type Person = DBTables<'people'>;

const PAGE_SIZE = 100;

function useUserTags(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-tags', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('user_tags').select('tag').eq('user_id', userId);
      if (error) throw error;
      return data.map(t => t.tag);
    },
    enabled: !!userId,
  });
}

function usePeople(userTags: string[]) {
  return useQuery({
    queryKey: ['people-for-growth', userTags],
    queryFn: async () => {
      const { data, error } = await supabase.from('people').select('*').order('created_at', { ascending: false }).limit(PAGE_SIZE);
      if (error) throw error;
      return (data as Person[]).filter(p => p.tags?.some(t => userTags.includes(t)));
    },
    enabled: userTags.length > 0,
  });
}

type SortKey = 'name' | 'company' | 'role' | 'confidence';
type SortDir = 'asc' | 'desc' | null;

export default function ProspectsForGrowth() {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: people = [], isLoading: peopleLoading } = usePeople(userTags);
  const isLoading = tagsLoading || peopleLoading;

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return people;
    return [...people].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'company': aVal = a.company ?? ''; bVal = b.company ?? ''; break;
        case 'role': aVal = a.role ?? ''; bVal = b.role ?? ''; break;
        case 'confidence': aVal = a.confidence ?? -1; bVal = b.confidence ?? -1; break;
      }
      if (aVal === bVal) return 0;
      return (aVal < bVal ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [people, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) { if (sortDir === 'asc') setSortDir('desc'); else { setSortKey(null); setSortDir(null); } }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleAll = () => { selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map(p => p.id))); };

  const SortIcon = ({ field }: { field: SortKey }) =>
    sortKey === field ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />;

  return (
    <DashboardLayout title="For Growth" subtitle="People profiles for growth opportunities" flush>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : userTags.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No tags assigned</p>
          <p className="text-xs mt-1">Contact admin to assign tags.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground"><p className="text-sm">No people found</p></div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-57px)]">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 backdrop-blur-sm">
                  <th className="w-10 px-3 py-2.5 border-b border-r border-border text-left">
                    <Checkbox checked={selectedIds.size === sorted.length && sorted.length > 0} onCheckedChange={toggleAll} />
                  </th>
                  <th className="min-w-[200px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('name')}><span>Full Name</span><SortIcon field="name" /></button>
                  </th>
                  <th className="min-w-[160px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('company')}><span>Company</span><SortIcon field="company" /></button>
                  </th>
                  <th className="min-w-[140px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('role')}><span>Role</span><SortIcon field="role" /></button>
                  </th>
                  <th className="min-w-[200px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Email</th>
                  <th className="min-w-[120px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Phone</th>
                  <th className="min-w-[100px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">Tags</th>
                  <th className="w-[70px] px-3 py-2.5 border-b border-r border-border text-left font-medium text-muted-foreground text-xs">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('confidence')}><span>Score</span><SortIcon field="confidence" /></button>
                  </th>
                  <th className="w-[50px] px-3 py-2.5 border-b border-border text-left font-medium text-muted-foreground text-xs">Links</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr key={p.id} className={`group transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/50' : ''}`}>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(p.id)} />
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                          </div>
                          <span className="text-sm font-medium truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs">{p.company || '—'}</td>
                      <td className="px-3 py-2 border-b border-r border-border text-xs text-muted-foreground">{p.role || '—'}</td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        {p.email ? <a href={`mailto:${p.email}`} className="text-xs text-primary hover:underline truncate block">{p.email}</a> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        {p.phone ? <a href={`tel:${p.phone}`} className="text-xs text-muted-foreground hover:text-foreground">{p.phone}</a> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border">
                        <div className="flex flex-wrap gap-0.5">
                          {p.tags?.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 font-normal">{t}</Badge>)}
                          {(p.tags?.length || 0) > 2 && <Badge variant="outline" className="text-[9px] px-1 py-0">+{(p.tags?.length || 0) - 2}</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b border-r border-border text-center">
                        {p.confidence != null ? <span className="text-xs font-mono font-medium">{p.confidence}</span> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 border-b border-border">
                        {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-3.5 w-3.5" /></a>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/20 shrink-0">
            <span className="text-[11px] text-muted-foreground">{sorted.length} {sorted.length === 1 ? 'person' : 'people'}</span>
            {selectedIds.size > 0 && <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
