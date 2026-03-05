import { Record as DbRecord } from '@/types/db';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'contains';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export function parseFilters(params: Record<string, string | undefined>): Filter[] {
  const filters: Filter[] = [];
  const operatorSuffixes: Record<string, FilterOperator> = {
    '_ne': 'ne',
    '_gt': 'gt',
    '_gte': 'gte',
    '_lt': 'lt',
    '_lte': 'lte',
    '_like': 'like',
    '_contains': 'contains',
  };

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (['page', 'pageSize', 'limit', 'offset', 'sort', 'q'].includes(key)) continue;

    let field = key;
    let operator: FilterOperator = 'eq';

    for (const [suffix, op] of Object.entries(operatorSuffixes)) {
      if (key.endsWith(suffix)) {
        field = key.slice(0, -suffix.length);
        operator = op;
        break;
      }
    }

    filters.push({
      field,
      operator,
      value: parseValue(value),
    });
  }

  return filters;
}

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;

  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

  return value;
}

export function applyFilters(records: DbRecord[], filters: Filter[]): DbRecord[] {
  if (filters.length === 0) return records;

  return records.filter(record => {
    return filters.every(filter => matchesFilter(record, filter));
  });
}

function matchesFilter(record: DbRecord, filter: Filter): boolean {
  const fieldValue = getNestedValue(record, filter.field);

  switch (filter.operator) {
    case 'eq':
      return fieldValue === filter.value;

    case 'ne':
      return fieldValue !== filter.value;

    case 'gt':
      return typeof fieldValue === 'number' && typeof filter.value === 'number'
        ? fieldValue > filter.value
        : false;

    case 'gte':
      return typeof fieldValue === 'number' && typeof filter.value === 'number'
        ? fieldValue >= filter.value
        : false;

    case 'lt':
      return typeof fieldValue === 'number' && typeof filter.value === 'number'
        ? fieldValue < filter.value
        : false;

    case 'lte':
      return typeof fieldValue === 'number' && typeof filter.value === 'number'
        ? fieldValue <= filter.value
        : false;

    case 'like':
    case 'contains':
      if (typeof fieldValue !== 'string' || typeof filter.value !== 'string') return false;
      return fieldValue.toLowerCase().includes(filter.value.toLowerCase());

    default:
      return true;
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function applyFullTextSearch(records: DbRecord[], query: string, fields?: string[]): DbRecord[] {
  if (!query || query.trim() === '') return records;

  const searchTerms = query.toLowerCase().split(/\s+/);

  return records.filter(record => {
    const searchableFields = fields ?? getStringFields(record);
    const searchableText = searchableFields
      .map(field => String(getNestedValue(record, field) ?? ''))
      .join(' ')
      .toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}

function getStringFields(record: DbRecord): string[] {
  return Object.entries(record)
    .filter(([, value]) => typeof value === 'string')
    .map(([key]) => key);
}
