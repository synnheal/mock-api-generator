export interface Record {
  id: string | number;
  [key: string]: unknown;
}

export interface Collection {
  name: string;
  records: Record[];
  index: Map<string | number, Record>;
}

export interface Database {
  collections: Map<string, Collection>;
  seed: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  q?: string;
  [key: string]: string | number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}
