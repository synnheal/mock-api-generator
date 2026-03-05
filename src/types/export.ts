export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  patch?: Operation;
  delete?: Operation;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required?: boolean;
  schema: { type: string; default?: unknown };
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content: {
    'application/json': {
      schema: unknown;
    };
  };
}

export interface Response {
  description: string;
  content?: {
    'application/json': {
      schema: unknown;
    };
  };
}

export interface PostmanCollection {
  info: {
    _postman_id: string;
    name: string;
    schema: string;
    description?: string;
  };
  variable: Array<{
    key: string;
    value: string;
    type?: string;
  }>;
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: Array<{ key: string; value: string; disabled?: boolean }>;
    };
    body?: {
      mode: string;
      raw: string;
      options?: { raw: { language: string } };
    };
  };
  response: unknown[];
}

export interface InsomniaExport {
  _type: 'export';
  __export_format: number;
  __export_date: string;
  __export_source: string;
  resources: InsomniaResource[];
}

export interface InsomniaResource {
  _id: string;
  _type: 'workspace' | 'request_group' | 'request' | 'environment';
  parentId: string | null;
  name: string;
  description?: string;
  method?: string;
  url?: string;
  body?: { mimeType: string; text: string };
  headers?: Array<{ name: string; value: string }>;
  parameters?: Array<{ name: string; value: string; disabled?: boolean }>;
  data?: Record<string, string>;
}
