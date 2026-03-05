'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRuntimeStore } from '@/stores/runtime-store';
import { clearRequestLogs } from '@/lib/gen/handlers';

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500',
  POST: 'bg-green-500',
  PATCH: 'bg-yellow-500',
  DELETE: 'bg-red-500',
};

const statusColors = (status: number) => {
  if (status >= 200 && status < 300) return 'text-green-500';
  if (status >= 400 && status < 500) return 'text-yellow-500';
  if (status >= 500) return 'text-red-500';
  return 'text-muted-foreground';
};

export function RequestLogs() {
  const t = useTranslations('runtime');
  const { logs, clearLogs } = useRuntimeStore();

  const handleClear = () => {
    clearLogs();
    clearRequestLogs();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">{t('logs')}</h3>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t('noLogs')}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 text-sm"
              >
                <Badge className={`${methodColors[log.method]} text-white text-xs`}>
                  {log.method}
                </Badge>
                <span className="font-mono truncate flex-1">{log.path}</span>
                <span className={statusColors(log.status)}>{log.status}</span>
                <span className="text-muted-foreground text-xs">
                  {log.duration.toFixed(0)}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
