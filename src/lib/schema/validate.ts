import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { JSONSchema7 } from 'json-schema';
import { SchemaValidationError } from '@/types/project';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: true,
});

addFormats(ajv);

const metaSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    $schema: { type: 'string' },
    $id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    type: {
      anyOf: [
        { type: 'string', enum: ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'] },
        { type: 'array', items: { type: 'string' } }
      ]
    },
    properties: { type: 'object' },
    required: { type: 'array', items: { type: 'string' } },
    $defs: { type: 'object' },
    definitions: { type: 'object' },
  },
};

export function validateSchema(schema: unknown): { valid: boolean; errors: SchemaValidationError[] } {
  if (typeof schema !== 'object' || schema === null) {
    return {
      valid: false,
      errors: [{ path: '', message: 'Schema must be an object' }],
    };
  }

  const validate = ajv.compile(metaSchema);
  const valid = validate(schema);

  if (!valid && validate.errors) {
    return {
      valid: false,
      errors: formatErrors(validate.errors),
    };
  }

  return { valid: true, errors: [] };
}

export function validatePayload(
  payload: unknown,
  schema: JSONSchema7
): { valid: boolean; errors: SchemaValidationError[] } {
  const validate = ajv.compile(schema);
  const valid = validate(payload);

  if (!valid && validate.errors) {
    return {
      valid: false,
      errors: formatErrors(validate.errors),
    };
  }

  return { valid: true, errors: [] };
}

export function validatePartialPayload(
  payload: unknown,
  schema: JSONSchema7
): { valid: boolean; errors: SchemaValidationError[] } {
  const partialSchema: JSONSchema7 = {
    ...schema,
    required: [],
  };

  return validatePayload(payload, partialSchema);
}

function formatErrors(errors: ErrorObject[]): SchemaValidationError[] {
  return errors.map(err => ({
    path: err.instancePath || '/',
    message: err.message || 'Validation error',
  }));
}

export function parseJsonSafe(jsonString: string): { data: unknown; error: string | null } {
  try {
    const data = JSON.parse(jsonString);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Invalid JSON'
    };
  }
}
