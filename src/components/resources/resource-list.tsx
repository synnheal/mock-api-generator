'use client';

import { useTranslations } from 'next-intl';
import { Database, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';

export function ResourceList() {
  const t = useTranslations('resources');
  const { project } = useProjectStore();
  const { selectedResourceIndex, setSelectedResourceIndex } = useUIStore();

  if (project.resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
        <Database className="h-12 w-12 mb-4 opacity-50" />
        <p>{t('noResources')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold">{t('title')}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {project.resources.map((resource, index) => (
            <Card
              key={resource.name}
              className={`cursor-pointer transition-colors ${
                selectedResourceIndex === index
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedResourceIndex(index)}
            >
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {resource.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {t('count', { count: resource.count })}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap gap-1">
                  {resource.endpoints.map((endpoint) => (
                    <Badge
                      key={`${endpoint.method}-${endpoint.path}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {endpoint.method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
