'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEndpointTester } from '@/hooks/useEndpointTester';
import { useRuntimeStore } from '@/stores/runtime-store';
import { ResponsePreview } from './response-preview';

interface EndpointTesterProps {
  initialMethod?: string;
  initialPath?: string;
}

export function EndpointTester({ initialMethod = 'GET', initialPath = '' }: EndpointTesterProps) {
  const t = useTranslations('playground');
  const { isEnabled } = useRuntimeStore();
  const { isLoading, response, error, sendRequest } = useEndpointTester();

  const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>(
    initialMethod as 'GET' | 'POST' | 'PATCH' | 'DELETE'
  );
  const [path, setPath] = useState(initialPath);
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);
  const [body, setBody] = useState('');

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const handleSend = () => {
    const params: Record<string, string> = {};
    queryParams.forEach(({ key, value }) => {
      if (key) params[key] = value;
    });

    sendRequest({
      method,
      path,
      queryParams: params,
      body: body || undefined,
    });
  };

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-muted-foreground mb-4">{t('noMocking')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-3">
        <div className="flex gap-2">
          <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/users"
            className="flex-1 font-mono"
          />
          <Button onClick={handleSend} disabled={isLoading || !path}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('queryParams')}</Label>
            <Button variant="ghost" size="sm" onClick={addQueryParam}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {queryParams.map((param, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={param.key}
                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                placeholder="key"
                className="flex-1"
              />
              <Input
                value={param.value}
                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                placeholder="value"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQueryParam(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {(method === 'POST' || method === 'PATCH') && (
          <div className="space-y-2">
            <Label>{t('body')}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="{}"
              className="font-mono text-sm min-h-[100px]"
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <ResponsePreview response={response} error={error} />
      </ScrollArea>
    </div>
  );
}
