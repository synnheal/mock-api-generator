'use client';

import { useState, useCallback } from 'react';
import { useProjectStore } from '@/stores/project-store';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  queryParams?: Record<string, string>;
  body?: string;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
}

export function useEndpointTester() {
  const { project } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(async (config: RequestConfig) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      let url = `${project.settings.baseUrl}${config.path}`;

      if (config.queryParams && Object.keys(config.queryParams).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(config.queryParams)) {
          if (value) {
            params.append(key, value);
          }
        }
        url += `?${params.toString()}`;
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (config.method !== 'GET' && config.method !== 'DELETE') {
        headers['Content-Type'] = 'application/json';
      }

      const fetchOptions: RequestInit = {
        method: config.method,
        headers,
      };

      if (config.body && (config.method === 'POST' || config.method === 'PATCH')) {
        fetchOptions.body = config.body;
      }

      const res = await fetch(url, fetchOptions);
      const duration = performance.now() - startTime;

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: unknown = null;
      const contentType = res.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else if (res.status !== 204) {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        duration,
      });
    } catch (err) {
      const duration = performance.now() - startTime;
      setError(err instanceof Error ? err.message : 'Request failed');
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: null,
        duration,
      });
    } finally {
      setIsLoading(false);
    }
  }, [project.settings.baseUrl]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    isLoading,
    response,
    error,
    sendRequest,
    clearResponse,
  };
}
