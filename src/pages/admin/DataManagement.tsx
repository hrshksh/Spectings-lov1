import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Trash2,
  Users,
  Building2,
  Calendar,
  Loader2,
  ExternalLink,
  Tag,
  X,
} from 'lucide-react';
import {
  usePeople,
  useOrganizations,
  useCompanyEvents,
  useCreatePerson,
  useDeletePerson,
  useCreateOrganization,
  useDeleteOrganization,
  useCreateCompanyEvent,
  useDeleteCompanyEvent,
  useLeads,
  useCreateLead,
  useDeleteLead,
  useUpdatePersonTags,
} from '@/hooks/useUserManagement';
import { useCompanies } from '@/hooks/useAdminData';
import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type CompanyEventType = Database['public']['Enums']['company_event_type'];

const eventTypeLabels: Record<CompanyEventType, string> = {
  pricing_change: 'Pricing Change',
  product_launch: 'Product Launch',
  hiring: 'Hiring',
  campaign: 'Campaign',
  news: 'News',
  review: 'Review',
  funding: 'Funding',
  acquisition: 'Acquisition',
};

// Fetch all profiles for user tag assignment
function useProfiles() {
  return useQuery({
    queryKey: ['profiles-for-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email');
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch all user tags
function useAllUserTags() {
  return useQuery({
    queryKey: ['all-user-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .order('tag');
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch available tags from people table
function useAvailableTags() {
  return useQuery({
    queryKey: ['available-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('tags');
      
      if (error) throw error;
      
      const tags = new Set<string>();
      data.forEach(person => {
        person.tags?.forEach(tag => tags.add(tag));
      });
      return Array.from(tags).sort();
    },
  });
}

export default function DataManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const queryClient = useQueryClient();

  // People state
  const { data: people, isLoading: peopleLoading } = usePeople();
  const createPerson = useCreatePerson();
  const deletePerson = useDeletePerson();
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin: '',
  });

  // Organizations state
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const createOrganization = useCreateOrganization();
  const deleteOrganization = useDeleteOrganization();
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', industry: '' });

  // Events state
  const { data: events, isLoading: eventsLoading } = useCompanyEvents();
  const { data: companies } = useCompanies();
  const createEvent = useCreateCompanyEvent();
  const deleteEvent = useDeleteCompanyEvent();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    company_id: '',
    event_type: '' as CompanyEventType | '',
    summary: '',
    confidence: 80,
  });

  // User Tags state
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: userTags, isLoading: tagsLoading } = useAllUserTags();
  const { data: availableTags = [] } = useAvailableTags();
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagAssignment, setNewTagAssignment] = useState({ user_id: '', tag: '' });

  // Leads state
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();
  const updatePersonTags = useUpdatePersonTags();
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({ person_id: '', notes: '', source: '', tags: '' });
  const [editTagsDialogOpen, setEditTagsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<{ personId: string; personName: string; currentTags: string[] } | null>(null);
  const [editTagsValue, setEditTagsValue] = useState('');

  const addUserTag = useMutation({
    mutationFn: async ({ user_id, tag }: { user_id: string; tag: string }) => {
      const { error } = await supabase
        .from('user_tags')
        .insert({ user_id, tag: tag.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-tags'] });
      setTagDialogOpen(false);
      setNewTagAssignment({ user_id: '', tag: '' });
      toast({ title: 'Tag assigned successfully' });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({ title: 'Tag already assigned to this user', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to assign tag', description: error.message, variant: 'destructive' });
      }
    },
  });

  const removeUserTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-tags'] });
      toast({ title: 'Tag removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to remove tag', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreatePerson = () => {
    if (!newPerson.name.trim()) return;
    createPerson.mutate(newPerson, {
      onSuccess: () => {
        setPersonDialogOpen(false);
        setNewPerson({ name: '', email: '', phone: '', company: '', role: '', linkedin: '' });
      },
    });
  };

  const handleCreateOrg = () => {
    if (!newOrg.name.trim()) return;
    createOrganization.mutate(newOrg, {
      onSuccess: () => {
        setOrgDialogOpen(false);
        setNewOrg({ name: '', industry: '' });
      },
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.company_id || !newEvent.event_type) return;
    createEvent.mutate(
      {
        company_id: newEvent.company_id,
        event_type: newEvent.event_type as CompanyEventType,
        summary: newEvent.summary || undefined,
        confidence: newEvent.confidence / 100,
        published_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setEventDialogOpen(false);
          setNewEvent({ company_id: '', event_type: '', summary: '', confidence: 80 });
        },
      }
    );
  };

  const handleCreateLead = () => {
    if (!newLead.person_id) return;
    
    // First update the person's tags if provided
    const tagsArray = newLead.tags.split(',').map(t => t.trim()).filter(Boolean);
    const selectedPerson = people?.find(p => p.id === newLead.person_id);
    
    if (tagsArray.length > 0 && selectedPerson) {
      const existingTags = selectedPerson.tags || [];
      const newTags = [...new Set([...existingTags, ...tagsArray])];
      updatePersonTags.mutate({ personId: newLead.person_id, tags: newTags });
    }
    
    createLead.mutate(
      {
        person_id: newLead.person_id,
        notes: newLead.notes || undefined,
        source: newLead.source || undefined,
      },
      {
        onSuccess: () => {
          setLeadDialogOpen(false);
          setNewLead({ person_id: '', notes: '', source: '', tags: '' });
        },
      }
    );
  };

  const handleEditTags = () => {
    if (!editingLead) return;
    const tagsArray = editTagsValue.split(',').map(t => t.trim()).filter(Boolean);
    updatePersonTags.mutate(
      { personId: editingLead.personId, tags: tagsArray },
      {
        onSuccess: () => {
          setEditTagsDialogOpen(false);
          setEditingLead(null);
          setEditTagsValue('');
        },
      }
    );
  };

  const openEditTagsDialog = (personId: string, personName: string, currentTags: string[]) => {
    setEditingLead({ personId, personName, currentTags });
    setEditTagsValue(currentTags.join(', '));
    setEditTagsDialogOpen(true);
  };

  const filteredPeople = people?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = organizations?.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events?.filter(
    (e) =>
      e.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.company as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group user tags by user_id for display
  const userTagsMap = userTags?.reduce((acc, tag) => {
    if (!acc[tag.user_id]) {
      acc[tag.user_id] = [];
    }
    acc[tag.user_id].push(tag);
    return acc;
  }, {} as Record<string, typeof userTags>) || {};

  const filteredProfiles = profiles?.filter(
    (p) =>
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeads = leads?.filter(
    (l) =>
      (l.person as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.person as any)?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.person as any)?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get people that are not already leads
  const leadPersonIds = new Set(leads?.map(l => l.person_id) || []);
  const availablePeopleForLeads = people?.filter(p => !leadPersonIds.has(p.id)) || [];

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <DashboardLayout title="Data Management" subtitle="Manage people, organizations, and events" isAdmin>
      <div className="space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="people" className="gap-2">
                <Users className="h-4 w-4" />
                People
              </TabsTrigger>
              <TabsTrigger value="organizations" className="gap-2">
                <Building2 className="h-4 w-4" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="user-tags" className="gap-2">
                <Tag className="h-4 w-4" />
                User Tags
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* People Tab */}
          <TabsContent value="people">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>People</CardTitle>
                    <CardDescription>{people?.length || 0} records</CardDescription>
                  </div>
                  <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Person
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Person</DialogTitle>
                        <DialogDescription>Enter the person's details below.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newPerson.name}
                            onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newPerson.email}
                              onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                              placeholder="john@example.com"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newPerson.phone}
                              onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                              placeholder="+1 234 567 890"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={newPerson.company}
                              onChange={(e) => setNewPerson({ ...newPerson, company: e.target.value })}
                              placeholder="Acme Corp"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                              id="role"
                              value={newPerson.role}
                              onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                              placeholder="CEO"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={newPerson.linkedin}
                            onChange={(e) => setNewPerson({ ...newPerson, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/johndoe"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPersonDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePerson} disabled={createPerson.isPending || !newPerson.name.trim()}>
                          {createPerson.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {peopleLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredPeople && filteredPeople.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPeople.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">{person.name}</TableCell>
                          <TableCell>{person.email || '-'}</TableCell>
                          <TableCell>{person.company || '-'}</TableCell>
                          <TableCell>{person.role || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={Number(person.confidence) >= 80 ? 'success' : 'warning'}>
                              {Math.round(Number(person.confidence) * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {person.linkedin && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deletePerson.mutate(person.id)}
                                disabled={deletePerson.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No people found matching your search' : 'No people found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organizations</CardTitle>
                    <CardDescription>{organizations?.length || 0} records</CardDescription>
                  </div>
                  <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Organization</DialogTitle>
                        <DialogDescription>Enter the organization's details below.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="org-name">Name *</Label>
                          <Input
                            id="org-name"
                            value={newOrg.name}
                            onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            value={newOrg.industry}
                            onChange={(e) => setNewOrg({ ...newOrg, industry: e.target.value })}
                            placeholder="Technology"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateOrg} disabled={createOrganization.isPending || !newOrg.name.trim()}>
                          {createOrganization.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {orgsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredOrgs && filteredOrgs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.industry || '-'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(org.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteOrganization.mutate(org.id)}
                              disabled={deleteOrganization.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No organizations found matching your search' : 'No organizations found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Company Events</CardTitle>
                    <CardDescription>{events?.length || 0} records</CardDescription>
                  </div>
                  <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>Create a new company event.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="company">Company *</Label>
                          <Select
                            value={newEvent.company_id}
                            onValueChange={(value) => setNewEvent({ ...newEvent, company_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies?.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="event-type">Event Type *</Label>
                          <Select
                            value={newEvent.event_type}
                            onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value as CompanyEventType })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Constants.public.Enums.company_event_type.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {eventTypeLabels[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="summary">Summary</Label>
                          <Textarea
                            id="summary"
                            value={newEvent.summary}
                            onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                            placeholder="Describe the event..."
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confidence">Confidence ({newEvent.confidence}%)</Label>
                          <Input
                            id="confidence"
                            type="range"
                            min="0"
                            max="100"
                            value={newEvent.confidence}
                            onChange={(e) => setNewEvent({ ...newEvent, confidence: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateEvent}
                          disabled={createEvent.isPending || !newEvent.company_id || !newEvent.event_type}
                        >
                          {createEvent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEvents && filteredEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {(event.company as any)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{eventTypeLabels[event.event_type]}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {event.summary || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={Number(event.confidence) >= 0.8 ? 'success' : 'warning'}>
                              {Math.round(Number(event.confidence) * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {event.published_at
                              ? new Date(event.published_at).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteEvent.mutate(event.id)}
                              disabled={deleteEvent.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No events found matching your search' : 'No events found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leads</CardTitle>
                    <CardDescription>
                      {leads?.length || 0} leads - Add people as leads with tags. Users see leads matching their assigned tags.
                    </CardDescription>
                  </div>
                  <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Person as Lead</DialogTitle>
                        <DialogDescription>
                          Select a person and assign tags. Users with matching tags will see this lead.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="lead-person">Person *</Label>
                          <Select
                            value={newLead.person_id}
                            onValueChange={(value) => setNewLead({ ...newLead, person_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a person" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePeopleForLeads.map((person) => (
                                <SelectItem key={person.id} value={person.id}>
                                  {person.name} {person.company ? `(${person.company})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {availablePeopleForLeads.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              All people are already leads or no people exist.
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lead-tags">Tags (comma-separated)</Label>
                          <Input
                            id="lead-tags"
                            value={newLead.tags}
                            onChange={(e) => setNewLead({ ...newLead, tags: e.target.value })}
                            placeholder="e.g., enterprise, healthcare, usa"
                          />
                          {availableTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {availableTags.slice(0, 8).map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => {
                                    const currentTags = newLead.tags.split(',').map(t => t.trim()).filter(Boolean);
                                    if (!currentTags.includes(tag)) {
                                      setNewLead({ ...newLead, tags: [...currentTags, tag].join(', ') });
                                    }
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lead-source">Source</Label>
                          <Input
                            id="lead-source"
                            value={newLead.source}
                            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                            placeholder="e.g., LinkedIn, Conference, Referral"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lead-notes">Notes</Label>
                          <Textarea
                            id="lead-notes"
                            value={newLead.notes}
                            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                            placeholder="Additional notes about this lead..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setLeadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateLead}
                          disabled={createLead.isPending || !newLead.person_id}
                        >
                          {createLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Lead
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredLeads && filteredLeads.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Person</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => {
                        const person = lead.person as any;
                        return (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{person?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{person?.email || '-'}</div>
                              </div>
                            </TableCell>
                            <TableCell>{person?.company || '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {person?.tags?.length > 0 ? (
                                  person.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">No tags</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{lead.source || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                lead.status === 'verified' ? 'success' : 
                                lead.status === 'rejected' ? 'destructive' : 'outline'
                              }>
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditTagsDialog(person?.id, person?.name, person?.tags || [])}
                                >
                                  <Tag className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteLead.mutate(lead.id)}
                                  disabled={deleteLead.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No leads found matching your search' : 'No leads found. Add people as leads to get started.'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Tags Dialog */}
            <Dialog open={editTagsDialogOpen} onOpenChange={setEditTagsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Tags for {editingLead?.personName}</DialogTitle>
                  <DialogDescription>
                    Update the tags for this lead. Users with matching tags will see this lead.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                    <Input
                      id="edit-tags"
                      value={editTagsValue}
                      onChange={(e) => setEditTagsValue(e.target.value)}
                      placeholder="e.g., enterprise, healthcare, usa"
                    />
                    {availableTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {availableTags.slice(0, 10).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => {
                              const currentTags = editTagsValue.split(',').map(t => t.trim()).filter(Boolean);
                              if (!currentTags.includes(tag)) {
                                setEditTagsValue([...currentTags, tag].join(', '));
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditTagsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditTags}
                    disabled={updatePersonTags.isPending}
                  >
                    {updatePersonTags.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Tags
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* User Tags Tab */}
          <TabsContent value="user-tags">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Tag Assignments</CardTitle>
                    <CardDescription>
                      Assign tags to users to control which leads they can see
                    </CardDescription>
                  </div>
                  <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Tag to User</DialogTitle>
                        <DialogDescription>
                          Select a user and tag to assign. Users will see leads matching their assigned tags.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="user">User *</Label>
                          <Select
                            value={newTagAssignment.user_id}
                            onValueChange={(value) => setNewTagAssignment({ ...newTagAssignment, user_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {profiles?.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                  {profile.full_name || profile.email} ({profile.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tag">Tag *</Label>
                          <div className="space-y-2">
                            <Input
                              id="tag"
                              value={newTagAssignment.tag}
                              onChange={(e) => setNewTagAssignment({ ...newTagAssignment, tag: e.target.value })}
                              placeholder="Enter tag name or select below"
                            />
                            {availableTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {availableTags.slice(0, 10).map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => setNewTagAssignment({ ...newTagAssignment, tag })}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {availableTags.length > 10 && (
                                  <Badge variant="secondary">+{availableTags.length - 10} more</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addUserTag.mutate(newTagAssignment)}
                          disabled={addUserTag.isPending || !newTagAssignment.user_id || !newTagAssignment.tag.trim()}
                        >
                          {addUserTag.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Assign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {profilesLoading || tagsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProfiles && filteredProfiles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Assigned Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>{getInitials(profile.full_name, profile.email)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{profile.full_name || 'No name'}</div>
                                <div className="text-sm text-muted-foreground">{profile.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {userTagsMap[profile.id]?.length > 0 ? (
                                userTagsMap[profile.id].map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="cursor-pointer group"
                                    onClick={() => removeUserTag.mutate(tag.id)}
                                  >
                                    {tag.tag}
                                    <X className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">No tags assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewTagAssignment({ user_id: profile.id, tag: '' });
                                setTagDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Tag
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
