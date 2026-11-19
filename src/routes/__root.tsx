import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { themeStore } from '@/lib/themeStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme(themeStore.getTheme());
    const unsub = themeStore.subscribe(applyTheme);
    return unsub;
  }, []);

  return <Outlet />;
}
