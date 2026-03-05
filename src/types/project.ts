import { JSONSchema7 } from 'json-schema';

export interface Project {
  id: string;
  name: string;
  schema: JSONSchema7 | null;
  resources: Resource[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  name: string;
  pluralName: string;
  schema: JSONSchema7;
  idField: string;
  idType: 'uuid' | 'integer';
  endpoints: Endpoint[];
  count: number;
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  type: 'list' | 'detail' | 'create' | 'update' | 'delete';
}

export interface ProjectSettings {
  seed: number;
  defaultCount: number;
  baseUrl: string;
  pagination: PaginationSettings;
}

export interface PaginationSettings {
  defaultPageSize: number;
  maxPageSize: number;
  style: 'page' | 'offset';
}

export type SchemaValidationError = {
  path: string;
  message: string;
};
