import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, ArrowLeft, ArrowRight, User, Building2, Mail, RotateCw } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid work email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
  'Manufacturing', 'Real Estate', 'Consulting', 'Marketing & Advertising',
  'Media & Entertainment', 'Logistics & Supply Chain', 'Energy',
  'Telecommunications', 'Legal', 'Non-profit', 'Other',
];

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+',
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'United Arab Emirates', 'Netherlands',
  'Sweden', 'Japan', 'South Korea', 'Brazil', 'Mexico',
  'Saudi Arabia', 'South Africa', 'Nigeria', 'Kenya', 'Other',
];

const COUNTRY_CODES = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+49', label: 'DE (+49)' },
  { code: '+33', label: 'FR (+33)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+31', label: 'NL (+31)' },
  { code: '+46', label: 'SE (+46)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+82', label: 'KR (+82)' },
  { code: '+55', label: 'BR (+55)' },
  { code: '+52', label: 'MX (+52)' },
  { code: '+966', label: 'SA (+966)' },
  { code: '+27', label: 'ZA (+27)' },
  { code: '+234', label: 'NG (+234)' },
  { code: '+254', label: 'KE (+254)' },
];

const RESERVED_SLUGS = ['admin', 'auth', 'api', 'dashboard', 'login', 'signup', 'reset-password', 'forgot-password', 'settings', 'profile', 'lists', 'people', 'inspects', 'perspects', 'prospects', 'services', 'case-studies'];

function generateSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (RESERVED_SLUGS.includes(slug)) {
    slug = `${slug}-org`;
  }
  return slug;
}

export default function Auth() {
  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signInAttempts, setSignInAttempts] = useState(0);
  const [signInLockUntil, setSignInLockUntil] = useState(0);

  // Sign-up step: 1 = user info, 2 = org info, 3 = check email
  const [signupStep, setSignupStep] = useState(1);
  const [signupEmail, setSignupEmail] = useState('');

  // Sign-up user fields
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Sign-up org fields
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [orgCountry, setOrgCountry] = useState('');

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  const orgSlug = useMemo(() => generateSlug(orgName), [orgName]);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserStep = () => {
    const newErrors: Record<string, string> = {};

    if (!signupFullName.trim()) newErrors.signupFullName = 'Full name is required';
    try { emailSchema.parse(signupEmail); } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupEmail = e.errors[0].message;
    }
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
    const domain = signupEmail.split('@')[1]?.toLowerCase();
    if (domain && freeProviders.includes(domain)) {
      newErrors.signupEmail = 'Please use a work email address';
    }
    try { passwordSchema.parse(signupPassword); } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupPassword = e.errors[0].message;
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrgStep = () => {
    const newErrors: Record<string, string> = {};

    if (!orgName.trim()) newErrors.orgName = 'Organisation name is required';
    if (!orgIndustry) newErrors.orgIndustry = 'Industry is required';
    if (!orgSize) newErrors.orgSize = 'Company size is required';
    if (!orgCountry) newErrors.orgCountry = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateUserStep()) {
      setErrors({});
      setSignupStep(2);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    // Rate limiting: lock out after 5 failed attempts for 60s
    const now = Date.now();
    if (signInLockUntil > now) {
      const secs = Math.ceil((signInLockUntil - now) / 1000);
      toast({
        title: 'Too many attempts',
        description: `Please wait ${secs} seconds before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      const attempts = signInAttempts + 1;
      setSignInAttempts(attempts);
      if (attempts >= 5) {
        setSignInLockUntil(Date.now() + 60000);
        setSignInAttempts(0);
      }
      toast({
        title: 'Sign in failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } else {
      setSignInAttempts(0);
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOrgStep()) return;

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, {
      full_name: signupFullName,
      phone: `${countryCode}${phoneNumber}`,
      org_name: orgName,
      org_slug: orgSlug,
      org_industry: orgIndustry,
      org_size: orgSize,
      org_country: orgCountry,
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: 'Unable to create account. Please check your details and try again.',
        variant: 'destructive',
      });
    } else {
      setSignupStep(3);
      setResendCooldown(60);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupEmail,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setResendCooldown(60);
      toast({ title: 'Email sent!', description: 'A new verification email has been sent.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Intelligence Platform</CardTitle>
          <CardDescription>Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full" onValueChange={() => { setSignupStep(1); setErrors({}); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup">

            {/* Step 3: Check Your Email */}
            {signupStep === 3 && (
              <div>
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We sent a verification link to<br />
                      <span className="font-medium text-foreground">{signupEmail}</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                    <p>Click the link in the email to activate your account.</p>
                    <p>If you don't see it, check your spam or junk folder.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendEmail}
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : resendCooldown > 0 ? (
                      <>Resend in {resendCooldown}s</>
                    ) : (
                      <><RotateCw className="mr-2 h-4 w-4" />Resend verification email</>
                    )}
                  </Button>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => { setSignupStep(1); setErrors({}); }}
                  >
                    Use a different email
                  </button>
                </CardFooter>
              </div>
            )}

            {/* Step indicator (only for steps 1 & 2) */}
            {signupStep < 3 && (
              <div className="flex items-center justify-center gap-3 px-6 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${signupStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${signupStep === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Your Info</span>
                </div>
                <div className="h-px w-8 bg-border" />
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${signupStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${signupStep === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Organisation</span>
                </div>
              </div>
            )}

            {/* Step 1: User Information */}
            {signupStep === 1 && (
              <div>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Information</p>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" placeholder="John Doe" value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} disabled={isLoading} />
                    {errors.signupFullName && <p className="text-sm text-destructive">{errors.signupFullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Work Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@company.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isLoading} />
                    {errors.signupEmail && <p className="text-sm text-destructive">{errors.signupEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isLoading} />
                    {errors.signupPassword && <p className="text-sm text-destructive">{errors.signupPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
                        <SelectTrigger className="w-[130px] shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((cc) => (
                            <SelectItem key={cc.code} value={cc.code}>{cc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input id="signup-phone" type="tel" placeholder="1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} disabled={isLoading} className="flex-1" />
                    </div>
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="button" className="w-full" onClick={handleNextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </div>
            )}

            {/* Step 2: Organisation Information */}
            {signupStep === 2 && (
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Organisation Information</p>

                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organisation Name</Label>
                    <Input id="org-name" placeholder="Acme Inc." value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isLoading} />
                    {orgSlug && (
                      <p className="text-xs text-muted-foreground">Slug: <span className="font-mono">{orgSlug}</span></p>
                    )}
                    {errors.orgName && <p className="text-sm text-destructive">{errors.orgName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={orgIndustry} onValueChange={setOrgIndustry} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.orgIndustry && <p className="text-sm text-destructive">{errors.orgIndustry}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select value={orgSize} onValueChange={setOrgSize} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s} employees</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.orgSize && <p className="text-sm text-destructive">{errors.orgSize}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Country / Region</Label>
                    <Select value={orgCountry} onValueChange={setOrgCountry} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.orgCountry && <p className="text-sm text-destructive">{errors.orgCountry}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setSignupStep(1); setErrors({}); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
