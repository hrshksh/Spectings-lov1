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
      <div className="space-y-2 animate-fade-in">
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, company, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8"><Filter className="h-3.5 w-3.5 mr-1.5" />Filters</Button>
              <Button size="sm" className="h-8"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 gap-2 transition-all duration-300 ${selectedPerson ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          <div className={`transition-all duration-300 ${selectedPerson ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            <Card>
              <CardHeader className="py-2 px-3"><CardTitle className="text-sm font-medium">Verified Leads ({filteredPeople.length})</CardTitle></CardHeader>
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
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-medium">{person.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{person.name}</p>
                              <p className="text-xs text-muted-foreground">{person.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-sm">{person.role}</TableCell>
                        <TableCell className="py-2 text-sm">{person.company}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${person.confidence >= 90 ? 'bg-success' : person.confidence >= 80 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${person.confidence}%` }} />
                            </div>
                            <span className="text-xs">{person.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-3.5 w-3.5" /></Button>
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
              <Card className="sticky top-20 ring-1 ring-primary">
                <CardHeader className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">{selectedPerson.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <CardTitle className="text-sm">{selectedPerson.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{selectedPerson.role}</p>
                        <p className="text-xs text-primary">{selectedPerson.company}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedPerson(null); }}>
                      <ExternalLink className="h-3.5 w-3.5 rotate-45" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 px-3 pb-3">
                  <div className="space-y-0.5">
                    <a href={`mailto:${selectedPerson.email}`} className="flex items-center gap-1.5 p-1 rounded hover:bg-secondary text-xs">
                      <Mail className="h-3.5 w-3.5 text-primary" />{selectedPerson.email}
                    </a>
                    {selectedPerson.phone && (
                      <a href={`tel:${selectedPerson.phone}`} className="flex items-center gap-1.5 p-1 rounded hover:bg-secondary text-xs">
                        <Phone className="h-3.5 w-3.5 text-primary" />{selectedPerson.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPerson.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>))}
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t">
                    <Button size="sm" className="flex-1 h-7 text-xs"><Mail className="h-3 w-3 mr-1" />Contact</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs"><Download className="h-3 w-3 mr-1" />Export</Button>
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
