import { Resource, Endpoint } from '@/types/project';

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  pattern: RegExp;
  resourceName: string;
  collectionName: string;
  type: 'list' | 'detail' | 'create' | 'update' | 'delete';
}

export function generateRoutes(resources: Resource[], baseUrl: string): RouteDefinition[] {
  const routes: RouteDefinition[] = [];

  for (const resource of resources) {
    const collectionName = resource.pluralName.toLowerCase();

    for (const endpoint of resource.endpoints) {
      const fullPath = `${baseUrl}${endpoint.path}`;
      const pattern = pathToRegex(fullPath);

      routes.push({
        method: endpoint.method,
        path: fullPath,
        pattern,
        resourceName: resource.name,
        collectionName,
        type: endpoint.type,
      });
    }
  }

  return routes;
}

function pathToRegex(path: string): RegExp {
  const escaped = path
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:id/g, '([^/]+)');

  return new RegExp(`^${escaped}$`);
}

export function matchRoute(
  method: string,
  url: string,
  routes: RouteDefinition[]
): { route: RouteDefinition; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method.toUpperCase()) continue;

    const match = url.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};

      if (match[1]) {
        params.id = match[1];
      }

      return { route, params };
    }
  }

  return null;
}

export function getEndpointsForResource(resource: Resource): Endpoint[] {
  return resource.endpoints;
}

export function formatEndpointPath(path: string, baseUrl: string): string {
  return `${baseUrl}${path}`;
}

export function parseUrlParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}
