import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Draft } from "immer";
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
  currentCmp: ComponentSchema
  currentCmpId: string
}

interface DesignActions {
  setSiderVisible: (siderVisible: DesignState['config']['siderVisible']) => void
  setCanvasPanel: (canvasPanel: Partial<DesignState['config']['canvasPanel']>) => void
  setPageSchema: (pageSchema: Partial<PageSchema>) => void
  setCurrentCmpId: (id: string) => void
  updateCurrentCmp: (component: Partial<ComponentSchema>) => void
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
    currentCmp: {} as ComponentSchema,
    currentCmpId: '',
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
    setCurrentCmpId: (id: string) => {
      set((state) => {
        state.currentCmpId = id;
      })
    },
    updateCurrentCmp: (component: Partial<ComponentSchema>) => {
      set((state) => {
        const index = state.pageSchema.components.findIndex(item => item.id === component.id)
        if (index !== -1) {
          state.pageSchema.components[index] = { ...state.pageSchema.components[index], ...component } as Draft<ComponentSchema>
        }
      })
    },
    addComponent: (component: ComponentSchema) => {
      set((state) => {
        state.pageSchema.components.push(component as Draft<ComponentSchema>)
      })
    },
    removeComponent: (id: string) => {
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.filter((component) => component.id !== id)
      })
    },
    updateComponent: (id: string, component: ComponentSchema) => {
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.map((cmp) => cmp.id === id ? component as Draft<ComponentSchema> : cmp)
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
