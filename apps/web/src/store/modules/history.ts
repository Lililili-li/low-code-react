import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ComponentSchema } from '@repo/core/types';
import { useDesignStore } from './design';

// 历史记录操作类型
export type HistoryActionType =
  | 'add'      // 新增组件
  | 'addMultiple'      // 新增组件
  | 'delete'   // 删除组件
  | 'deleteMultiple'   // 删除组件
  | 'move'     // 移动组件
  | 'moveMultiple'     // 移动组件
  | 'paste'    // 粘贴组件
  | 'group'    // 组合组件
  | 'split'    // 拆分组件
  | 'lock'     // 锁定组件
  | 'unlock'   // 解锁组件
  | 'visible'  // 显示组件
  | 'hidden'   // 隐藏组件
  | 'layer';   // 图层操作

interface PositionProps { left: number, top: number, id?: string }

// 单条历史记录
export interface HistoryRecord {
  id: string;                          // 记录唯一ID
  type: HistoryActionType;             // 操作类型
  title: string;                       // 操作描述
  timestamp: number;                   // 时间戳
  componentId?: string;                // 操作的组件ID
  component?: ComponentSchema;         // 操作涉及的组件数据
  componentIds?: string[];               // 操作的组件ID
  components?: ComponentSchema[]       // 操作的组件ID
  oldPosition?: PositionProps
  newPosition?: PositionProps
  oldPositions?: PositionProps[]
  newPositions?: PositionProps[]
}

interface HistoryState {
  undoRecords: HistoryRecord[];            // 历史记录栈
  redoRecords: HistoryRecord[];            // 历史记录栈
  currentIndex: number;                // 当前指针位置（-1 表示没有历史）
  maxRecords: number;                  // 最大记录数
}

interface HistoryActions {
  // 添加历史记录
  push: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  // 撤销
  undo: () => void;
  // 重做
  redo: () => void;
  // 清空历史
  clear: () => void;
  // 是否可以撤销
  canUndo: () => boolean;
  // 是否可以重做
  canRedo: () => boolean;
}

const handleComponentOpt = (actionType: HistoryActionType, record: HistoryRecord, type: 'undo' | 'redo') => {
  const { addComponent, removeComponent, updateCurrentCmp, setCurrentCmpId, currentCmpId, setSelectedCmpIds, selectedCmpIds, pageSchema } = useDesignStore.getState()
  switch (actionType) {
    case 'add':
      if (type === 'undo') {
        removeComponent(record.componentId!)
        if (currentCmpId === record.componentId) {
          setCurrentCmpId('')
        }
        if (selectedCmpIds.length === 1 && selectedCmpIds[0] === record.componentId) {
          setSelectedCmpIds([])
        }
      } else {
        addComponent(record.component!)
      }
      break;
    case 'addMultiple':
      if (type === 'undo') {
        record.components?.forEach(item => {
          removeComponent(item.id)
        })
      } else {
        record.components?.forEach(item => {
          addComponent(item)
        })
        if (currentCmpId === record.componentId) {
          setCurrentCmpId('')
        }
        if (selectedCmpIds.length === 1 && selectedCmpIds[0] === record.componentId) {
          setSelectedCmpIds([])
        }
      }
      break;
    case 'delete':
      if (type === 'undo') {
        addComponent(record.component!)
        if (!currentCmpId) {
          setSelectedCmpIds([])
        }
      } else {
        removeComponent(record.componentId!)
        if (currentCmpId === record.componentId) {
          setCurrentCmpId('')
        }
        if (selectedCmpIds.length === 1 && selectedCmpIds[0] === record.componentId) {
          setSelectedCmpIds([])
        }
      }
      break;
    case 'deleteMultiple':
      if (type === 'undo') {
        record.components?.forEach(item => {
          addComponent(item)
        })
      } else {
        record.components?.forEach(item => {
          removeComponent(item.id!)
        })
        if (currentCmpId === record.componentId) {
          setCurrentCmpId('')
        }
        if (selectedCmpIds.length === 1 && selectedCmpIds[0] === record.componentId) {
          setSelectedCmpIds([])
        }
      }
      break;
    case 'move':
      if (type === 'undo') {
        const currentCmp = pageSchema.components.find(item => item.id === record.componentId)
        updateCurrentCmp({
          ...currentCmp,
          style: { ...currentCmp?.style, left: record.oldPosition?.left, top: record.oldPosition?.top }
        })
      } else {
        const currentCmp = pageSchema.components.find(item => item.id === record.componentId)
        updateCurrentCmp({
          ...currentCmp,
          style: { ...currentCmp?.style, left: record.newPosition?.left, top: record.newPosition?.top }
        })
      }
      break;
    case 'moveMultiple':
      if (type === 'undo') {
        record.components?.forEach(item => {
          const position = record.oldPositions?.find(p => p.id === item.id)
          updateCurrentCmp({
            ...item,
            style: { ...item?.style, left: position?.left, top: position?.top }
          })
        })
      } else {
        record.components?.forEach(item => {
          const position = record.newPositions?.find(p => p.id === item.id)
          updateCurrentCmp({
            ...item,
            style: { ...item?.style, left: position?.left, top: position?.top }
          })
        })
      }
      break;
    default:
      break;
  }

}

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  immer((set, get) => ({
    undoRecords: [],
    redoRecords: [],
    currentIndex: -1,
    maxRecords: 50, // 最多保存50条记录

    push: (record) => {
      set((state) => {
        // 如果当前不在最新位置，删除当前位置之后的所有记录
        if (state.currentIndex < state.undoRecords.length - 1) {
          state.undoRecords = state.undoRecords.slice(0, state.currentIndex + 1);
        }

        // 创建新记录
        const newRecord: HistoryRecord = {
          ...record,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        // 添加新记录
        state.undoRecords.unshift(newRecord);

        // 如果超过最大记录数，删除最早的记录
        if (state.undoRecords.length > state.maxRecords) {
          state.undoRecords.shift();
        } else {
          state.currentIndex++;
        }
      });
    },

    undo: () => {
      const state = get();
      if (state.undoRecords.length === 0) return;
      const record = state.undoRecords[0];
      // const method = useDesignStore((state) => ({
      //   addComponent: state.addComponent,
      //   removeComponent: state.removeComponent
      // }));

      set((s) => {
        s.redoRecords.unshift(record);
        s.undoRecords.shift();
      });
      handleComponentOpt(record.type, record, 'undo')
    },

    redo: () => {
      const state = get();
      if (state.redoRecords.length === 0) return;
      const record = state.redoRecords[0];
      set((s) => {
        s.undoRecords.unshift(record);
        s.redoRecords.shift();
      });
      handleComponentOpt(record.type, record, 'redo')
    },

    clear: () => {
      set((state) => {
        state.undoRecords = [];
        state.redoRecords = [];
      });
    },

    canUndo: () => {
      return get().undoRecords.length > 0;
    },

    canRedo: () => {
      const state = get();
      return state.redoRecords.length > 0;
    },
  }))
);

