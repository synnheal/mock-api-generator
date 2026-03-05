import { Record as DbRecord } from '@/types/db';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export function parseSort(sortParam: string | undefined): SortConfig[] {
  if (!sortParam) return [];

  return sortParam.split(',').map(part => {
    const trimmed = part.trim();
    if (trimmed.startsWith('-')) {
      return { field: trimmed.slice(1), direction: 'desc' as const };
    }
    if (trimmed.startsWith('+')) {
      return { field: trimmed.slice(1), direction: 'asc' as const };
    }
    return { field: trimmed, direction: 'asc' as const };
  });
}

export function applySort(records: DbRecord[], sortConfigs: SortConfig[]): DbRecord[] {
  if (sortConfigs.length === 0) return records;

  return [...records].sort((a, b) => {
    for (const config of sortConfigs) {
      const comparison = compareValues(
        getNestedValue(a, config.field),
        getNestedValue(b, config.field),
        config.direction
      );
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const multiplier = direction === 'desc' ? -1 : 1;

  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1 * multiplier;
  if (b === undefined) return -1 * multiplier;

  if (a === null && b === null) return 0;
  if (a === null) return 1 * multiplier;
  if (b === null) return -1 * multiplier;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier;
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) * multiplier;
  }

  if (a instanceof Date && b instanceof Date) {
    return (a.getTime() - b.getTime()) * multiplier;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return ((a === b) ? 0 : (a ? 1 : -1)) * multiplier;
  }

  return String(a).localeCompare(String(b)) * multiplier;
}
