// ==================== 类型导出 ====================
export type {
  Plugin,
  PluginMeta,
  PluginType,
  PluginContext,
  PluginRegistry,
  PluginLoader,
  MaterialPlugin,
  ActionPlugin,
  DatasourcePlugin,
  ToolbarPlugin,
  PanelPlugin,
  MaterialDefinition,
  MaterialCategory,
  ActionDefinition,
  ActionContext,
  DatasourceConnector,
  ToolbarItemDefinition,
  ToolbarContext,
  PanelDefinition,
  PropsPanelProps,
  StoreAPI,
  EventBus,
  NotificationAPI,
  ModalAPI,
} from './types';

// ==================== 核心类导出 ====================
export {
  PluginManager,
  getPluginManager,
  setPluginManager,
  createPluginManager,
  type PluginManagerOptions,
} from './manager';

// ==================== 加载器导出 ====================
export {
  PluginLoaderManager,
  getPluginLoaderManager,
  LocalPluginLoader,
  URLPluginLoader,
  NPMPluginLoader,
} from './loader';

// ==================== 工具函数导出 ====================
export { createEventBus } from './utils/eventBus';
export {
  generateId,
  cloneDeep,
  debounce,
  throttle,
  isValidVersion,
  compareVersion,
} from './utils';

// ==================== 上下文导出 ====================
export { createPluginContext, registerCategory } from './context';

// ==================== 示例插件导出 ====================
export { default as MapPlugin } from './examples/map-plugin';
export { default as ModalActionPlugin } from './examples/modal-action-plugin';
