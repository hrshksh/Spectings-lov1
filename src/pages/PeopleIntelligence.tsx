import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, Mail, Linkedin, Phone, ExternalLink, ChevronRight } from 'lucide-react';
import { mockPeople, mockLeads } from '@/data/mockData';
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
        {/* Filters */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="90">90%+</SelectItem>
                  <SelectItem value="80">80%+</SelectItem>
                  <SelectItem value="70">70%+</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="glow">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* People List */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Verified Leads ({filteredPeople.length})</CardTitle>
              </CardHeader>
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
                      <TableRow
                        key={person.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPerson?.id === person.id ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedPerson(person)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </span>
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
                              <div
                                className={`h-full rounded-full ${
                                  person.confidence >= 90 ? 'bg-success' :
                                  person.confidence >= 80 ? 'bg-primary' : 'bg-warning'
                                }`}
                                style={{ width: `${person.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm">{person.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Profile Panel */}
          <div>
            {selectedPerson ? (
              <Card variant="glow" className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground text-xl font-bold">
                        {selectedPerson.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle>{selectedPerson.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedPerson.role}</p>
                      <p className="text-sm text-primary">{selectedPerson.company}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</h4>
                    <div className="space-y-2">
                      <a href={`mailto:${selectedPerson.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm">{selectedPerson.email}</span>
                      </a>
                      {selectedPerson.phone && (
                        <a href={`tel:${selectedPerson.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="text-sm">{selectedPerson.phone}</span>
                        </a>
                      )}
                      {selectedPerson.linkedin && (
                        <a href={`https://${selectedPerson.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Linkedin className="h-4 w-4 text-primary" />
                          <span className="text-sm">View Profile</span>
                          <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPerson.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Quality</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            selectedPerson.confidence >= 90 ? 'bg-success' :
                            selectedPerson.confidence >= 80 ? 'bg-primary' : 'bg-warning'
                          }`}
                          style={{ width: `${selectedPerson.confidence}%` }}
                        />
                      </div>
                      <span className="font-semibold">{selectedPerson.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: {selectedPerson.lastUpdated}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button variant="glow" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="glass" className="sticky top-24">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Select a Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a person from the list to view their complete profile and contact details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
