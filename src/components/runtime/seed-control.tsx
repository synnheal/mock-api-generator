'use client';

import { useTranslations } from 'next-intl';
import { Shuffle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRuntimeStore } from '@/stores/runtime-store';
import { useMswRuntime } from '@/hooks/useMswRuntime';

export function SeedControl() {
  const t = useTranslations('runtime');
  const { seed, setSeed, randomizeSeed } = useRuntimeStore();
  const { regenerate, isEnabled } = useMswRuntime();

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setSeed(value);
    }
  };

  const handleRandomize = () => {
    randomizeSeed();
    if (isEnabled) {
      regenerate();
    }
  };

  const handleRegenerate = () => {
    regenerate();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="seed">{t('seed')}</Label>
        <div className="flex gap-2">
          <Input
            id="seed"
            type="number"
            value={seed}
            onChange={handleSeedChange}
            className="font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRandomize}
            title={t('randomize')}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleRegenerate}
        disabled={!isEnabled}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {t('regenerate')}
      </Button>
    </div>
  );
}
