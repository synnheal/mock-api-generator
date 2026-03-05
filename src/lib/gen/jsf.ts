import { generate, registerFormat } from 'json-schema-faker';
import { faker, setSeed, getSeed } from './faker-seed';
import { JSONSchema7 } from 'json-schema';
import { v4 as uuidv4 } from 'uuid';

registerFormat('uuid', () => uuidv4());
registerFormat('email', () => faker.internet.email());
registerFormat('uri', () => faker.internet.url());
registerFormat('url', () => faker.internet.url());
registerFormat('hostname', () => faker.internet.domainName());
registerFormat('ipv4', () => faker.internet.ipv4());
registerFormat('ipv6', () => faker.internet.ipv6());
registerFormat('date-time', () => faker.date.recent().toISOString());
registerFormat('date', () => faker.date.recent().toISOString().split('T')[0]);
registerFormat('time', () => faker.date.recent().toISOString().split('T')[1].split('.')[0]);
registerFormat('phone', () => faker.phone.number());

export function generateFromSchema<T = unknown>(schema: JSONSchema7): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generate(schema as any) as T;
}

export function generateMultiple<T = unknown>(schema: JSONSchema7, count: number): T[] {
  const items: T[] = [];
  const seed = getSeed();

  for (let i = 0; i < count; i++) {
    setSeed(seed + i);
    items.push(generateFromSchema<T>(schema));
  }

  setSeed(seed);
  return items;
}

export function addIdToRecord(
  record: Record<string, unknown>,
  idField: string,
  idType: 'uuid' | 'integer',
  index: number
): Record<string, unknown> {
  if (record[idField] === undefined || record[idField] === null) {
    record[idField] = idType === 'uuid' ? uuidv4() : index + 1;
  }
  return record;
}

export function addTimestamps(record: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();

  if (!('createdAt' in record)) {
    record.createdAt = faker.date.past().toISOString();
  }

  if (!('updatedAt' in record)) {
    record.updatedAt = now;
  }

  return record;
}
