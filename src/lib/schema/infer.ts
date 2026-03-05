import { JSONSchema7 } from 'json-schema';

export function inferIdField(schema: JSONSchema7): string {
  const properties = schema.properties || {};

  if ('id' in properties) return 'id';
  if ('_id' in properties) return '_id';
  if ('uuid' in properties) return 'uuid';

  for (const [key, prop] of Object.entries(properties)) {
    if (typeof prop === 'object' && prop.format === 'uuid') {
      return key;
    }
  }

  return 'id';
}

export function inferIdType(schema: JSONSchema7, idField: string): 'uuid' | 'integer' {
  const properties = schema.properties || {};
  const idProp = properties[idField];

  if (typeof idProp === 'object') {
    if (idProp.format === 'uuid') return 'uuid';
    if (idProp.type === 'integer' || idProp.type === 'number') return 'integer';
  }

  return 'uuid';
}

export function inferDefaults(schema: JSONSchema7): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  const properties = schema.properties || {};

  for (const [key, prop] of Object.entries(properties)) {
    if (typeof prop === 'object' && 'default' in prop) {
      defaults[key] = prop.default;
    }
  }

  return defaults;
}

export function getRequiredFields(schema: JSONSchema7): string[] {
  return schema.required || [];
}

export function getStringFields(schema: JSONSchema7): string[] {
  const fields: string[] = [];
  const properties = schema.properties || {};

  for (const [key, prop] of Object.entries(properties)) {
    if (typeof prop === 'object' && prop.type === 'string') {
      fields.push(key);
    }
  }

  return fields;
}
