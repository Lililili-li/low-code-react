import { PluginContext, PluginRegistry, MaterialCategory } from './types';
import { createEventBus } from './utils/eventBus';
import { generateId, cloneDeep, debounce, throttle } from './utils';

// 这里需要导入实际的 store，暂时用 any 占位
// 实际实现时应该从应用中传入
export function createPluginContext(registry: PluginRegistry): PluginContext {
  const eventBus = createEventBus();

  // 模拟 store API，实际应该从外部传入
  const storeAPI = {
    useDesignStore: () => ({}),
    useComponentsStore: () => ({}),
    useStateStore: () => ({}),
    useDatasourceStore: () => ({}),
    useHistoryStore: () => ({}),
  };

  return {
    // 基础能力
    store: storeAPI,
    eventBus,

    // 通知
    notify: {
      success: (message: string) => {
        console.log('[Plugin:Success]', message);
        // 实际实现应该调用应用的通知系统
        // toast.success(message);
      },
      error: (message: string) => {
        console.error('[Plugin:Error]', message);
        // toast.error(message);
      },
      warning: (message: string) => {
        console.warn('[Plugin:Warning]', message);
        // toast.warning(message);
      },
      info: (message: string) => {
        console.info('[Plugin:Info]', message);
        // toast.info(message);
      },
    },

    // 弹窗
    modal: {
      confirm: async (options) => {
        console.log('[Plugin:Confirm]', options);
        // 实际实现应该调用应用的弹窗系统
        return window.confirm(options.title || 'Confirm?');
      },
      open: (component, props) => {
        console.log('[Plugin:Modal Open]', component, props);
        // 实际实现应该打开弹窗
      },
      close: (id) => {
        console.log('[Plugin:Modal Close]', id);
        // 实际实现应该关闭弹窗
      },
    },

    // 国际化
    i18n: {
      t: (key: string, defaultValue?: string) => {
        // 实际实现应该从应用的 i18n 系统中获取
        return defaultValue || key;
      },
      register: (lang: string, translations: Record<string, string>) => {
        console.log('[Plugin:I18n Register]', lang, translations);
        // 实际实现应该注册到应用的 i18n 系统
      },
    },

    // 注册方法
    registerMaterial: (component) => {
      if (registry.materials.has(component.id)) {
        console.warn(`Material ${component.id} is already registered`);
        return;
      }
      registry.materials.set(component.id, component);
      console.log(`[PluginContext] Material registered: ${component.id}`);

      // 触发事件
      eventBus.emit('material:registered', component);
    },

    registerAction: (action) => {
      if (registry.actions.has(action.id)) {
        console.warn(`Action ${action.id} is already registered`);
        return;
      }
      registry.actions.set(action.id, action);
      console.log(`[PluginContext] Action registered: ${action.id}`);

      eventBus.emit('action:registered', action);
    },

    registerDatasource: (connector) => {
      if (registry.datasources.has(connector.id)) {
        console.warn(`Datasource ${connector.id} is already registered`);
        return;
      }
      registry.datasources.set(connector.id, connector);
      console.log(`[PluginContext] Datasource registered: ${connector.id}`);

      eventBus.emit('datasource:registered', connector);
    },

    registerToolbarItem: (item) => {
      if (registry.toolbarItems.has(item.id)) {
        console.warn(`Toolbar item ${item.id} is already registered`);
        return;
      }
      registry.toolbarItems.set(item.id, item);
      console.log(`[PluginContext] Toolbar item registered: ${item.id}`);

      eventBus.emit('toolbar:registered', item);
    },

    registerPanel: (panel) => {
      if (registry.panels.has(panel.id)) {
        console.warn(`Panel ${panel.id} is already registered`);
        return;
      }
      registry.panels.set(panel.id, panel);
      console.log(`[PluginContext] Panel registered: ${panel.id}`);

      eventBus.emit('panel:registered', panel);
    },

    // 工具方法
    utils: {
      generateId,
      cloneDeep,
      debounce,
      throttle,
    },
  };
}

// 注册分类的辅助函数
export function registerCategory(
  registry: PluginRegistry,
  category: MaterialCategory
): void {
  if (registry.categories.has(category.id)) {
    console.warn(`Category ${category.id} is already registered`);
    return;
  }
  registry.categories.set(category.id, category);
  console.log(`[PluginContext] Category registered: ${category.id}`);
}
