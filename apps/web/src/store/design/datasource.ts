import { DatasourceSchema } from "@repo/core/types";
import { Draft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface DatasourceState {
  datasource: DatasourceSchema[]
}

interface DatasourceActions {
  setDatasource: (datasource: DatasourceSchema[]) => void
  addDatasource: (datasource: DatasourceSchema) => void
  updateDatasource: (id: string, datasource: Partial<DatasourceSchema>) => void
  removeDatasource: (id: string) => void
  clearDatasource: () => void
}

export const useDesignDatasourceStore = create<DatasourceState & DatasourceActions>()(
  immer((set) => ({
    datasource: [],
    setDatasource: (datasource: DatasourceSchema[]) => {
      set((state) => {
        state.datasource = datasource
      })
    },
    addDatasource: (datasource: DatasourceSchema) => {
      set((state) => {
        state.datasource.push(datasource)
      })
    },
    updateDatasource: (id: string, datasource: Partial<DatasourceSchema>) => {
      set(state => {
        const index = state.datasource.findIndex(item => item.id === id)
        if (index !== -1) {
          state.datasource[index] = { ...state.datasource[index], ...datasource } as Draft<DatasourceSchema>
        }
      })
    },
    removeDatasource: (id: string) => {
      set(state => {
        state.datasource = state.datasource.filter(item => item.id !== id)
      })
    },
    clearDatasource: () => {
      set(state => {
        state.datasource = []
      })
    }
  }))
)