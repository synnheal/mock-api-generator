import { Resource, PaginationSettings } from '@/types/project';
import { InsomniaExport, InsomniaResource } from '@/types/export';
import { v4 as uuidv4 } from 'uuid';

export function generateInsomniaExport(
  resources: Resource[],
  baseUrl: string,
  pagination: PaginationSettings,
  name: string = 'Mock API'
): InsomniaExport {
  const workspaceId = `wrk_${uuidv4().replace(/-/g, '')}`;
  const envId = `env_${uuidv4().replace(/-/g, '')}`;

  const insomniaResources: InsomniaResource[] = [
    {
      _id: workspaceId,
      _type: 'workspace',
      parentId: null,
      name,
      description: 'Auto-generated Mock API workspace',
    },
    {
      _id: envId,
      _type: 'environment',
      parentId: workspaceId,
      name: 'Base Environment',
      data: {
        baseUrl,
      },
    },
  ];

  for (const resource of resources) {
    const folderId = `fld_${uuidv4().replace(/-/g, '')}`;
    const collectionPath = `{{ _.baseUrl }}/${resource.pluralName.toLowerCase()}`;

    insomniaResources.push({
      _id: folderId,
      _type: 'request_group',
      parentId: workspaceId,
      name: resource.pluralName,
    });

    insomniaResources.push(
      createListRequest(resource, folderId, collectionPath, pagination)
    );
    insomniaResources.push(
      createGetRequest(resource, folderId, collectionPath)
    );
    insomniaResources.push(
      createCreateRequest(resource, folderId, collectionPath)
    );
    insomniaResources.push(
      createUpdateRequest(resource, folderId, collectionPath)
    );
    insomniaResources.push(
      createDeleteRequest(resource, folderId, collectionPath)
    );
  }

  return {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'mock-api-generator',
    resources: insomniaResources,
  };
}

function createListRequest(
  resource: Resource,
  parentId: string,
  basePath: string,
  pagination: PaginationSettings
): InsomniaResource {
  return {
    _id: `req_${uuidv4().replace(/-/g, '')}`,
    _type: 'request',
    parentId,
    name: `List ${resource.pluralName}`,
    method: 'GET',
    url: basePath,
    headers: [
      { name: 'Accept', value: 'application/json' },
    ],
    parameters: [
      { name: 'page', value: '1' },
      { name: 'pageSize', value: String(pagination.defaultPageSize) },
      { name: 'sort', value: '', disabled: true },
      { name: 'q', value: '', disabled: true },
    ],
  };
}

function createGetRequest(
  resource: Resource,
  parentId: string,
  basePath: string
): InsomniaResource {
  return {
    _id: `req_${uuidv4().replace(/-/g, '')}`,
    _type: 'request',
    parentId,
    name: `Get ${resource.name}`,
    method: 'GET',
    url: `${basePath}/1`,
    headers: [
      { name: 'Accept', value: 'application/json' },
    ],
  };
}

function createCreateRequest(
  resource: Resource,
  parentId: string,
  basePath: string
): InsomniaResource {
  const exampleBody = generateExampleBody(resource);

  return {
    _id: `req_${uuidv4().replace(/-/g, '')}`,
    _type: 'request',
    parentId,
    name: `Create ${resource.name}`,
    method: 'POST',
    url: basePath,
    headers: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Accept', value: 'application/json' },
    ],
    body: {
      mimeType: 'application/json',
      text: JSON.stringify(exampleBody, null, 2),
    },
  };
}

function createUpdateRequest(
  resource: Resource,
  parentId: string,
  basePath: string
): InsomniaResource {
  const exampleBody = generateExampleBody(resource);

  return {
    _id: `req_${uuidv4().replace(/-/g, '')}`,
    _type: 'request',
    parentId,
    name: `Update ${resource.name}`,
    method: 'PATCH',
    url: `${basePath}/1`,
    headers: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Accept', value: 'application/json' },
    ],
    body: {
      mimeType: 'application/json',
      text: JSON.stringify(exampleBody, null, 2),
    },
  };
}

function createDeleteRequest(
  resource: Resource,
  parentId: string,
  basePath: string
): InsomniaResource {
  return {
    _id: `req_${uuidv4().replace(/-/g, '')}`,
    _type: 'request',
    parentId,
    name: `Delete ${resource.name}`,
    method: 'DELETE',
    url: `${basePath}/1`,
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
