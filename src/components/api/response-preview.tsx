'use client';

import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
}

interface ResponsePreviewProps {
  response: ResponseData | null;
  error: string | null;
}

const statusColors = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-500';
  if (status >= 400 && status < 500) return 'bg-yellow-500';
  if (status >= 500) return 'bg-red-500';
  return 'bg-gray-500';
};

export function ResponsePreview({ response, error }: ResponsePreviewProps) {
  const t = useTranslations('playground');
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  if (!response && !error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t('response')}
      </div>
    );
  }

  const handleCopy = () => {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3 space-y-3">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md text-red-600">
          {error}
        </div>
      )}

      {response && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors(response.status)} text-white`}>
                {response.status} {response.statusText}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {response.duration.toFixed(0)}ms
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Collapsible open={showHeaders} onOpenChange={setShowHeaders}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                {t('headers')} ({Object.keys(response.headers).length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-2 bg-muted rounded-md font-mono text-xs">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-blue-500">{key}</span>: {value}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {response.data && (
            <pre className="p-3 bg-muted rounded-md font-mono text-sm overflow-auto max-h-[400px]">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
