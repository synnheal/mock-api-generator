'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project-store';

export function usePersistedProject() {
  const { project, loadProject } = useProjectStore();

  useEffect(() => {
    const handleBeforeUnload = () => {
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [project]);

  return { project, loadProject };
}
