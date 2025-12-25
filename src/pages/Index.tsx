import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, TrendingUp, FileText, Zap, Shield, ArrowRight, Check } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AB</span>
            </div>
            <span className="font-semibold text-lg">AlllBrackets</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case Studies</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild><Link to="/dashboard">Login</Link></Button>
            <Button variant="glow" asChild><Link to="/dashboard">Start Free Trial</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="glow" className="mb-6">Business Intelligence Hub</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Know Your Market<br />
            <span className="gradient-text">Before It Moves</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track competitors, discover leads, analyze trends, and get actionable intelligence delivered weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="glow" size="xl" asChild>
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl">Book a Demo</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Intelligence Stack</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to stay ahead of your market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'People Intelligence', desc: 'Verified leads, enriched profiles, role movements', color: 'primary' },
              { icon: Building2, title: 'Company Intelligence', desc: 'Competitor tracking, events timeline, pricing changes', color: 'accent' },
              { icon: TrendingUp, title: 'Market Analytics', desc: 'Sentiment analysis, trend reports, opportunity signals', color: 'success' },
            ].map((f) => (
              <Card key={f.title} variant="interactive" className="text-center">
                <CardContent className="p-8">
                  <div className={`h-16 w-16 rounded-2xl bg-${f.color}/10 flex items-center justify-center mx-auto mb-6`}>
                    <f.icon className={`h-8 w-8 text-${f.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Essential', price: '₹4,999', features: ['5 competitors', '50 leads/mo', 'Weekly reports'] },
              { name: 'Growth', price: '₹14,999', popular: true, features: ['15 competitors', '200 leads/mo', 'All reports', 'Case studies'] },
              { name: 'Agency', price: '₹39,999', features: ['50 competitors', 'Unlimited leads', 'Custom research', 'API access'] },
            ].map((plan) => (
              <Card key={plan.name} variant={plan.popular ? 'glow' : 'elevated'}>
                <CardContent className="p-8">
                  {plan.popular && <Badge variant="glow" className="mb-4">Most Popular</Badge>}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="my-4"><span className="text-4xl font-bold">{plan.price}</span><span className="text-muted-foreground">/mo</span></div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>)}
                  </ul>
                  <Button variant={plan.popular ? 'glow' : 'outline'} className="w-full">Get Started</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AB</span>
            </div>
            <span className="font-semibold">AlllBrackets</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 AlllBrackets. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
