import {
  Plugin,
  PluginContext,
  PluginRegistry,
  MaterialDefinition,
  ActionDefinition,
  DatasourceConnector,
  ToolbarItemDefinition,
  PanelDefinition,
  MaterialCategory,
  PluginType,
} from './types';
import { createPluginContext } from './context';

export interface PluginManagerOptions {
  strictMode?: boolean;
  allowRemote?: boolean;
  sandbox?: boolean;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private registry: PluginRegistry;
  private context: PluginContext;
  private options: PluginManagerOptions;
  private loadedPlugins: Set<string> = new Set();

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      strictMode: false,
      allowRemote: false,
      sandbox: true,
      ...options,
    };

    // 初始化注册表
    this.registry = {
      materials: new Map(),
      actions: new Map(),
      datasources: new Map(),
      toolbarItems: new Map(),
      panels: new Map(),
      categories: new Map(),
    };

    // 创建插件上下文
    this.context = createPluginContext(this.registry);
  }

  // ==================== 插件注册 ====================

  async register(plugin: Plugin): Promise<void> {
    const { meta, type } = plugin;

    // 验证插件
    this.validatePlugin(plugin);

    // 检查是否已加载
    if (this.plugins.has(meta.id)) {
      if (this.options.strictMode) {
        throw new Error(`Plugin ${meta.id} is already registered`);
      }
      console.warn(`Plugin ${meta.id} is already registered, skipping`);
      return;
    }

    // 检查依赖
    if (meta.dependencies) {
      for (const depId of meta.dependencies) {
        if (!this.loadedPlugins.has(depId)) {
          throw new Error(
            `Plugin ${meta.id} depends on ${depId}, but it's not loaded`
          );
        }
      }
    }

    try {
      // 激活插件
      await plugin.activate(this.context);

      // 保存插件
      this.plugins.set(meta.id, plugin);
      this.loadedPlugins.add(meta.id);

      console.log(`[PluginManager] Plugin ${meta.id}@${meta.version} activated`);
    } catch (error) {
      console.error(`[PluginManager] Failed to activate plugin ${meta.id}:`, error);
      throw error;
    }
  }

  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} is not registered`);
      return;
    }

    // 检查是否有其他插件依赖此插件
    for (const [id, p] of this.plugins) {
      if (p.meta.dependencies?.includes(pluginId)) {
        throw new Error(
          `Cannot unregister ${pluginId}, plugin ${id} depends on it`
        );
      }
    }

    // 执行停用逻辑
    if (plugin.deactivate) {
      try {
        await plugin.deactivate();
      } catch (error) {
        console.error(`[PluginManager] Error deactivating plugin ${pluginId}:`, error);
      }
    }

    // 清理注册的资源
    this.cleanupPluginResources(plugin);

    // 移除插件
    this.plugins.delete(pluginId);
    this.loadedPlugins.delete(pluginId);

    console.log(`[PluginManager] Plugin ${pluginId} unregistered`);
  }

  // ==================== 批量操作 ====================

  async registerBatch(plugins: Plugin[]): Promise<void> {
    // 按依赖顺序排序
    const sortedPlugins = this.sortByDependencies(plugins);

    for (const plugin of sortedPlugins) {
      await this.register(plugin);
    }
  }

  async unregisterAll(): Promise<void> {
    // 按依赖反向顺序卸载
    const sortedIds = Array.from(this.plugins.keys()).reverse();

    for (const pluginId of sortedIds) {
      await this.unregister(pluginId);
    }
  }

  // ==================== 查询方法 ====================

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getPluginsByType(type: PluginType): Plugin[] {
    return this.getAllPlugins().filter((p) => p.type === type);
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  // ==================== 注册表访问 ====================

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  getMaterial(id: string): MaterialDefinition | undefined {
    return this.registry.materials.get(id);
  }

  getAllMaterials(): MaterialDefinition[] {
    return Array.from(this.registry.materials.values());
  }

  getMaterialsByCategory(categoryId: string): MaterialDefinition[] {
    return this.getAllMaterials().filter((m) => m.categoryId === categoryId);
  }

  getAction(id: string): ActionDefinition | undefined {
    return this.registry.actions.get(id);
  }

  getAllActions(): ActionDefinition[] {
    return Array.from(this.registry.actions.values());
  }

  getDatasource(id: string): DatasourceConnector | undefined {
    return this.registry.datasources.get(id);
  }

  getAllDatasources(): DatasourceConnector[] {
    return Array.from(this.registry.datasources.values());
  }

  getToolbarItems(): ToolbarItemDefinition[] {
    return Array.from(this.registry.toolbarItems.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  getPanel(id: string): PanelDefinition | undefined {
    return this.registry.panels.get(id);
  }

  getAllPanels(): PanelDefinition[] {
    return Array.from(this.registry.panels.values());
  }

  getCategory(id: string): MaterialCategory | undefined {
    return this.registry.categories.get(id);
  }

  getAllCategories(): MaterialCategory[] {
    return Array.from(this.registry.categories.values()).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }

  // ==================== 私有方法 ====================

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.meta) {
      throw new Error('Plugin meta is required');
    }

    if (!plugin.meta.id) {
      throw new Error('Plugin id is required');
    }

    if (!plugin.meta.name) {
      throw new Error('Plugin name is required');
    }

    if (!plugin.meta.version) {
      throw new Error('Plugin version is required');
    }

    if (!plugin.type) {
      throw new Error('Plugin type is required');
    }

    if (typeof plugin.activate !== 'function') {
      throw new Error('Plugin activate must be a function');
    }
  }

  private cleanupPluginResources(plugin: Plugin): void {
    const { type, meta } = plugin;

    // 根据插件类型清理对应的资源
    switch (type) {
      case 'material':
        // 清理物料组件
        for (const [id, material] of this.registry.materials) {
          // 这里假设可以通过某种方式关联插件和物料
          // 实际实现可能需要插件在注册时提供更多信息
        }
        break;

      case 'action':
        // 清理动作
        break;

      case 'datasource':
        // 清理数据源
        break;

      case 'toolbar':
        // 清理工具栏项
        break;

      case 'panel':
        // 清理面板
        break;
    }
  }

  private sortByDependencies(plugins: Plugin[]): Plugin[] {
    const sorted: Plugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: Plugin) => {
      if (visited.has(plugin.meta.id)) return;
      if (visiting.has(plugin.meta.id)) {
        throw new Error(
          `Circular dependency detected involving ${plugin.meta.id}`
        );
      }

      visiting.add(plugin.meta.id);

      if (plugin.meta.dependencies) {
        for (const depId of plugin.meta.dependencies) {
          const dep = plugins.find((p) => p.meta.id === depId);
          if (dep) {
            visit(dep);
          }
        }
      }

      visiting.delete(plugin.meta.id);
      visited.add(plugin.meta.id);
      sorted.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return sorted;
  }
}

// 单例实例
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager();
  }
  return globalPluginManager;
}

export function setPluginManager(manager: PluginManager): void {
  globalPluginManager = manager;
}

export function createPluginManager(options?: PluginManagerOptions): PluginManager {
  return new PluginManager(options);
}
