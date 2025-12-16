import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PageSchema, ComponentSchema } from '@repo/core/types'

export interface DesignState {
  config: {
    siderVisible: 'material' | 'layers' | 'variable' // 侧边栏当前打开的组件
    canvasPanel: {
      zoom: number
      lockZoom: boolean
    }
  }
  pageSchema: PageSchema
}

interface DesignActions {
  setSiderVisible: (siderVisible: DesignState['config']['siderVisible']) => void
  setCanvasPanel: (canvasPanel: Partial<DesignState['config']['canvasPanel']>) => void
  setPageSchema: (pageSchema: Partial<PageSchema>) => void
  addComponent: (component: ComponentSchema) => void
  removeComponent: (id: string) => void
}

export const useDesignStore = create<DesignState & DesignActions>()(
  immer((set) => ({
    config: {
      siderVisible: 'material',
      canvasPanel: {
        zoom: 1,
        lockZoom: false
      }
    },
    pageSchema: {
      width: 1920,
      height: 1080,
      background: {
        useType: '1',
        color: '#333',
        image: '',
      },
      adapterType: '1',
      filter: {
        open: false,
        contrast: 0,
        saturation: 0,
        brightness: 0,
        opacity: 0,
      },
      globalHeaders: '{}',
      globalCss: '',
      components: [],
    },
    setSiderVisible: (siderVisible: DesignState['config']['siderVisible']) => {
      set((state) => {
        state.config.siderVisible = siderVisible
      })
    },
    setPageSchema: (pageSchema: Partial<PageSchema>) => {
      set((state) => {
        state.pageSchema = { ...state.pageSchema, ...pageSchema }
      })
    },
    addComponent: (component: ComponentSchema) => {
      set((state) => {
        state.pageSchema.components.push(component)
      })
    },
    removeComponent: (id: string) => {
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.filter((component) => component.id !== id)
      })
    },
    updateComponent: (id: string, component: ComponentSchema) => {
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.map((cmp) => component.id === id ? component : cmp)
      })
    },
    setCanvasPanel: (canvasPanel: Partial<DesignState['config']['canvasPanel']>) => {
      set((state) => {
        state.config.canvasPanel = {
          ...state.config.canvasPanel,
          ...canvasPanel
        }
      })
    }
  }))
);
