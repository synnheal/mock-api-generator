'use client';

import { useTranslations } from 'next-intl';
import { Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMswRuntime } from '@/hooks/useMswRuntime';

export function MswToggle() {
  const t = useTranslations('runtime');
  const { isEnabled, isInitializing, startMocking, stopMocking } = useMswRuntime();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isEnabled ? 'default' : 'secondary'} className="gap-1">
        <Radio className={`h-3 w-3 ${isEnabled ? 'text-green-500' : ''}`} />
        {isEnabled ? t('enabled') : t('disabled')}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={isEnabled ? stopMocking : startMocking}
        disabled={isInitializing}
      >
        {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEnabled ? t('disable') : t('enable')}
      </Button>
    </div>
  );
}
