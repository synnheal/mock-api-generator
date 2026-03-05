import { Database, Collection, Record as DbRecord } from '@/types/db';
import { Resource } from '@/types/project';
import { generateFromSchema, addIdToRecord, addTimestamps } from './jsf';
import { setSeed, getSeed, resetRng } from './faker-seed';

let database: Database = {
  collections: new Map(),
  seed: Date.now(),
};

export function getDatabase(): Database {
  return database;
}

export function initializeDatabase(resources: Resource[], seed: number): Database {
  setSeed(seed);
  resetRng();

  database = {
    collections: new Map(),
    seed,
  };

  for (const resource of resources) {
    const collection = createCollection(resource);
    database.collections.set(resource.pluralName.toLowerCase(), collection);
  }

  return database;
}

export function createCollection(resource: Resource): Collection {
  const records: DbRecord[] = [];
  const index = new Map<string | number, DbRecord>();

  for (let i = 0; i < resource.count; i++) {
    let record = generateFromSchema<DbRecord>(resource.schema);
    record = addIdToRecord(record, resource.idField, resource.idType, i) as DbRecord;
    record = addTimestamps(record) as DbRecord;

    records.push(record);
    index.set(record[resource.idField] as string | number, record);
  }

  return {
    name: resource.pluralName.toLowerCase(),
    records,
    index,
  };
}

export function regenerateDatabase(resources: Resource[], seed?: number): Database {
  const newSeed = seed ?? Date.now();
  return initializeDatabase(resources, newSeed);
}

export function getCollection(name: string): Collection | undefined {
  return database.collections.get(name.toLowerCase());
}

export function getAllRecords(collectionName: string): DbRecord[] {
  const collection = getCollection(collectionName);
  return collection ? [...collection.records] : [];
}

export function getRecordById(collectionName: string, id: string | number): DbRecord | undefined {
  const collection = getCollection(collectionName);
  if (!collection) return undefined;

  return collection.index.get(id) ?? collection.index.get(String(id)) ?? collection.index.get(Number(id));
}

export function createRecord(
  collectionName: string,
  data: Partial<DbRecord>,
  resource: Resource
): DbRecord | null {
  const collection = getCollection(collectionName);
  if (!collection) return null;

  let record = { ...data } as DbRecord;
  record = addIdToRecord(record, resource.idField, resource.idType, collection.records.length) as DbRecord;
  record = addTimestamps(record) as DbRecord;

  collection.records.push(record);
  collection.index.set(record[resource.idField] as string | number, record);

  return record;
}

export function updateRecord(
  collectionName: string,
  id: string | number,
  data: Partial<DbRecord>
): DbRecord | null {
  const collection = getCollection(collectionName);
  if (!collection) return null;

  const existingRecord = getRecordById(collectionName, id);
  if (!existingRecord) return null;

  const updatedRecord = {
    ...existingRecord,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const index = collection.records.findIndex(r => r.id === existingRecord.id);
  if (index !== -1) {
    collection.records[index] = updatedRecord;
    collection.index.set(id, updatedRecord);
  }

  return updatedRecord;
}

export function deleteRecord(collectionName: string, id: string | number): boolean {
  const collection = getCollection(collectionName);
  if (!collection) return false;

  const existingRecord = getRecordById(collectionName, id);
  if (!existingRecord) return false;

  const index = collection.records.findIndex(r => r.id === existingRecord.id);
  if (index !== -1) {
    collection.records.splice(index, 1);
    collection.index.delete(id);
    return true;
  }

  return false;
}

export function getCollectionCount(collectionName: string): number {
  const collection = getCollection(collectionName);
  return collection ? collection.records.length : 0;
}

export function clearDatabase(): void {
  database = {
    collections: new Map(),
    seed: getSeed(),
  };
}
