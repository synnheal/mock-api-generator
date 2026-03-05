import { http, HttpResponse, delay } from 'msw';
import { Resource } from '@/types/project';
import { PaginationSettings } from '@/types/project';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
} from './db';
import { parseFilters, applyFilters, applyFullTextSearch } from '@/lib/query/filter';
import { parseSort, applySort } from '@/lib/query/sort';
import { parsePagination, applyPagination } from '@/lib/query/paginate';
import { validatePayload, validatePartialPayload } from '@/lib/schema/validate';
import { getStringFields } from '@/lib/schema/infer';

export type RequestLog = {
  id: string;
  method: string;
  path: string;
  status: number;
  timestamp: number;
  duration: number;
  params?: Record<string, string>;
  body?: unknown;
  response?: unknown;
};

let requestLogs: RequestLog[] = [];
let logListeners: ((logs: RequestLog[]) => void)[] = [];

export function getRequestLogs(): RequestLog[] {
  return [...requestLogs];
}

export function clearRequestLogs(): void {
  requestLogs = [];
  notifyLogListeners();
}

export function subscribeToLogs(listener: (logs: RequestLog[]) => void): () => void {
  logListeners.push(listener);
  return () => {
    logListeners = logListeners.filter(l => l !== listener);
  };
}

function notifyLogListeners(): void {
  logListeners.forEach(listener => listener([...requestLogs]));
}

function logRequest(log: RequestLog): void {
  requestLogs = [log, ...requestLogs].slice(0, 100);
  notifyLogListeners();
}

