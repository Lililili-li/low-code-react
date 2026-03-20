import { ComponentType, ReactNode } from 'react';
import { ComponentSchema, EventSchema, ActionSchema, DatasourceSchema } from '../types';

// ==================== 基础类型 ====================

export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  icon?: string;
  dependencies?: string[];
  keywords?: string[];
}

export type PluginType = 
  | 'material'      // 物料组件
  | 'action'        // 事件动作
  | 'datasource'    // 数据源
  | 'toolbar'       // 工具栏
  | 'panel'         // 面板
  | 'theme'         // 主题
  | 'i18n'          // 国际化
  | 'custom';       // 自定义

export interface Plugin {
  meta: PluginMeta;
  type: PluginType;
  
  activate: (context: PluginContext) => void | Promise<void>;
  deactivate?: () => void | Promise<void>;
}

// 具体插件类型接口
export interface MaterialPlugin extends Plugin {
  type: 'material';
}

export interface ActionPlugin extends Plugin {
  type: 'action';
}

export interface DatasourcePlugin extends Plugin {
  type: 'datasource';
}

export interface ToolbarPlugin extends Plugin {
  type: 'toolbar';
}

export interface PanelPlugin extends Plugin {
  type: 'panel';
}

// ==================== 插件上下文 ====================

export interface StoreAPI {
  useDesignStore: () => any;
  useComponentsStore: () => any;
  useStateStore: () => any;
  useDatasourceStore: () => any;
  useHistoryStore: () => any;
}

export interface EventBus {
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}

export interface NotificationAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export interface ModalAPI {
  confirm: (options: {
    title?: string;
    content?: ReactNode;
    onOk?: () => void | Promise<void>;
    onCancel?: () => void;
  }) => Promise<boolean>;
  open: (component: ComponentType<any>, props?: any) => void;
  close: (id?: string) => void;
}

export interface PluginContext {
  // 基础能力
  store: StoreAPI;
  eventBus: EventBus;
  notify: NotificationAPI;
  modal: ModalAPI;
  
  // 国际化
  i18n: {
    t: (key: string, defaultValue?: string) => string;
    register: (lang: string, translations: Record<string, string>) => void;
  };
  
  // 注册方法
  registerMaterial: (component: MaterialDefinition) => void;
  registerAction: (action: ActionDefinition) => void;
  registerDatasource: (connector: DatasourceConnector) => void;
  registerToolbarItem: (item: ToolbarItemDefinition) => void;
  registerPanel: (panel: PanelDefinition) => void;
  
  // 工具方法
  utils: {
    generateId: () => string;
    cloneDeep: <T>(obj: T) => T;
    debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => (...args: Parameters<T>) => void;
    throttle: <T extends (...args: any[]) => any>(fn: T, limit: number) => (...args: Parameters<T>) => void;
  };
}

// ==================== 物料组件插件 ====================

export interface MaterialCategory {
  id: string;
  name: string;
  icon?: string;
  order?: number;
}

export interface MaterialDefinition {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  cover?: string;
  
  // 组件实现
  component: ComponentType<any>;
  
  // 属性配置面板
  propsPanel: ComponentType<PropsPanelProps>;
  
  // Schema 定义
  schema: Partial<ComponentSchema>;
  
  // 默认属性
  defaultProps: Record<string, any>;
  
  // 预览组件（可选）
  preview?: ComponentType<any>;
  
  // 是否支持拖拽调整大小
  resizable?: boolean;
  
  // 默认大小
  defaultSize?: {
    width: number;
    height: number;
  };
}

export interface PropsPanelProps {
  component: ComponentSchema;
  onChange: (props: Partial<ComponentSchema>) => void;
}

// ==================== 事件动作插件 ====================

export interface ActionContext {
  component: ComponentSchema;
  event: EventSchema;
  state: Record<string, any>;
  setState: (key: string, value: any) => void;
  navigate: (pageId: string, params?: Record<string, any>) => void;
  fetch: (datasourceId: string) => Promise<any>;
  notify: NotificationAPI;
}

export interface ActionDefinition {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  
  // 配置面板
  configPanel: ComponentType<{
    value: any;
    onChange: (value: any) => void;
  }>;
  
  // 执行逻辑
  execute: (context: ActionContext, config: any) => void | Promise<void>;
  
  // 验证配置
  validate?: (config: any) => { valid: boolean; message?: string };
  
  // 默认配置
  defaultConfig?: any;
}

// ==================== 数据源插件 ====================

export interface DatasourceConnector {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  
  // 配置面板
  configPanel: ComponentType<{
    value: Partial<DatasourceSchema>;
    onChange: (value: Partial<DatasourceSchema>) => void;
  }>;
  
  // 测试连接
  test: (config: DatasourceSchema) => Promise<{ success: boolean; message?: string }>;
  
  // 执行查询
  query: (config: DatasourceSchema, params?: Record<string, any>) => Promise<any>;
  
  // 获取数据结构（用于字段映射）
  getSchema?: (config: DatasourceSchema) => Promise<Array<{ name: string; type: string }>>;
}

// ==================== 工具栏插件 ====================

export interface ToolbarContext {
  mode: 'design' | 'preview';
  selectedIds: string[];
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface ToolbarItemDefinition {
  id: string;
  position: 'left' | 'center' | 'right';
  priority: number;
  
  // 渲染
  render: ComponentType<ToolbarContext>;
  
  // 快捷键
  shortcut?: string;
  
  // 可见性条件
  visible?: (context: ToolbarContext) => boolean;
  
  // 是否启用
  enabled?: (context: ToolbarContext) => boolean;
}

// ==================== 面板插件 ====================

export interface PanelDefinition {
  id: string;
  name: string;
  icon?: string;
  position: 'left' | 'right' | 'bottom' | 'floating';
  
  // 面板组件
  component: ComponentType<any>;
  
  // 默认宽度/高度
  defaultSize?: {
    width?: number;
    height?: number;
  };
  
  // 是否可关闭
  closable?: boolean;
  
  // 默认是否打开
  defaultOpen?: boolean;
}

// ==================== 主题插件 ====================

export interface ThemeDefinition {
  id: string;
  name: string;
  variables: Record<string, string>;
  componentStyles?: Record<string, CSSStyleSheet | string>;
}

// ==================== 国际化插件 ====================

export interface I18nDefinition {
  lang: string;
  name: string;
  translations: Record<string, string>;
}

// ==================== 插件加载器 ====================

export interface PluginLoader {
  load: (source: string) => Promise<Plugin>;
  canLoad: (source: string) => boolean;
}

export interface PluginRegistry {
  materials: Map<string, MaterialDefinition>;
  actions: Map<string, ActionDefinition>;
  datasources: Map<string, DatasourceConnector>;
  toolbarItems: Map<string, ToolbarItemDefinition>;
  panels: Map<string, PanelDefinition>;
  categories: Map<string, MaterialCategory>;
}
