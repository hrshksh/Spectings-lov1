import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  mobileMenuTrigger?: ReactNode;
}

export function Header({ title, subtitle, mobileMenuTrigger }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();

  const orgName = organization?.name || 'My Organization';
  const emailDomain = user?.email?.split('@')[1] || '';
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-2">
        {mobileMenuTrigger}
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-tight">{orgName}</h1>
          {emailDomain && <p className="text-[11px] text-muted-foreground leading-tight">{emailDomain}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[11px] font-medium">{initials}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="py-1.5">
              <div className="flex flex-col">
                <span className="text-sm">{displayName}</span>
                <span className="text-[11px] text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs py-1.5">
              <User className="mr-2 h-3.5 w-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs py-1.5" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs py-1.5">
              <HelpCircle className="mr-2 h-3.5 w-3.5" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive text-xs py-1.5" onClick={handleSignOut}>
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
