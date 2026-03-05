'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaEditor } from '@/components/schema/schema-editor';
import { SchemaExamples } from '@/components/schema/schema-examples';
import { ResourceList } from '@/components/resources/resource-list';
import { EndpointTable } from '@/components/resources/endpoint-table';
import { EndpointTester } from '@/components/api/endpoint-tester';
import { RequestLogs } from '@/components/runtime/request-logs';
import { SeedControl } from '@/components/runtime/seed-control';
import { ExportDialog } from '@/components/exports/export-dialog';
import { useUIStore } from '@/stores/ui-store';

export function Workspace() {
  const t = useTranslations();
  const { activeTab, setActiveTab } = useUIStore();
  const [testerConfig, setTesterConfig] = useState({ method: 'GET', path: '' });

  const handleTryEndpoint = (method: string, path: string) => {
    setTesterConfig({ method, path });
    setActiveTab('playground');
  };

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Left Panel - Schema & Resources */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="border-b px-2">
              <TabsList className="h-10">
                <TabsTrigger value="schema" className="text-xs">
                  {t('nav.schema')}
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-xs">
                  {t('nav.resources')}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="schema" className="h-[calc(100%-2.5rem)] m-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <SchemaEditor />
                </div>
                <div className="border-t">
                  <SchemaExamples />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="resources" className="h-[calc(100%-2.5rem)] m-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <ResourceList />
                </div>
                <div className="border-t p-3">
                  <SeedControl />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Endpoints */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h2 className="font-semibold">{t('endpoints.title')}</h2>
              <ExportDialog />
            </div>
            <div className="flex-1 overflow-hidden">
              <EndpointTable onTryEndpoint={handleTryEndpoint} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Tester & Logs */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <Tabs defaultValue="playground">
            <div className="border-b px-2">
              <TabsList className="h-10">
                <TabsTrigger value="playground" className="text-xs">
                  {t('nav.playground')}
                </TabsTrigger>
                <TabsTrigger value="logs" className="text-xs">
                  {t('runtime.logs')}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="playground" className="h-[calc(100%-2.5rem)] m-0">
              <EndpointTester
                initialMethod={testerConfig.method}
                initialPath={testerConfig.path}
              />
            </TabsContent>
            <TabsContent value="logs" className="h-[calc(100%-2.5rem)] m-0">
              <RequestLogs />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
