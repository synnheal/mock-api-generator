'use client';

import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500 hover:bg-blue-600',
  POST: 'bg-green-500 hover:bg-green-600',
  PATCH: 'bg-yellow-500 hover:bg-yellow-600',
  DELETE: 'bg-red-500 hover:bg-red-600',
};

interface EndpointTableProps {
  onTryEndpoint?: (method: string, path: string) => void;
}

export function EndpointTable({ onTryEndpoint }: EndpointTableProps) {
  const t = useTranslations('endpoints');
  const { project } = useProjectStore();
  const { selectedResourceIndex } = useUIStore();

  const selectedResource = project.resources[selectedResourceIndex];

  if (!selectedResource) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a resource to view endpoints
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold">{t('title')} - {selectedResource.name}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium">{t('method')}</th>
                <th className="text-left p-2 text-sm font-medium">{t('path')}</th>
                <th className="text-left p-2 text-sm font-medium">{t('description')}</th>
                <th className="text-right p-2 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {selectedResource.endpoints.map((endpoint, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-2">
                    <Badge className={`${methodColors[endpoint.method]} text-white`}>
                      {endpoint.method}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {project.settings.baseUrl}{endpoint.path}
                    </code>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {endpoint.description}
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTryEndpoint?.(endpoint.method, endpoint.path)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {t('tryIt')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
