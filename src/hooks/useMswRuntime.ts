'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useRuntimeStore } from '@/stores/runtime-store';
import { initializeDatabase, regenerateDatabase } from '@/lib/gen/db';
import { generateHandlers, subscribeToLogs, clearRequestLogs } from '@/lib/gen/handlers';
import { setSeed } from '@/lib/gen/faker-seed';

let worker: import('msw/browser').SetupWorker | null = null;

export function useMswRuntime() {
  const { project } = useProjectStore();
  const {
    isEnabled,
    isInitializing,
    seed,
    setEnabled,
    setInitializing,
    setLogs,
    setError,
  } = useRuntimeStore();

  const handlersRef = useRef<ReturnType<typeof generateHandlers>>([]);

  const startMocking = useCallback(async () => {
    if (!project.resources.length) {
      setError('No resources defined. Add a valid schema first.');
      return;
    }

    setInitializing(true);
    setError(null);

    try {
      setSeed(seed);
      initializeDatabase(project.resources, seed);

      handlersRef.current = generateHandlers(
        project.resources,
        project.settings.baseUrl,
        project.settings.pagination
      );

      if (typeof window !== 'undefined') {
        const { setupWorker } = await import('msw/browser');

        if (worker) {
          worker.stop();
        }

        worker = setupWorker(...handlersRef.current);

        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        });

        const unsubscribe = subscribeToLogs((logs) => {
          setLogs(logs);
        });

        setEnabled(true);

        return () => {
          unsubscribe();
        };
      }
    } catch (error) {
      console.error('Failed to start MSW:', error);
      setError(error instanceof Error ? error.message : 'Failed to start mocking');
    } finally {
      setInitializing(false);
    }
  }, [project, seed, setEnabled, setInitializing, setLogs, setError]);

  const stopMocking = useCallback(() => {
    if (worker) {
      worker.stop();
      worker = null;
    }
    setEnabled(false);
    clearRequestLogs();
  }, [setEnabled]);

  const regenerate = useCallback(() => {
    if (!project.resources.length) return;

    setSeed(seed);
    regenerateDatabase(project.resources, seed);

    if (worker && isEnabled) {
      handlersRef.current = generateHandlers(
        project.resources,
        project.settings.baseUrl,
        project.settings.pagination
      );

      worker.resetHandlers(...handlersRef.current);
    }
  }, [project, seed, isEnabled]);

  useEffect(() => {
    return () => {
      if (worker) {
        worker.stop();
        worker = null;
      }
    };
  }, []);

  return {
    isEnabled,
    isInitializing,
    startMocking,
    stopMocking,
    regenerate,
  };
}
