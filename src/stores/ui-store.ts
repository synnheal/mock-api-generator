import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  selectedResourceIndex: number;
  selectedEndpointIndex: number;
  leftPanelSize: number;
  rightPanelSize: number;
  activeTab: 'schema' | 'resources' | 'playground' | 'exports';
  showLogs: boolean;

  setSelectedResourceIndex: (index: number) => void;
  setSelectedEndpointIndex: (index: number) => void;
  setLeftPanelSize: (size: number) => void;
  setRightPanelSize: (size: number) => void;
  setActiveTab: (tab: 'schema' | 'resources' | 'playground' | 'exports') => void;
  setShowLogs: (show: boolean) => void;
  toggleLogs: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      selectedResourceIndex: 0,
      selectedEndpointIndex: 0,
      leftPanelSize: 30,
      rightPanelSize: 35,
      activeTab: 'schema',
      showLogs: false,

      setSelectedResourceIndex: (index: number) => {
        set({ selectedResourceIndex: index, selectedEndpointIndex: 0 });
      },

      setSelectedEndpointIndex: (index: number) => {
        set({ selectedEndpointIndex: index });
      },

      setLeftPanelSize: (size: number) => {
        set({ leftPanelSize: size });
      },

      setRightPanelSize: (size: number) => {
        set({ rightPanelSize: size });
      },

      setActiveTab: (tab: 'schema' | 'resources' | 'playground' | 'exports') => {
        set({ activeTab: tab });
      },

      setShowLogs: (show: boolean) => {
        set({ showLogs: show });
      },

      toggleLogs: () => {
        const { showLogs } = get();
        set({ showLogs: !showLogs });
      },
    }),
    {
      name: 'mock-api-ui',
      partialize: (state) => ({
        leftPanelSize: state.leftPanelSize,
        rightPanelSize: state.rightPanelSize,
      }),
    }
  )
);
