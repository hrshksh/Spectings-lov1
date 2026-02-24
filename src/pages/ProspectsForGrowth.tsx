import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Download, Mail, Phone, Linkedin, ChevronRight, Loader2,
  Users, X, Search, ArrowUpDown, ArrowUp, ArrowDown
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
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (error) throw error;
      // Filter client-side to those matching user tags
      return (data as Person[]).filter(p => p.tags?.some(t => userTags.includes(t)));
    },
    enabled: userTags.length > 0,
  });
}

type SortKey = 'name' | 'company' | 'role' | 'confidence';
type SortDir = 'asc' | 'desc' | null;

export default function ProspectsForGrowth() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { data: userTags = [], isLoading: tagsLoading } = useUserTags(user?.id);
  const { data: people = [], isLoading: peopleLoading } = usePeople(userTags);
  const isLoading = tagsLoading || peopleLoading;

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    people.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [people]);

  const filtered = useMemo(() => {
    let result = people;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q)
      );
    }
    if (tagFilter !== 'all') result = result.filter(p => p.tags?.includes(tagFilter));
    return result;
  }, [people, search, tagFilter]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) { if (sortDir === 'asc') setSortDir('desc'); else { setSortKey(null); setSortDir(null); } }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleAll = () => { selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map(p => p.id))); };

  const SortHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button className="flex items-center gap-1 hover:text-foreground transition-colors text-left" onClick={() => handleSort(sortField)}>
      <span>{label}</span>
      {sortKey === sortField ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );

  const confidenceBar = (score: number | null) => {
    if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-primary' : 'bg-amber-500'}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-mono font-medium w-7 text-right">{score}</span>
      </div>
    );
  };

  return (
    <DashboardLayout title="For Growth" subtitle="People profiles for growth opportunities">
      <div className="space-y-3 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search people..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedIds.size > 0 && <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>}
            <Button variant="outline" size="sm" className="h-8 text-xs"><Download className="h-3.5 w-3.5 mr-1" />Export</Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${selectedPerson ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : userTags.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No tags assigned</p>
                <p className="text-xs mt-1">Contact admin to assign tags.</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground"><p className="text-sm">No people match your filters</p></div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="w-10 pl-3"><Checkbox checked={selectedIds.size === sorted.length && sorted.length > 0} onCheckedChange={toggleAll} /></TableHead>
                        <TableHead className="min-w-[200px]"><SortHeader label="Name" sortField="name" /></TableHead>
                        <TableHead className="min-w-[140px]"><SortHeader label="Role" sortField="role" /></TableHead>
                        <TableHead className="min-w-[140px]"><SortHeader label="Company" sortField="company" /></TableHead>
                        <TableHead className="min-w-[180px]">Email</TableHead>
                        <TableHead className="min-w-[100px]">Phone</TableHead>
                        <TableHead className="min-w-[120px]">Tags</TableHead>
                        <TableHead className="min-w-[120px]"><SortHeader label="Confidence" sortField="confidence" /></TableHead>
                        <TableHead className="min-w-[50px]">Links</TableHead>
                        <TableHead className="w-8 pr-3" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map(p => {
                        const isSelected = selectedIds.has(p.id);
                        return (
                          <TableRow key={p.id} data-state={isSelected ? 'selected' : undefined} className={`cursor-pointer group ${selectedPerson?.id === p.id ? 'bg-accent' : ''}`} onClick={() => setSelectedPerson(p)}>
                            <TableCell className="pl-3 py-2" onClick={e => e.stopPropagation()}><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                                </div>
                                <span className="text-sm font-medium truncate">{p.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-xs">{p.role || '—'}</TableCell>
                            <TableCell className="py-2 text-xs">{p.company || '—'}</TableCell>
                            <TableCell className="py-2">
                              {p.email ? <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline truncate block">{p.email}</a> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="py-2">
                              {p.phone ? <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-foreground">{p.phone}</a> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-wrap gap-0.5">
                                {p.tags?.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0 font-normal">{t}</Badge>)}
                                {(p.tags?.length || 0) > 2 && <Badge variant="outline" className="text-[9px] px-1 py-0">+{(p.tags?.length || 0) - 2}</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="py-2">{confidenceBar(p.confidence as number | null)}</TableCell>
                            <TableCell className="py-2" onClick={e => e.stopPropagation()}>
                              {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-3.5 w-3.5" /></a>}
                            </TableCell>
                            <TableCell className="py-2 pr-3"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-border">
                  {sorted.map(p => (
                    <div key={p.id} className="p-3 cursor-pointer hover:bg-muted/30" onClick={() => setSelectedPerson(p)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-[10px] font-semibold">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.role} {p.company ? `· ${p.company}` : ''}</p>
                          </div>
                        </div>
                        {confidenceBar(p.confidence as number | null)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">{sorted.length} {sorted.length === 1 ? 'person' : 'people'}</span>
                </div>
              </>
            )}
          </Card>

          {/* Detail panel */}
          {selectedPerson && (
            <Card className="sticky top-20 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <h3 className="text-sm font-semibold truncate">{selectedPerson.name}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPerson(null)}><X className="h-3 w-3" /></Button>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-primary text-base font-bold">{selectedPerson.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedPerson.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPerson.role || 'No role'}</p>
                    <p className="text-xs text-muted-foreground">{selectedPerson.company || 'No company'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</h4>
                  {selectedPerson.email && <a href={`mailto:${selectedPerson.email}`} className="flex items-center gap-2 text-xs text-primary hover:underline"><Mail className="h-3 w-3" />{selectedPerson.email}</a>}
                  {selectedPerson.phone && <a href={`tel:${selectedPerson.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Phone className="h-3 w-3" />{selectedPerson.phone}</a>}
                  {selectedPerson.linkedin && <a href={selectedPerson.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Linkedin className="h-3 w-3" />LinkedIn</a>}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Confidence</span><div className="mt-0.5">{confidenceBar(selectedPerson.confidence as number | null)}</div></div>
                  </div>
                </div>
                {selectedPerson.tags && selectedPerson.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-1">{selectedPerson.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
