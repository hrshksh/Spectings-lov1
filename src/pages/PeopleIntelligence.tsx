import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Mail, Phone, ExternalLink, ChevronRight, Loader2, Users, CheckCircle, Clock } from 'lucide-react';
import { useRealtimeTable } from '@/hooks/useRealtimeData';
import type { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type Person = Tables<'people'>;
type Lead = Tables<'leads'>;

// Fetch leads with person data
function useLeadsWithPeople() {
  return useQuery({
    queryKey: ['leads-with-people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          person:people(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export default function PeopleIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'verified' | 'pending'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  
  const { data: people, loading: peopleLoading } = useRealtimeTable<Person>('people');
  const { data: leadsData, isLoading: leadsLoading } = useLeadsWithPeople();

  // Get verified and pending person IDs from leads
  const verifiedPersonIds = useMemo(() => {
    return new Set(leadsData?.filter(l => l.status === 'verified').map(l => l.person_id) || []);
  }, [leadsData]);

  const pendingPersonIds = useMemo(() => {
    return new Set(leadsData?.filter(l => l.status === 'pending').map(l => l.person_id) || []);
  }, [leadsData]);

  // Filter people based on search, view mode, and confidence
  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      // Search filter
      const matchesSearch = 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (person.role?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      // View mode filter
      let matchesViewMode = true;
      if (viewMode === 'verified') {
        matchesViewMode = verifiedPersonIds.has(person.id);
      } else if (viewMode === 'pending') {
        matchesViewMode = pendingPersonIds.has(person.id);
      }

      // Confidence filter
      let matchesConfidence = true;
      const confidence = person.confidence || 0;
      if (confidenceFilter === 'high') {
        matchesConfidence = confidence >= 90;
      } else if (confidenceFilter === 'medium') {
        matchesConfidence = confidence >= 70 && confidence < 90;
      } else if (confidenceFilter === 'low') {
        matchesConfidence = confidence < 70;
      }

      return matchesSearch && matchesViewMode && matchesConfidence;
    });
  }, [people, searchQuery, viewMode, confidenceFilter, verifiedPersonIds, pendingPersonIds]);

  const stats = useMemo(() => ({
    total: people.length,
    verified: verifiedPersonIds.size,
    pending: pendingPersonIds.size,
  }), [people.length, verifiedPersonIds.size, pendingPersonIds.size]);

  const isLoading = peopleLoading || leadsLoading;

  const getLeadStatus = (personId: string) => {
    if (verifiedPersonIds.has(personId)) return 'verified';
    if (pendingPersonIds.has(personId)) return 'pending';
    return null;
  };

  return (
    <DashboardLayout title="People Intelligence" subtitle="Contact database and verified leads">
      <div className="space-y-2 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewMode('all')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${viewMode === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total People</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewMode('verified')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${viewMode === 'verified' ? 'bg-success text-success-foreground' : 'bg-success/10 text-success'}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewMode('pending')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${viewMode === 'pending' ? 'bg-warning text-warning-foreground' : 'bg-warning/10 text-warning'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, company, role, or email..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-8 h-8 text-sm" 
                />
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'all' | 'verified' | 'pending')}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs h-6">All</TabsTrigger>
                  <TabsTrigger value="verified" className="text-xs h-6">Verified</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs h-6">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High (90%+)</SelectItem>
                  <SelectItem value="medium">Medium (70-89%)</SelectItem>
                  <SelectItem value="low">Low (&lt;70%)</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" />Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 gap-2 transition-all duration-300 ${selectedPerson ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          <div className={`transition-all duration-300 ${selectedPerson ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">
                  {viewMode === 'all' ? 'People Database' : viewMode === 'verified' ? 'Verified Leads' : 'Pending Leads'} 
                  ({filteredPeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredPeople.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPeople.map((person) => {
                        const leadStatus = getLeadStatus(person.id);
                        return (
                          <TableRow 
                            key={person.id} 
                            className={`cursor-pointer transition-all duration-150 ${selectedPerson?.id === person.id ? 'bg-muted/80 border-l-2 border-l-foreground' : 'hover:bg-muted/40'}`} 
                            onClick={() => setSelectedPerson(person)}
                          >
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs font-medium">
                                    {person.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{person.name}</p>
                                  <p className="text-xs text-muted-foreground">{person.email || 'No email'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-sm">{person.role || '-'}</TableCell>
                            <TableCell className="py-2 text-sm">{person.company || '-'}</TableCell>
                            <TableCell className="py-2">
                              {leadStatus === 'verified' ? (
                                <Badge variant="success" className="text-xs">Verified</Badge>
                              ) : leadStatus === 'pending' ? (
                                <Badge variant="warning" className="text-xs">Pending</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Contact</Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      (person.confidence || 0) >= 90 ? 'bg-success' : 
                                      (person.confidence || 0) >= 70 ? 'bg-primary' : 'bg-warning'
                                    }`} 
                                    style={{ width: `${person.confidence || 0}%` }} 
                                  />
                                </div>
                                <span className="text-xs">{person.confidence || 0}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery || viewMode !== 'all' || confidenceFilter !== 'all' 
                      ? 'No people match your filters' 
                      : 'No people in database yet'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedPerson && (
            <div className="animate-fade-in">
              <Card className="sticky top-20 border-foreground/30 shadow-sm">
                <CardHeader className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">
                          {selectedPerson.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-sm">{selectedPerson.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{selectedPerson.role || 'No role'}</p>
                        <p className="text-xs text-primary">{selectedPerson.company || 'No company'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={(e) => { e.stopPropagation(); setSelectedPerson(null); }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 rotate-45" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 px-3 pb-3">
                  <div className="space-y-0.5">
                    {selectedPerson.email && (
                      <a href={`mailto:${selectedPerson.email}`} className="flex items-center gap-1.5 p-1 rounded hover:bg-secondary text-xs">
                        <Mail className="h-3.5 w-3.5 text-primary" />{selectedPerson.email}
                      </a>
                    )}
                    {selectedPerson.phone && (
                      <a href={`tel:${selectedPerson.phone}`} className="flex items-center gap-1.5 p-1 rounded hover:bg-secondary text-xs">
                        <Phone className="h-3.5 w-3.5 text-primary" />{selectedPerson.phone}
                      </a>
                    )}
                    {selectedPerson.linkedin && (
                      <a href={selectedPerson.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 p-1 rounded hover:bg-secondary text-xs">
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />LinkedIn
                      </a>
                    )}
                  </div>
                  {selectedPerson.tags && selectedPerson.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedPerson.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-medium">{selectedPerson.confidence || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (selectedPerson.confidence || 0) >= 90 ? 'bg-success' : 
                          (selectedPerson.confidence || 0) >= 70 ? 'bg-primary' : 'bg-warning'
                        }`} 
                        style={{ width: `${selectedPerson.confidence || 0}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t">
                    <Button size="sm" className="flex-1 h-7 text-xs" disabled={!selectedPerson.email}>
                      <Mail className="h-3 w-3 mr-1" />Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                      <Download className="h-3 w-3 mr-1" />Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
