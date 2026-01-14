import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface SystemState {
  industries: {
    name: string,
    id: number,
    [key: string]: any
  }[]
}

interface SystemActions {
  setIndustries: (state: SystemState['industries']) => void
}

export const useSystemStore = create<SystemState & SystemActions>()(
  immer((set) => ({
    industries: [],
    setIndustries: (industries: SystemState['industries']) => {
      set((state) => {
        state.industries = industries
      })
    }
  }))
);
