import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { Resource, Endpoint } from '@/types/project';
import { inferIdField, inferIdType } from './infer';

function pluralize(name: string): string {
  if (name.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(v => name.endsWith(v))) {
    return name.slice(0, -1) + 'ies';
  }
  if (name.endsWith('s') || name.endsWith('x') || name.endsWith('z') ||
      name.endsWith('ch') || name.endsWith('sh')) {
    return name + 'es';
  }
  return name + 's';
}

function generateEndpoints(resourceName: string, pluralName: string): Endpoint[] {
  const basePath = `/${pluralName.toLowerCase()}`;

  return [
    {
      method: 'GET',
      path: basePath,
      description: `List all ${pluralName.toLowerCase()}`,
      type: 'list',
    },
    {
      method: 'GET',
      path: `${basePath}/:id`,
      description: `Get a single ${resourceName.toLowerCase()}`,
      type: 'detail',
    },
    {
      method: 'POST',
      path: basePath,
      description: `Create a new ${resourceName.toLowerCase()}`,
      type: 'create',
    },
    {
      method: 'PATCH',
      path: `${basePath}/:id`,
      description: `Update a ${resourceName.toLowerCase()}`,
      type: 'update',
    },
    {
      method: 'DELETE',
      path: `${basePath}/:id`,
      description: `Delete a ${resourceName.toLowerCase()}`,
      type: 'delete',
    },
  ];
}

function isObjectSchema(schema: JSONSchema7Definition): schema is JSONSchema7 {
  return typeof schema === 'object' && schema.type === 'object';
}

export function parseSchemaToResources(schema: JSONSchema7, defaultCount: number = 50): Resource[] {
  const resources: Resource[] = [];

  const definitions = schema.$defs || schema.definitions || {};

  for (const [name, definition] of Object.entries(definitions)) {
    if (!isObjectSchema(definition)) continue;

    const pluralName = pluralize(name);
    const idField = inferIdField(definition);
    const idType = inferIdType(definition, idField);

    resources.push({
      name,
      pluralName,
      schema: definition,
      idField,
      idType,
      endpoints: generateEndpoints(name, pluralName),
      count: defaultCount,
    });
  }

  if (resources.length === 0 && isObjectSchema(schema)) {
    const name = 'Item';
    const pluralName = 'Items';
    const idField = inferIdField(schema);
    const idType = inferIdType(schema, idField);

    resources.push({
      name,
      pluralName,
      schema,
      idField,
      idType,
      endpoints: generateEndpoints(name, pluralName),
      count: defaultCount,
    });
  }

  return resources;
}

export function getResourceNames(schema: JSONSchema7): string[] {
  const definitions = schema.$defs || schema.definitions || {};
  return Object.keys(definitions);
}
