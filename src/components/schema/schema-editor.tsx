'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectStore } from '@/stores/project-store';
import { debounce } from '@/lib/utils/debounce';

export function SchemaEditor() {
  const t = useTranslations('schema');
  const {
    schemaText,
    schemaErrors,
    isSchemaValid,
    setSchemaText,
    parseAndValidateSchema,
  } = useProjectStore();

  const debouncedValidate = useCallback(
    debounce(() => {
      parseAndValidateSchema();
    }, 500),
    [parseAndValidateSchema]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSchemaText(e.target.value);
    debouncedValidate();
  };

  const handleClear = () => {
    setSchemaText('');
    parseAndValidateSchema();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">{t('title')}</h3>
        <div className="flex items-center gap-2">
          {schemaText && (
            <>
              {isSchemaValid ? (
                <Badge variant="outline" className="gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {t('valid')}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  {t('invalid')}
                </Badge>
              )}
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3">
        <Textarea
          value={schemaText}
          onChange={handleChange}
          placeholder={t('placeholder')}
          className="h-full min-h-[300px] font-mono text-sm resize-none"
        />
      </div>

      {schemaErrors.length > 0 && (
        <div className="border-t">
          <div className="p-2 bg-red-50 dark:bg-red-950/20">
            <h4 className="text-sm font-medium text-red-600 mb-1">{t('errors')}</h4>
            <ScrollArea className="max-h-32">
              <ul className="text-sm space-y-1">
                {schemaErrors.map((error, index) => (
                  <li key={index} className="text-red-600 font-mono text-xs">
                    {error.path && <span className="text-red-400">{error.path}: </span>}
                    {error.message}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
