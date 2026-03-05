import { Project } from '@/types/project';

const STORAGE_KEY = 'mock-api-generator-project';

export function saveProject(project: Project): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save project to localStorage:', error);
  }
}

export function loadProject(): Project | null {
  if (typeof window === 'undefined') return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    return JSON.parse(serialized) as Project;
  } catch (error) {
    console.error('Failed to load project from localStorage:', error);
    return null;
  }
}

export function clearProject(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear project from localStorage:', error);
  }
}

export function hasStoredProject(): boolean {
  if (typeof window === 'undefined') return false;

  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function exportProjectToFile(project: Project): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name || 'mock-api'}-project.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importProjectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const project = JSON.parse(content) as Project;
        resolve(project);
      } catch (error) {
        reject(new Error('Invalid project file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
