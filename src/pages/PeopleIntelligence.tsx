import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Mail, Linkedin, Phone, ExternalLink, ChevronRight } from 'lucide-react';
import { mockPeople } from '@/data/mockData';
import { Person } from '@/types';

export default function PeopleIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = mockPeople.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="People Intelligence" subtitle="Verified leads and contact database">
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, company, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40"><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" />More Filters</Button>
              <Button><Download className="h-4 w-4 mr-2" />Export CSV</Button>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${selectedPerson ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          <div className={`transition-all duration-300 ${selectedPerson ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            <Card>
              <CardHeader><CardTitle>Verified Leads ({filteredPeople.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPeople.map((person) => (
                      <TableRow key={person.id} className={`cursor-pointer ${selectedPerson?.id === person.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedPerson(person)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">{person.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                              <p className="font-medium">{person.name}</p>
                              <p className="text-xs text-muted-foreground">{person.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{person.role}</TableCell>
                        <TableCell>{person.company}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${person.confidence >= 90 ? 'bg-success' : person.confidence >= 80 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${person.confidence}%` }} />
                            </div>
                            <span className="text-sm">{person.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {selectedPerson && (
            <div className="animate-fade-in">
              <Card className="sticky top-24 ring-2 ring-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xl font-bold">{selectedPerson.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <CardTitle>{selectedPerson.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedPerson.role}</p>
                        <p className="text-sm text-primary">{selectedPerson.company}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedPerson(null); }}>
                      <ExternalLink className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <a href={`mailto:${selectedPerson.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                      <Mail className="h-4 w-4 text-primary" /><span className="text-sm">{selectedPerson.email}</span>
                    </a>
                    {selectedPerson.phone && (
                      <a href={`tel:${selectedPerson.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                        <Phone className="h-4 w-4 text-primary" /><span className="text-sm">{selectedPerson.phone}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.tags.map((tag) => (<Badge key={tag} variant="secondary">{tag}</Badge>))}
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1"><Mail className="h-4 w-4 mr-2" />Contact</Button>
                    <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Export</Button>
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
