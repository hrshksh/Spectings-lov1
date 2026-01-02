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
} from '@/hooks/useUserManagement';
import { useCompanies } from '@/hooks/useAdminData';
import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

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

export default function DataManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