// 辅助函数：创建历史记录
export const createHistoryRecord = {
  add: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'add',
    title: `新增-${component.name}`,
    componentId: component.id,
    component,
  }),

  addMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'addMultiple',
    title: `新增-${components.map(c => c.name).join(',')}`,
    componentIds: components.map(c => c.id),
    components,
  }),

  delete: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'delete',
    title: `删除-${component.name}`,
    componentId: component.id,
    component,
  }),

  deleteMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'deleteMultiple',
    title: `删除-${components.map(c => c.name).join(',')}`,
    componentIds: components.map(c => c.id),
    components,
  }),

  move: (component: ComponentSchema, oldPosition: PositionProps, newPosition: PositionProps): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'move',
    title: `移动-${component.name}`,
    componentId: component.id,
    oldPosition,
    newPosition,
  }),
  moveMultiple: (components: ComponentSchema[], oldPositions: PositionProps[], newPositions: PositionProps[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'moveMultiple',
    title: `移动-${components.map(c => c.name).join(',')}`,
    componentIds: components.map(c => c.id),
    components: components,
    oldPositions,
    newPositions,
  }),

  // paste: (component: ComponentSchema, type: 'copy' | 'cut'): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
  //   type,
  //   title: `粘贴-${component.name}`,
  //   componentId: component.id,
  //   component,
  // }),

  group: (components: ComponentSchema[], groupComponent: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'group',
    title: `组合-${components.length}`,
    componentIds: components.map(c => c.id),
    component: groupComponent,
    components
  }),

  split: (groupComponent: ComponentSchema, components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'split',
    title: `拆分-${groupComponent.name}`,
    componentId: groupComponent.id,
    component: groupComponent,
    components,
  }),

  // lock: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
  //   type: 'lock',
  //   title: `锁定组件 ${component.name}`,
  //   componentId: component.id,
  //   oldValue: { lock: false },
  //   newValue: { lock: true },
  // }),

  // unlock: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
  //   type: 'unlock',
  //   title: `解锁组件 ${component.name}`,
  //   componentId: component.id,
  //   oldValue: { lock: true },
  //   newValue: { lock: false },
  // }),

  // visible: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
  //   type: 'visible',
  //   title: `显示组件 ${component.name}`,
  //   componentId: component.id,
  //   oldValue: { visible: false },
  //   newValue: { visible: true },
  // }),

  // hidden: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
  //   type: 'hidden',
  //   title: `隐藏组件 ${component.name}`,
  //   componentId: component.id,
  //   oldValue: { visible: true },
  //   newValue: { visible: false },
  // }),

  // layer: (component: ComponentSchema, action: 'top' | 'bottom' | 'up' | 'down', oldIndex: number, newIndex: number): Omit<HistoryRecord, 'id' | 'timestamp'> => {
  //   const actionMap = { top: '置顶', bottom: '置底', up: '上移', down: '下移' };
  //   return {
  //     type: 'layer',
  //     title: `${actionMap[action]}组件 ${component.name}`,
  //     componentId: component.id,
  //     oldValue: { index: oldIndex },
  //     newValue: { index: newIndex },
  //   };
  // },
};