export function generateHandlers(
  resources: Resource[],
  baseUrl: string,
  paginationSettings: PaginationSettings
) {
  const handlers = [];

  for (const resource of resources) {
    const collectionName = resource.pluralName.toLowerCase();
    const basePath = `${baseUrl}/${collectionName}`;
    const stringFields = getStringFields(resource.schema);

    handlers.push(
      http.get(basePath, async ({ request }) => {
        const startTime = performance.now();
        const url = new URL(request.url);
        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        await delay(50 + Math.random() * 100);

        let records = getAllRecords(collectionName);

        const filters = parseFilters(params);
        records = applyFilters(records, filters);

        if (params.q) {
          records = applyFullTextSearch(records, params.q, stringFields);
        }

        const sortConfigs = parseSort(params.sort);
        records = applySort(records, sortConfigs);

        const paginationConfig = parsePagination(params, {
          pageSize: paginationSettings.defaultPageSize,
          maxPageSize: paginationSettings.maxPageSize,
          style: paginationSettings.style,
        });

        const result = applyPagination(records, paginationConfig);
        const duration = performance.now() - startTime;

        logRequest({
          id: crypto.randomUUID(),
          method: 'GET',
          path: url.pathname,
          status: 200,
          timestamp: Date.now(),
          duration,
          params,
          response: result,
        });

        return HttpResponse.json(result);
      })
    );

    handlers.push(
      http.get(`${basePath}/:id`, async ({ params }) => {
        const startTime = performance.now();
        const { id } = params as { id: string };

        await delay(30 + Math.random() * 50);

        const record = getRecordById(collectionName, id);
        const duration = performance.now() - startTime;

        if (!record) {
          logRequest({
            id: crypto.randomUUID(),
            method: 'GET',
            path: `${basePath}/${id}`,
            status: 404,
            timestamp: Date.now(),
            duration,
            response: { error: 'Not found', message: `${resource.name} not found` },
          });

          return HttpResponse.json(
            { error: 'Not found', message: `${resource.name} not found` },
            { status: 404 }
          );
        }

        logRequest({
          id: crypto.randomUUID(),
          method: 'GET',
          path: `${basePath}/${id}`,
          status: 200,
          timestamp: Date.now(),
          duration,
          response: { data: record },
        });

        return HttpResponse.json({ data: record });
      })
    );

    handlers.push(
      http.post(basePath, async ({ request }) => {
        const startTime = performance.now();
        const body = await request.json();

        await delay(50 + Math.random() * 100);

        const validation = validatePayload(body, resource.schema);

        if (!validation.valid) {
          const duration = performance.now() - startTime;

          logRequest({
            id: crypto.randomUUID(),
            method: 'POST',
            path: basePath,
            status: 400,
            timestamp: Date.now(),
            duration,
            body,
            response: { error: 'Validation failed', errors: validation.errors },
          });

          return HttpResponse.json(
            { error: 'Validation failed', errors: validation.errors },
            { status: 400 }
          );
        }

        const newRecord = createRecord(collectionName, body as Record<string, unknown>, resource);
        const duration = performance.now() - startTime;

        if (!newRecord) {
          logRequest({
            id: crypto.randomUUID(),
            method: 'POST',
            path: basePath,
            status: 500,
            timestamp: Date.now(),
            duration,
            body,
            response: { error: 'Failed to create record' },
          });

          return HttpResponse.json(
            { error: 'Failed to create record' },
            { status: 500 }
          );
        }

        logRequest({
          id: crypto.randomUUID(),
          method: 'POST',
          path: basePath,
          status: 201,
          timestamp: Date.now(),
          duration,
          body,
          response: { data: newRecord },
        });

        return HttpResponse.json({ data: newRecord }, { status: 201 });
      })
    );

    handlers.push(
      http.patch(`${basePath}/:id`, async ({ params, request }) => {
        const startTime = performance.now();
        const { id } = params as { id: string };
        const body = await request.json();

        await delay(50 + Math.random() * 100);

        const validation = validatePartialPayload(body, resource.schema);

        if (!validation.valid) {
          const duration = performance.now() - startTime;

          logRequest({
            id: crypto.randomUUID(),
            method: 'PATCH',
            path: `${basePath}/${id}`,
            status: 400,
            timestamp: Date.now(),
            duration,
            body,
            response: { error: 'Validation failed', errors: validation.errors },
          });

          return HttpResponse.json(
            { error: 'Validation failed', errors: validation.errors },
            { status: 400 }
          );
        }

        const updatedRecord = updateRecord(collectionName, id, body as Record<string, unknown>);
        const duration = performance.now() - startTime;

        if (!updatedRecord) {
          logRequest({
            id: crypto.randomUUID(),
            method: 'PATCH',
            path: `${basePath}/${id}`,
            status: 404,
            timestamp: Date.now(),
            duration,
            body,
            response: { error: 'Not found', message: `${resource.name} not found` },
          });

          return HttpResponse.json(
            { error: 'Not found', message: `${resource.name} not found` },
            { status: 404 }
          );
        }

        logRequest({
          id: crypto.randomUUID(),
          method: 'PATCH',
          path: `${basePath}/${id}`,
          status: 200,
          timestamp: Date.now(),
          duration,
          body,
          response: { data: updatedRecord },
        });

        return HttpResponse.json({ data: updatedRecord });
      })
    );

    handlers.push(
      http.delete(`${basePath}/:id`, async ({ params }) => {
        const startTime = performance.now();
        const { id } = params as { id: string };

        await delay(30 + Math.random() * 50);

        const deleted = deleteRecord(collectionName, id);
        const duration = performance.now() - startTime;

        if (!deleted) {
          logRequest({
            id: crypto.randomUUID(),
            method: 'DELETE',
            path: `${basePath}/${id}`,
            status: 404,
            timestamp: Date.now(),
            duration,
            response: { error: 'Not found', message: `${resource.name} not found` },
          });

          return HttpResponse.json(
            { error: 'Not found', message: `${resource.name} not found` },
            { status: 404 }
          );
        }

        logRequest({
          id: crypto.randomUUID(),
          method: 'DELETE',
          path: `${basePath}/${id}`,
          status: 204,
          timestamp: Date.now(),
          duration,
        });

        return new HttpResponse(null, { status: 204 });
      })
    );
  }

  return handlers;
}
