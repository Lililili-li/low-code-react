import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
export interface AppState {
  config: {
    theme: 'light' | 'dark'
    language: 'zh-CN' | 'en-US',
  }
}

interface AppActions {
  updateAppConfig: (config: Partial<AppState['config']>) => void
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set) => ({
      config: {
        theme: 'light',
        language: 'zh-CN',
      },
      updateAppConfig: (config:Partial<AppState['config']>) => {
        set((state) => {
          state.config = {...state.config, ...config}
        })
      }
    })),
    {
      name: "app-storage", // localStorage key
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const config = JSON.parse(str);
          return { state: { config }, version: 0 };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value.state.config));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
