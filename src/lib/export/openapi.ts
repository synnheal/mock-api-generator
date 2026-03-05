import { Resource, PaginationSettings } from '@/types/project';
import { OpenAPISpec, PathItem, Operation, Parameter } from '@/types/export';

export function generateOpenAPISpec(
  resources: Resource[],
  baseUrl: string,
  pagination: PaginationSettings,
  title: string = 'Mock API',
  version: string = '1.0.0'
): OpenAPISpec {
  const paths: Record<string, PathItem> = {};
  const schemas: Record<string, unknown> = {};

  for (const resource of resources) {
    const collectionPath = `/${resource.pluralName.toLowerCase()}`;
    const itemPath = `${collectionPath}/{id}`;

    schemas[resource.name] = resource.schema;
    schemas[`${resource.name}List`] = {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: `#/components/schemas/${resource.name}` },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    };

    paths[collectionPath] = {
      get: createListOperation(resource, pagination),
      post: createCreateOperation(resource),
    };

    paths[itemPath] = {
      get: createGetOperation(resource),
      patch: createUpdateOperation(resource),
      delete: createDeleteOperation(resource),
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title,
      version,
      description: 'Auto-generated Mock API from JSON Schema',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Mock API Server',
      },
    ],
    paths,
    components: {
      schemas,
    },
  };
}

function createListOperation(resource: Resource, pagination: PaginationSettings): Operation {
  const parameters: Parameter[] = [
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', default: 1 },
      description: 'Page number',
    },
    {
      name: 'pageSize',
      in: 'query',
      schema: { type: 'integer', default: pagination.defaultPageSize },
      description: `Items per page (max: ${pagination.maxPageSize})`,
    },
    {
      name: 'sort',
      in: 'query',
      schema: { type: 'string' },
      description: 'Sort field (prefix with - for descending)',
    },
    {
      name: 'q',
      in: 'query',
      schema: { type: 'string' },
      description: 'Full-text search query',
    },
  ];

  return {
    summary: `List ${resource.pluralName}`,
    operationId: `list${resource.pluralName}`,
    tags: [resource.name],
    parameters,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${resource.name}List` },
          },
        },
      },
    },
  };
}

function createGetOperation(resource: Resource): Operation {
  return {
    summary: `Get ${resource.name}`,
    operationId: `get${resource.name}`,
    tags: [resource.name],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `${resource.name} ID`,
      },
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { $ref: `#/components/schemas/${resource.name}` },
              },
            },
          },
        },
      },
      '404': {
        description: 'Not found',
      },
    },
  };
}

function createCreateOperation(resource: Resource): Operation {
  return {
    summary: `Create ${resource.name}`,
    operationId: `create${resource.name}`,
    tags: [resource.name],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: `#/components/schemas/${resource.name}` },
        },
      },
    },
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { $ref: `#/components/schemas/${resource.name}` },
              },
            },
          },
        },
      },
      '400': {
        description: 'Validation error',
      },
    },
  };
}

function createUpdateOperation(resource: Resource): Operation {
  return {
    summary: `Update ${resource.name}`,
    operationId: `update${resource.name}`,
    tags: [resource.name],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `${resource.name} ID`,
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: `#/components/schemas/${resource.name}` },
        },
      },
    },
    responses: {
      '200': {
        description: 'Updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { $ref: `#/components/schemas/${resource.name}` },
              },
            },
          },
        },
      },
      '404': {
        description: 'Not found',
      },
      '400': {
        description: 'Validation error',
      },
    },
  };
}

function createDeleteOperation(resource: Resource): Operation {
  return {
    summary: `Delete ${resource.name}`,
    operationId: `delete${resource.name}`,
    tags: [resource.name],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `${resource.name} ID`,
      },
    ],
    responses: {
      '204': {
        description: 'Deleted',
      },
      '404': {
        description: 'Not found',
      },
    },
  };
}
