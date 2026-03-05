'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileJson, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';
import { generateOpenAPISpec } from '@/lib/export/openapi';
import { generatePostmanCollection } from '@/lib/export/postman';
import { generateInsomniaExport } from '@/lib/export/insomnia';
import { downloadJson, downloadYaml, jsonToYaml } from '@/lib/utils/download';

export function ExportDialog() {
  const t = useTranslations('exports');
  const { project } = useProjectStore();
  const [format, setFormat] = useState<'json' | 'yaml'>('json');

  const handleExportOpenAPI = () => {
    const spec = generateOpenAPISpec(
      project.resources,
      project.settings.baseUrl,
      project.settings.pagination,
      project.name
    );

    if (format === 'json') {
      downloadJson(spec, `${project.name}-openapi.json`);
    } else {
      downloadYaml(jsonToYaml(spec), `${project.name}-openapi.yaml`);
    }
  };

  const handleExportPostman = () => {
    const collection = generatePostmanCollection(
      project.resources,
      project.settings.baseUrl,
      project.settings.pagination,
      project.name
    );
    downloadJson(collection, `${project.name}-postman.json`);
  };

  const handleExportInsomnia = () => {
    const exportData = generateInsomniaExport(
      project.resources,
      project.settings.baseUrl,
      project.settings.pagination,
      project.name
    );
    downloadJson(exportData, `${project.name}-insomnia.json`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={project.resources.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {t('download')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            Export your API definition for use in other tools
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={handleExportOpenAPI}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    <CardTitle className="text-base">{t('openapi')}</CardTitle>
                  </div>
                  <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'yaml')}>
                    <SelectTrigger className="w-24" onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription className="text-xs">
                  OpenAPI 3.0 specification for API documentation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50" onClick={handleExportPostman}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-base">{t('postman')}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Postman Collection v2.1 for API testing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50" onClick={handleExportInsomnia}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base">{t('insomnia')}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Insomnia Export v4 for API testing
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
