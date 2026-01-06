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
  | 'lockMultiple'     // 锁定组件
  | 'unlock'   // 解锁组件
  | 'unlockMultiple'   // 解锁组件
  | 'visible'  // 显示组件
  | 'visibleMultiple'  // 显示组件
  | 'hidden'   // 隐藏组件
  | 'hiddenMultiple'   // 隐藏组件
  | 'layer'   // 图层操作
  | 'transform' //旋转
  | 'size' // 尺寸

export interface PositionProps { left: number, top: number, id?: string }
export interface SizeProps { width: number, height: number }

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
  oldSize?: SizeProps
  newSize?: SizeProps
  oldPositions?: PositionProps[]
  newPositions?: PositionProps[]
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
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

// 清理选中状态的辅助函数
const clearSelectionIfNeeded = (
  componentId: string | undefined,
  setCurrentCmpId: (id: string) => void,
  setSelectedCmpIds: (ids: string[]) => void,
  currentCmpId: string,
  selectedCmpIds: string[]
) => {
  if (componentId && currentCmpId === componentId) {
    setCurrentCmpId('')
  }
  if (componentId && selectedCmpIds.length === 1 && selectedCmpIds[0] === componentId) {
    setSelectedCmpIds([])
  }
}

// 更新组件属性的辅助函数
const updateComponentProperty = (
  components: ComponentSchema[],
  updateCurrentCmp: (cmp: ComponentSchema) => void,
  property: 'lock' | 'visible',
  value: boolean
) => {
  components.forEach(cmp => {
    updateCurrentCmp({
      ...cmp,
      [property]: value
    })
  })
}

// 更新组件位置的辅助函数
const updateComponentPosition = (
  component: ComponentSchema | undefined,
  position: PositionProps | undefined,
  updateCurrentCmp: (cmp: ComponentSchema) => void
) => {
  if (!component || !position) return
  updateCurrentCmp({
    ...component,
    style: {
      ...component.style,
      left: position.left,
      top: position.top
    }
  })
}

// 更新组件尺寸的辅助函数
const updateComponentSize = (
  component: ComponentSchema | undefined,
  size: SizeProps | undefined,
  updateCurrentCmp: (cmp: ComponentSchema) => void
) => {
  if (!component || !size) return
  updateCurrentCmp({
    ...component,
    style: {
      ...component.style,
      width: size.width,
      height: size.height
    }
  })
}

