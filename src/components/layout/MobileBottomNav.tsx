import { Link, useLocation, useParams } from 'react-router-dom';
import { UsersRound, Eye, Activity, List } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserSectionAccess, hasSection } from '@/hooks/useSectionAccess';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: UsersRound, label: 'Prospects', path: '/people', section: 'prospects' },
  { icon: Eye, label: 'Inspects', path: '/inspects', section: 'inspects' },
  { icon: Activity, label: 'Perspects', path: '/perspects', section: 'perspects' },
  { icon: List, label: 'Lists', path: '/lists', section: null },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { organization } = useOrganization();
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const orgSlug = urlSlug || organization?.slug || 'default';
  const { data: sectionAccess = [] } = useUserSectionAccess();

  const filteredItems = NAV_ITEMS.filter(
    item => item.section === null || hasSection(sectionAccess, item.section)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around h-14 px-1">
        {filteredItems.map(item => {
          const fullPath = `/${orgSlug}${item.path}`;
          const isActive = location.pathname.startsWith(fullPath);
          return (
            <Link
              key={item.path}
              to={fullPath}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] leading-tight', isActive ? 'font-semibold' : 'font-medium')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-sidebar" />
    </nav>
  );
}
