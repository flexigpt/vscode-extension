import React from 'react';

import { Button } from '@nextui-org/button';

import { IconMoon, IconSun } from '@/reactui/components/ui/icons';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  // eslint-disable-next-line no-unused-vars
  const [_, startTransition] = React.useTransition();

  return (
    <Button
      variant="light"
      size="sm"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
        });
      }}
    >
      {!theme ? null : theme === 'dark' ? (
        <IconMoon className="transition-all" />
      ) : (
        <IconSun className="transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
