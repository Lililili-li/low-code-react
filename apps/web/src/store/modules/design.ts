import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Draft } from "immer";
import { PageSchema, ComponentSchema } from '@repo/core/types'
import { useHistoryStore, createHistoryRecord } from './history'

export interface DesignState {
  config: {
    siderBarModel: 'material' | 'layers' | 'variable' | 'datasource' | null // 侧边栏当前打开的组件
    canvasPanel: {
      zoom: number
      lockZoom: boolean
    },
    propPanel: {
      open: boolean
    }
  }
  pageSchema: PageSchema
  currentCmp: ComponentSchema
  currentCmpId: string
  selectedCmpIds: string[]
  hoverId: string
  componentsMap: Map<string, ComponentSchema> // TODO 涉及到架构层次
}

export interface DesignActions {
  setSiderBarModel: (siderBarModel: DesignState['config']['siderBarModel'] | null) => void
  setPropsPanelOpen: (open: boolean) => void
  setCanvasPanel: (canvasPanel: Partial<DesignState['config']['canvasPanel']>) => void
  setPageSchema: (pageSchema: Partial<PageSchema>) => void
  setCurrentCmpId: (id: string) => void
  updateCurrentCmp: (component: Partial<ComponentSchema>) => void
  addComponent: (component: ComponentSchema, recordHistory?: boolean) => void
  addSelectComponent: (components: ComponentSchema[], recordHistory?: boolean) => void
  removeComponent: (id: string, recordHistory?: boolean) => void
  removeSelectComponents: (id: string[], recordHistory?: boolean) => void
  setSelectedCmpIds: (ids: string[]) => void
  addSelectedCmpIds: (id: string) => void
  updateSelectCmp: (components: ComponentSchema[]) => void
  setHoverId: (id: string) => void
  setPageState: (state: Record<string, any>) => void
  updatePageState: (key: string, value: any, isDelete?: boolean) => void
}

export const useDesignStore = create<DesignState & DesignActions>()(
  immer((set, get) => ({
    config: {
      siderBarModel: sessionStorage.getItem('siderBarModel') as any || 'material',
      canvasPanel: {
        zoom: 1,
        lockZoom: false
      },
      propPanel: {
        open: true
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
      state: {},
    },
    currentCmp: {} as ComponentSchema,
    currentCmpId: '',
    selectedCmpIds: [] as string[],
    hoverId: '',
    componentsMap: new Map(),

    setHoverId: (id: string) => {
      set((state) => {
        state.hoverId = id
      })
    },
    setSiderBarModel: (siderBarModel: DesignState['config']['siderBarModel'] | null) => {
      set((state) => {
        state.config.siderBarModel = siderBarModel
        sessionStorage.setItem('siderBarModel', siderBarModel || '')
      })
    },
    setPropsPanelOpen: (open: boolean) => {
      set((state) => {
        state.config.propPanel.open = open
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
    // 更新当前选中的组件
    updateCurrentCmp: (component: Partial<ComponentSchema>) => {
      set((state) => {
        const index = state.pageSchema.components.findIndex(item => item.id === component.id)
        if (index !== -1) {
          state.pageSchema.components[index] = { ...state.pageSchema.components[index], ...component } as Draft<ComponentSchema>
        }
      })
    },
    addComponent: (component: ComponentSchema, recordHistory = false) => {
      set((state) => {
        state.pageSchema.components.push(component as Draft<ComponentSchema>)
        state.componentsMap.set(component.id, component as Draft<ComponentSchema>)
      })

      // 记录历史
      if (recordHistory) {
        const pushHistory = useHistoryStore.getState().push
        pushHistory(createHistoryRecord.add(component))
      }
    },
    addSelectComponent: (components: ComponentSchema[], recordHistory = false) => {
      set((state) => {
        components.forEach(item => {
          state.pageSchema.components.push(item as Draft<ComponentSchema>)
          state.componentsMap.set(item.id, item as Draft<ComponentSchema>)
        })
      })

      // 记录历史
      if (recordHistory) {
        const pushHistory = useHistoryStore.getState().push
        pushHistory(createHistoryRecord.addMultiple(components))
      }
    },
    removeComponent: (id: string, recordHistory = false) => {
      const component = useDesignStore.getState().pageSchema.components.find(c => c.id === id)
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.filter((c) => c.id !== id)
      })

      // 记录历史
      if (recordHistory && component) {
        const pushHistory = useHistoryStore.getState().push
        pushHistory(createHistoryRecord.delete(component))
      }
    },

    // 删除多选组件的方法
    removeSelectComponents(ids: string[], recordHistory = false) {
      const state = get()
      const selectComponents = state.pageSchema.components.filter((c) => ids.includes(c.id))
      set((state) => {
        state.pageSchema.components = state.pageSchema.components.filter((c) => !ids.includes(c.id))
      })

      // 记录历史
      if (recordHistory) {
        const pushHistory = useHistoryStore.getState().push
        pushHistory(createHistoryRecord.deleteMultiple(selectComponents))
      }
    },

    // 更新id为参数id的组件
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
    },
    setSelectedCmpIds(ids: string[]) {
      set((state) => {
        state.selectedCmpIds = ids;
      })
    },
    addSelectedCmpIds(id: string) {
      set((state) => {
        if (state.selectedCmpIds.includes(id)) return;
        state.selectedCmpIds.push(id);
      })
    },
    updateSelectCmp(components: ComponentSchema[]) {
      set((state) => {
        const componentMap = new Map(components.map(item => [item.id, item]));
        state.pageSchema.components = state.pageSchema.components.map((cmp) =>
          componentMap.get(cmp.id) || cmp
        );
      })
    },

    // 设置页面变量
    setPageState(pageState: Record<string, any>) {
      set((state) => {
        state.pageSchema.state = {
          ...state.pageSchema.state,
          ...pageState
        }
      })
    },
    updatePageState(key: string, value?: any, isDelete = false) {
      set((state) => {
        if (isDelete) {
          delete state.pageSchema.state[key]
        } else {
          state.pageSchema.state[key] = value;
        }
      })
    }
  }))
);
