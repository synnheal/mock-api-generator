'use client';

import { useTranslations } from 'next-intl';
import { Code2, Github } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { MswToggle } from '@/components/runtime/msw-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const t = useTranslations('app');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          <span className="font-bold">{t('title')}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <MswToggle />
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
