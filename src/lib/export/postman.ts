import { Resource, PaginationSettings } from '@/types/project';
import { PostmanCollection, PostmanItem } from '@/types/export';
import { v4 as uuidv4 } from 'uuid';

export function generatePostmanCollection(
  resources: Resource[],
  baseUrl: string,
  pagination: PaginationSettings,
  name: string = 'Mock API'
): PostmanCollection {
  const items: PostmanItem[] = [];

  for (const resource of resources) {
    const collectionPath = `{{baseUrl}}/${resource.pluralName.toLowerCase()}`;

    items.push(createListRequest(resource, collectionPath, pagination));
    items.push(createGetRequest(resource, collectionPath));
    items.push(createCreateRequest(resource, collectionPath));
    items.push(createUpdateRequest(resource, collectionPath));
    items.push(createDeleteRequest(resource, collectionPath));
  }

  return {
    info: {
      _postman_id: uuidv4(),
      name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: 'Auto-generated Mock API collection',
    },
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
        type: 'string',
      },
    ],
    item: items,
  };
}

function createListRequest(
  resource: Resource,
  basePath: string,
  pagination: PaginationSettings
): PostmanItem {
  return {
    name: `List ${resource.pluralName}`,
    request: {
      method: 'GET',
      header: [
        { key: 'Accept', value: 'application/json' },
      ],
      url: {
        raw: `${basePath}?page=1&pageSize=${pagination.defaultPageSize}`,
        host: ['{{baseUrl}}'],
        path: [resource.pluralName.toLowerCase()],
        query: [
          { key: 'page', value: '1' },
          { key: 'pageSize', value: String(pagination.defaultPageSize) },
          { key: 'sort', value: '', disabled: true },
          { key: 'q', value: '', disabled: true },
        ],
      },
    },
    response: [],
  };
}

function createGetRequest(resource: Resource, basePath: string): PostmanItem {
  return {
    name: `Get ${resource.name}`,
    request: {
      method: 'GET',
      header: [
        { key: 'Accept', value: 'application/json' },
      ],
      url: {
        raw: `${basePath}/{{${resource.name.toLowerCase()}Id}}`,
        host: ['{{baseUrl}}'],
        path: [resource.pluralName.toLowerCase(), `{{${resource.name.toLowerCase()}Id}}`],
      },
    },
    response: [],
  };
}

function createCreateRequest(resource: Resource, basePath: string): PostmanItem {
  const exampleBody = generateExampleBody(resource);

  return {
    name: `Create ${resource.name}`,
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Accept', value: 'application/json' },
      ],
      url: {
        raw: basePath,
        host: ['{{baseUrl}}'],
        path: [resource.pluralName.toLowerCase()],
      },
      body: {
        mode: 'raw',
        raw: JSON.stringify(exampleBody, null, 2),
        options: { raw: { language: 'json' } },
      },
    },
    response: [],
  };
}

function createUpdateRequest(resource: Resource, basePath: string): PostmanItem {
  const exampleBody = generateExampleBody(resource);

  return {
    name: `Update ${resource.name}`,
    request: {
      method: 'PATCH',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Accept', value: 'application/json' },
      ],
      url: {
        raw: `${basePath}/{{${resource.name.toLowerCase()}Id}}`,
        host: ['{{baseUrl}}'],
        path: [resource.pluralName.toLowerCase(), `{{${resource.name.toLowerCase()}Id}}`],
      },
      body: {
        mode: 'raw',
        raw: JSON.stringify(exampleBody, null, 2),
        options: { raw: { language: 'json' } },
      },
    },
    response: [],
  };
}

function createDeleteRequest(resource: Resource, basePath: string): PostmanItem {
  return {
    name: `Delete ${resource.name}`,
    request: {
      method: 'DELETE',
      header: [],
      url: {
        raw: `${basePath}/{{${resource.name.toLowerCase()}Id}}`,
        host: ['{{baseUrl}}'],
        path: [resource.pluralName.toLowerCase(), `{{${resource.name.toLowerCase()}Id}}`],
      },
    },
    response: [],
  };
}

function generateExampleBody(resource: Resource): Record<string, unknown> {
  const example: Record<string, unknown> = {};
  const properties = resource.schema.properties || {};

  for (const [key, prop] of Object.entries(properties)) {
    if (key === resource.idField) continue;
    if (key === 'createdAt' || key === 'updatedAt') continue;

    if (typeof prop === 'object' && prop !== null) {
      example[key] = getExampleValue(prop as Record<string, unknown>);
    }
  }

  return example;
}

function getExampleValue(prop: Record<string, unknown>): unknown {
  if (prop.example !== undefined) return prop.example;
  if (prop.default !== undefined) return prop.default;

  const type = prop.type as string;
  const format = prop.format as string;

  switch (type) {
    case 'string':
      if (format === 'email') return 'user@example.com';
      if (format === 'uri' || format === 'url') return 'https://example.com';
      if (format === 'date-time') return new Date().toISOString();
      if (format === 'date') return new Date().toISOString().split('T')[0];
      if (format === 'uuid') return '00000000-0000-0000-0000-000000000000';
      return 'string';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}
