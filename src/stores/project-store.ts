import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JSONSchema7 } from 'json-schema';
import { Project, Resource, ProjectSettings, SchemaValidationError } from '@/types/project';
import { parseSchemaToResources } from '@/lib/schema/parse';
import { validateSchema, parseJsonSafe } from '@/lib/schema/validate';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  project: Project;
  schemaText: string;
  schemaErrors: SchemaValidationError[];
  isSchemaValid: boolean;

  setSchemaText: (text: string) => void;
  parseAndValidateSchema: () => boolean;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  setResourceCount: (resourceName: string, count: number) => void;
  resetProject: () => void;
  loadProject: (project: Project) => void;
}

const defaultSettings: ProjectSettings = {
  seed: Date.now(),
  defaultCount: 50,
  baseUrl: '/api',
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    style: 'page',
  },
};

const createDefaultProject = (): Project => ({
  id: uuidv4(),
  name: 'New Project',
  schema: null,
  resources: [],
  settings: defaultSettings,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: createDefaultProject(),
      schemaText: '',
      schemaErrors: [],
      isSchemaValid: false,

      setSchemaText: (text: string) => {
        set({ schemaText: text });
      },

      parseAndValidateSchema: () => {
        const { schemaText, project } = get();

        if (!schemaText.trim()) {
          set({
            schemaErrors: [],
            isSchemaValid: false,
            project: {
              ...project,
              schema: null,
              resources: [],
              updatedAt: new Date().toISOString(),
            },
          });
          return false;
        }

        const { data, error } = parseJsonSafe(schemaText);

        if (error) {
          set({
            schemaErrors: [{ path: '', message: `JSON Parse Error: ${error}` }],
            isSchemaValid: false,
          });
          return false;
        }

        const validation = validateSchema(data);

        if (!validation.valid) {
          set({
            schemaErrors: validation.errors,
            isSchemaValid: false,
          });
          return false;
        }

        const schema = data as JSONSchema7;
        const resources = parseSchemaToResources(schema, project.settings.defaultCount);

        set({
          schemaErrors: [],
          isSchemaValid: true,
          project: {
            ...project,
            schema,
            resources,
            updatedAt: new Date().toISOString(),
          },
        });

        return true;
      },

      updateSettings: (settings: Partial<ProjectSettings>) => {
        const { project } = get();
        set({
          project: {
            ...project,
            settings: {
              ...project.settings,
              ...settings,
              pagination: {
                ...project.settings.pagination,
                ...(settings.pagination || {}),
              },
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      setResourceCount: (resourceName: string, count: number) => {
        const { project } = get();
        const resources = project.resources.map((r) =>
          r.name === resourceName ? { ...r, count } : r
        );
        set({
          project: {
            ...project,
            resources,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      resetProject: () => {
        set({
          project: createDefaultProject(),
          schemaText: '',
          schemaErrors: [],
          isSchemaValid: false,
        });
      },

      loadProject: (project: Project) => {
        set({
          project,
          schemaText: project.schema ? JSON.stringify(project.schema, null, 2) : '',
          schemaErrors: [],
          isSchemaValid: !!project.schema,
        });
      },
    }),
    {
      name: 'mock-api-project',
      partialize: (state) => ({
        project: state.project,
        schemaText: state.schemaText,
      }),
    }
  )
);
