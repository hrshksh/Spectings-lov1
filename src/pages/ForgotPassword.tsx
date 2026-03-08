import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(''); }}>
              Try a different email
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="inline h-3 w-3 mr-1" />Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Link'}
            </Button>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="inline h-3 w-3 mr-1" />Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