const handleComponentOpt = (actionType: HistoryActionType, record: HistoryRecord, type: 'undo' | 'redo') => {
  const { addComponent, removeComponent, updateCurrentCmp, setCurrentCmpId, currentCmpId, setSelectedCmpIds, selectedCmpIds, pageSchema } = useDesignStore.getState()

  const isUndo = type === 'undo'

  switch (actionType) {
    case 'add':
      if (isUndo) {
        if (record.componentId) {
          removeComponent(record.componentId)
          clearSelectionIfNeeded(record.componentId, setCurrentCmpId, setSelectedCmpIds, currentCmpId, selectedCmpIds)
        }
      } else {
        if (record.component) {
          addComponent(record.component)
        }
      }
      break

    case 'addMultiple':
      if (isUndo) {
        record.components?.forEach(item => {
          removeComponent(item.id)
        })
      } else {
        record.components?.forEach(item => {
          addComponent(item)
        })
        clearSelectionIfNeeded(record.componentId, setCurrentCmpId, setSelectedCmpIds, currentCmpId, selectedCmpIds)
      }
      break

    case 'delete':
      if (isUndo) {
        if (record.component) {
          addComponent(record.component)
        }
        if (!currentCmpId) {
          setSelectedCmpIds([])
        }
      } else {
        if (record.componentId) {
          removeComponent(record.componentId)
          clearSelectionIfNeeded(record.componentId, setCurrentCmpId, setSelectedCmpIds, currentCmpId, selectedCmpIds)
        }
      }
      break

    case 'deleteMultiple':
      if (isUndo) {
        record.components?.forEach(item => {
          addComponent(item)
        })
      } else {
        record.components?.forEach(item => {
          removeComponent(item.id)
        })
        clearSelectionIfNeeded(record.componentId, setCurrentCmpId, setSelectedCmpIds, currentCmpId, selectedCmpIds)
      }
      break

    case 'move':
      if (record.componentId) {
        const currentCmp = pageSchema.components.find(item => item.id === record.componentId)
        const position = isUndo ? record.oldPosition : record.newPosition
        updateComponentPosition(currentCmp, position, updateCurrentCmp)
      }
      break

    case 'moveMultiple':
      record.components?.forEach(item => {
        const positions = isUndo ? record.oldPositions : record.newPositions
        const position = positions?.find(p => p.id === item.id)
        updateComponentPosition(item, position, updateCurrentCmp)
      })
      break

    case 'lock':
      if (record.component) {
        updateComponentProperty([record.component], updateCurrentCmp, 'lock', !isUndo)
      }
      break

    case 'lockMultiple':
      if (record.components) {
        updateComponentProperty(record.components, updateCurrentCmp, 'lock', !isUndo)
      }
      break

    case 'unlock':
      if (record.component) {
        updateComponentProperty([record.component], updateCurrentCmp, 'lock', isUndo)
      }
      break

    case 'unlockMultiple':
      if (record.components) {
        updateComponentProperty(record.components, updateCurrentCmp, 'lock', isUndo)
      }
      break

    // TODO 涉及到变量暂不操作
    // case 'visible':
    //   if (record.component) {
    //     updateComponentProperty([record.component], updateCurrentCmp, 'visible', !isUndo)
    //   }
    //   break

    // case 'visibleMultiple':
    //   if (record.components) {
    //     updateComponentProperty(record.components, updateCurrentCmp, 'visible', !isUndo)
    //   }
    //   break

    // case 'hidden':
    //   if (record.component) {
    //     updateComponentProperty([record.component], updateCurrentCmp, 'visible', isUndo)
    //   }
    //   break

    // case 'hiddenMultiple':
    //   if (record.components) {
    //     updateComponentProperty(record.components, updateCurrentCmp, 'visible', isUndo)
    //   }
    //   break

    case 'group':
      if (isUndo) {
        removeComponent(record.component?.id!)
        record.components?.forEach(item => {
          addComponent(item)
        })
      } else {
        record.components?.forEach(item => {
          removeComponent(item.id!)
        })
        addComponent(record.component!)
      }
      break
    case 'split':
      if (isUndo) {
        addComponent(record.component!)
        record.components?.forEach(item => {
          removeComponent(item.id!)
        })
        setSelectedCmpIds([])
      } else {
        removeComponent(record.component?.id!)
        record.components?.forEach(item => {
          addComponent({ ...item, style: { ...item.style, left: (record.component?.style?.left as number) + (item.style?.left as number), top: (record.component?.style?.top as number) + (item.style?.top as number) } })
        })
        setCurrentCmpId('')
        setSelectedCmpIds(record.components?.map(item => item.id)!)
      }
      break

    case 'size':
      if (record.componentId) {
        const currentCmp = pageSchema.components.find(item => item.id === record.componentId)
        const size = isUndo ? record.oldSize : record.newSize
        updateComponentSize(currentCmp, size, updateCurrentCmp)
      }
      break
    default:
      break
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
  group: (components: ComponentSchema[], groupComponent: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'group',
    title: `组合-${components.map(c => c.name).join(',')}`,
    componentIds: components.map(c => c.id),
    component: groupComponent,
    components
  }),

  split: (groupComponent: ComponentSchema, components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'split',
    title: `拆分-${components.map(c => c.name).join(',')}`,
    componentId: groupComponent.id,
    component: groupComponent,
    components,
  }),

  lock: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'lock',
    title: `锁定-${component.name}`,
    componentId: component.id,
    component,
  }),
  lockMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'lockMultiple',
    title: `锁定-${components.map(item => item.name).join(',')}`,
    componentIds: components.map(item => item.id),
    components,
  }),

  unlock: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'unlock',
    title: `解锁-${component.name}`,
    componentId: component.id,
    component,
  }),
  unlockMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'unlockMultiple',
    title: `解锁-${components.map(item => item.name).join(',')}`,
    componentIds: components.map(item => item.id),
    components,
  }),

  visible: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'visible',
    title: `显示-${component.name}`,
    componentId: component.id,
    component
  }),
  visibleMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'visibleMultiple',
    title: `显示-${components.map(item => item.name).join(',')}`,
    componentIds: components.map(item => item.id),
    components,
  }),

  hidden: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'hidden',
    title: `隐藏-${component.name}`,
    componentId: component.id,
    component
  }),
  hiddenMultiple: (components: ComponentSchema[]): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'hiddenMultiple',
    title: `隐藏-${components.map(item => item.name).join(',')}`,
    componentIds: components.map(item => item.id),
    components,
  }),

  transform: (component: ComponentSchema): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'transform',
    title: `旋转-${component.name}`,
    componentId: component.id,
    component
  }),
  size: (component: ComponentSchema, oldSize: SizeProps, newSize: SizeProps): Omit<HistoryRecord, 'id' | 'timestamp'> => ({
    type: 'size',
    title: `尺寸-${component.name}`,
    componentId: component.id,
    oldSize,
    newSize,
  }),

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
