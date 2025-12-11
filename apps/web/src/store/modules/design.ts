import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface DesignState {
  config: {
    siderVisible: 'material' | 'layers' | 'variable' // 侧边栏当前打开的组件
  }
}

interface DesignActions {
  setSiderVisible: (siderVisible: DesignState['config']['siderVisible']) => void
}

export const useDesignStore = create<DesignState & DesignActions>()(
  immer((set) => ({
    config: {
      siderVisible: 'material'
    },
    setSiderVisible: (siderVisible: DesignState['config']['siderVisible']) => {
      set((state) => {
        state.config.siderVisible = siderVisible
      })
    }
  }))
);
