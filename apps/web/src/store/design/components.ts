import { ComponentSchema } from "@repo/core/types";
import { Draft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createHistoryRecord, useHistoryStore } from "../history";

interface ComponentsState {
  components: ComponentSchema[]
  currentCmp: ComponentSchema
  currentCmpId: string
  selectedCmpIds: string[]
  hoverId: string
  componentsMap: Map<string, ComponentSchema>
}

interface ComponentsActions {
  setComponents: (components?: ComponentSchema[]) => void
  setCurrentCmpId: (id: string) => void
  updateCurrentCmp: (component: Partial<ComponentSchema>) => void
  addComponent: (component: ComponentSchema, recordHistory?: boolean) => void
  updateComponent: (id: string, component: Partial<ComponentSchema>) => void
  addSelectComponent: (components: ComponentSchema[], recordHistory?: boolean) => void
  removeComponent: (id: string, recordHistory?: boolean) => void
  removeSelectComponents: (id: string[], recordHistory?: boolean) => void
  setSelectedCmpIds: (ids: string[]) => void
  addSelectedCmpIds: (id: string) => void
  updateSelectCmp: (components: ComponentSchema[]) => void
  setHoverId: (id: string) => void
}

export const useDesignComponentsStore = create<ComponentsState & ComponentsActions>()(
  immer((set, get) => ({
    components: [] as ComponentSchema[],
    currentCmp: {} as ComponentSchema,
    currentCmpId: '',
    selectedCmpIds: [] as string[],
    hoverId: '',
    componentsMap: new Map(),

    setComponents: (components?: ComponentSchema[]) => {
      set((state) => {
        state.components = [...state.components, ...(components || [])];
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
        const index = state.components.findIndex(item => item.id === component.id)
        if (index !== -1) {
          state.components[index] = { ...state.components[index], ...component } as Draft<ComponentSchema>
        }
      })
    },
    addComponent: (component: ComponentSchema, recordHistory = false) => {
      set((state) => {
        state.components.push(component as Draft<ComponentSchema>)
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
          state.components.push(item as Draft<ComponentSchema>)
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
      const state = get()
      const component = state.components.find(c => c.id === id)
      set((state) => {
        state.components = state.components.filter((c) => c.id !== id)
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
      const selectComponents = state.components.filter((c) => ids.includes(c.id))
      set((state) => {
        state.components = state.components.filter((c) => !ids.includes(c.id))
      })

      // 记录历史
      if (recordHistory) {
        const pushHistory = useHistoryStore.getState().push
        pushHistory(createHistoryRecord.deleteMultiple(selectComponents))
      }
    },

    // 更新id为参数id的组件
    updateComponent: (id: string, component: Partial<ComponentSchema>) => {
      set((state) => {
        state.components = state.components.map((cmp) => cmp.id === id ? { ...cmp, ...component } as Draft<ComponentSchema> : cmp)
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
        state.components = state.components.map((cmp) =>
          componentMap.get(cmp.id) || cmp
        );
      })
    },
    setHoverId: (id: string) => {
      set((state) => {
        state.hoverId = id
      })
    },
  }))
)