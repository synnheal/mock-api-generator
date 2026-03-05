import { Record as DbRecord, PaginatedResponse } from '@/types/db';

export interface PaginationConfig {
  page: number;
  pageSize: number;
  style: 'page' | 'offset';
  offset?: number;
  limit?: number;
}

export function parsePagination(
  params: Record<string, string | undefined>,
  defaults: { pageSize: number; maxPageSize: number; style: 'page' | 'offset' }
): PaginationConfig {
  const style = params.offset !== undefined || params.limit !== undefined ? 'offset' : defaults.style;

  if (style === 'offset') {
    const offset = Math.max(0, parseInt(params.offset ?? '0', 10) || 0);
    const limit = Math.min(
      defaults.maxPageSize,
      Math.max(1, parseInt(params.limit ?? String(defaults.pageSize), 10) || defaults.pageSize)
    );

    return {
      style: 'offset',
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      offset,
      limit,
    };
  }

  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const pageSize = Math.min(
    defaults.maxPageSize,
    Math.max(1, parseInt(params.pageSize ?? String(defaults.pageSize), 10) || defaults.pageSize)
  );

  return {
    style: 'page',
    page,
    pageSize,
  };
}

export function applyPagination<T extends DbRecord>(
  records: T[],
  config: PaginationConfig
): PaginatedResponse<T> {
  const total = records.length;
  const totalPages = Math.ceil(total / config.pageSize);

  let startIndex: number;
  let endIndex: number;

  if (config.style === 'offset' && config.offset !== undefined) {
    startIndex = config.offset;
    endIndex = startIndex + (config.limit ?? config.pageSize);
  } else {
    startIndex = (config.page - 1) * config.pageSize;
    endIndex = startIndex + config.pageSize;
  }

  const data = records.slice(startIndex, endIndex);

  return {
    data,
    meta: {
      page: config.page,
      pageSize: config.pageSize,
      total,
      totalPages,
    },
  };
}

export function calculatePaginationInfo(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return {
    total,
    totalPages,
    currentPage: page,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    showing: endIndex - startIndex,
  };
}
