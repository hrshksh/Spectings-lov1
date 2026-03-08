import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function DynamicFavicon() {
  const { resolvedTheme } = useTheme();

  const { data: siteLogo } = useQuery({
    queryKey: ['site-logo'],
    queryFn: async () => {
      const { data } = await supabase.from('site_logos').select('*').limit(1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const url = resolvedTheme === 'dark' ? siteLogo?.dark_logo_url : siteLogo?.light_logo_url;
    if (!url) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [resolvedTheme, siteLogo]);

  return null;
}
