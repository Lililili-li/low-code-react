import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface DesignState {
  state: Record<string, any>
}

interface DesignActions {
  setState: (pageState: Record<string, any>) => void
  updateState: (key: string, value: any, isDelete?: boolean) => void
}

export const useDesignStateStore = create<DesignState & DesignActions>()(
  immer((set) => ({
    state: {},
    setState: (pageState: Record<string, any>) => {
      set((state) => {
        state.state = pageState
      })
    },
    updateState: (key: string, value: any, isDelete = false) => {
      set((state) => {
        if (isDelete) {
          delete state.state[key]
        } else {
          state.state[key] = value;
        }
      })
    }
  }))
)