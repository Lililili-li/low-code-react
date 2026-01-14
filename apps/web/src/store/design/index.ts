import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { PageSchema } from '@repo/core/types'
import { useDesignStateStore } from './state'
import { useDesignComponentsStore } from "./components";

export interface DesignState {
  panelConfig: {
    siderBarModel: 'material' | 'layers' | 'variable' | 'datasource' | null // 侧边栏当前打开的组件
    canvasPanel: {
      zoom: number
      lockZoom: boolean
    },
    propPanel: {
      open: boolean
    }
  }
  pageSchema: Omit<PageSchema, 'components' | 'state'>
}

export interface DesignActions {
  setSiderBarModel: (siderBarModel: DesignState['panelConfig']['siderBarModel'] | null) => void
  setPropsPanelOpen: (open: boolean) => void
  setCanvasPanel: (canvasPanel: Partial<DesignState['panelConfig']['canvasPanel']>) => void
  setPageSchema: (pageSchema: PageSchema) => void
  updatePageSchema: (key: keyof Omit<PageSchema, 'components' | 'state'>, value: any) => void
}

export const useDesignStore = create<DesignState & DesignActions>()(
  immer((set) => ({
    panelConfig: {
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
    },

    setSiderBarModel: (siderBarModel: DesignState['panelConfig']['siderBarModel'] | null) => {
      set((state) => {
        state.panelConfig.siderBarModel = siderBarModel
        sessionStorage.setItem('siderBarModel', siderBarModel || '')
      })
    },
    setPropsPanelOpen: (open: boolean) => {
      set((state) => {
        state.panelConfig.propPanel.open = open
      })
    },

    // 将获取的数据设置到store中，并且分开管理
    setPageSchema: (pageSchema: PageSchema) => {
      set((state) => {
        const { setState } = useDesignStateStore.getState()
        const { setComponents } = useDesignComponentsStore.getState()
        state.pageSchema = { ...state.pageSchema, ...pageSchema }
        setState(pageSchema?.state || {})
        setComponents(pageSchema?.components || [])
      })
    },
    updatePageSchema: (key: keyof Omit<PageSchema, 'components' | 'state'>, value: any) => {
      set((state) => {
        (state.pageSchema as any)[key] = value
      })
    },
    setCanvasPanel: (canvasPanel: Partial<DesignState['panelConfig']['canvasPanel']>) => {
      set((state) => {
        Object.assign(state.panelConfig.canvasPanel, canvasPanel)
      })
    },
  }))
);
