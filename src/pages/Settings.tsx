import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Bell,
  CreditCard,
  Users,
  Shield,
  Globe,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

const competitors = [
  { id: '1', name: 'Freshworks', tracked: true },
  { id: '2', name: 'Zoho', tracked: true },
  { id: '3', name: 'Razorpay', tracked: true },
  { id: '4', name: 'Zendesk', tracked: false },
  { id: '5', name: 'HubSpot', tracked: false },
];

const plans = [
  {
    id: 'essential',
    name: 'Essential',
    price: '₹4,999',
    features: ['5 competitor tracking', '50 leads/month', 'Weekly reports', 'Email alerts'],
    current: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹14,999',
    features: ['15 competitor tracking', '200 leads/month', 'Weekly + Monthly reports', 'All alerts', 'Case studies'],
    current: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '₹39,999',
    features: ['50 competitor tracking', 'Unlimited leads', 'All reports', 'Priority support', 'Custom research'],
    current: false,
  },
];

export default function Settings() {
  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences and subscription">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Update your organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" defaultValue="Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="saas">
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="fintech">FinTech</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="ist">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">IST (India Standard Time)</SelectItem>
                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="glow">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tracked Competitors</CardTitle>
                    <CardDescription>Manage the companies you're monitoring</CardDescription>
                  </div>
                  <Button variant="glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Competitor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {competitor.tracked ? 'Actively tracking' : 'Not tracked'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch checked={competitor.tracked} />
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Alert Preferences</CardTitle>
                <CardDescription>Configure how you receive intelligence alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: 'Competitor Events', description: 'Pricing changes, product launches, funding', icon: Building2 },
                  { title: 'Trend Spikes', description: 'When tracked trends increase significantly', icon: Globe },
                  { title: 'Negative Sentiment', description: 'When sentiment drops below threshold', icon: Bell },
                  { title: 'New Leads', description: 'When new high-value leads are verified', icon: Users },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <alert.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`email-${i}`} className="text-sm">Email</Label>
                        <Switch id={`email-${i}`} defaultChecked />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`dash-${i}`} className="text-sm">Dashboard</Label>
                        <Switch id={`dash-${i}`} defaultChecked />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  variant={plan.current ? 'glow' : 'elevated'}
                  className={plan.current ? 'ring-2 ring-primary' : ''}
                >
                  <CardContent className="p-6">
                    {plan.current && (
                      <Badge variant="glow" className="mb-4">Current Plan</Badge>
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2 mb-6">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current ? 'outline' : 'glow'}
                      className="w-full"
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Add-ons</CardTitle>
                <CardDescription>Enhance your subscription with additional features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Extra Lead Credits', price: '₹2,999/100 leads', description: 'Get more verified leads' },
                    { name: 'Custom Research', price: '₹9,999/request', description: 'One-off research requests' },
                    { name: 'Additional Competitors', price: '₹999/company', description: 'Track more companies' },
                    { name: 'API Access', price: '₹4,999/month', description: 'Programmatic data access' },
                  ].map((addon, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <h4 className="font-semibold">{addon.name}</h4>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{addon.price}</p>
                        <Button variant="ghost" size="sm">Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage access for your team</CardDescription>
                  </div>
                  <Button variant="glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'John Doe', email: 'john@acme.com', role: 'Admin', avatar: 'JD' },
                    { name: 'Jane Smith', email: 'jane@acme.com', role: 'Member', avatar: 'JS' },
                    { name: 'Mike Wilson', email: 'mike@acme.com', role: 'Member', avatar: 'MW' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-medium">{member.avatar}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={member.role === 'Admin' ? 'glow' : 'secondary'}>{member.role}</Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
