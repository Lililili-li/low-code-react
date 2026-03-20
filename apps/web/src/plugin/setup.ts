import {
  PluginManager,
  createPluginManager,
  getPluginLoaderManager,
  MapPlugin,
  ModalActionPlugin,
} from '@repo/core/plugin';

// 创建插件管理器实例
export const pluginManager = createPluginManager({
  strictMode: true,
  allowRemote: true,
  sandbox: true,
});

// 内置插件列表
const builtInPlugins = [
  MapPlugin,
  ModalActionPlugin,
  // 可以添加更多内置插件
];

// 初始化插件系统
export async function initPlugins(): Promise<void> {
  console.log('[Plugin Setup] Initializing plugin system...');

  try {
    // 注册内置插件
    for (const plugin of builtInPlugins) {
      await pluginManager.register(plugin);
    }

    console.log('[Plugin Setup] Built-in plugins registered:', builtInPlugins.length);

    // 从本地存储加载用户安装的插件
    await loadUserPlugins();

    // 从配置加载远程插件
    await loadRemotePlugins();

    console.log('[Plugin Setup] Plugin system initialized successfully');
  } catch (error) {
    console.error('[Plugin Setup] Failed to initialize plugins:', error);
    throw error;
  }
}

// 加载用户插件
async function loadUserPlugins(): Promise<void> {
  const userPlugins = localStorage.getItem('userPlugins');
  if (!userPlugins) return;

  try {
    const plugins = JSON.parse(userPlugins) as string[];
    const loader = getPluginLoaderManager();

    for (const source of plugins) {
      try {
        const plugin = await loader.load(source);
        await pluginManager.register(plugin);
        console.log(`[Plugin Setup] User plugin loaded: ${plugin.meta.id}`);
      } catch (error) {
        console.error(`[Plugin Setup] Failed to load user plugin ${source}:`, error);
      }
    }
  } catch (error) {
    console.error('[Plugin Setup] Failed to parse user plugins:', error);
  }
}

// 加载远程插件
async function loadRemotePlugins(): Promise<void> {
  // 从应用配置中读取
  const remotePlugins = window.__APP_CONFIG__?.plugins || [];

  for (const config of remotePlugins) {
    try {
      if (config.enabled !== false) {
        const loader = getPluginLoaderManager();
        const plugin = await loader.load(config.source);
        await pluginManager.register(plugin);
        console.log(`[Plugin Setup] Remote plugin loaded: ${plugin.meta.id}`);
      }
    } catch (error) {
      console.error(`[Plugin Setup] Failed to load remote plugin ${config.source}:`, error);
    }
  }
}

// 动态安装插件
export async function installPlugin(source: string): Promise<void> {
  const loader = getPluginLoaderManager();
  const plugin = await loader.load(source);

  await pluginManager.register(plugin);

  // 保存到用户插件列表
  const userPlugins = JSON.parse(localStorage.getItem('userPlugins') || '[]');
  if (!userPlugins.includes(source)) {
    userPlugins.push(source);
    localStorage.setItem('userPlugins', JSON.stringify(userPlugins));
  }

  console.log(`[Plugin Setup] Plugin installed: ${plugin.meta.id}`);
}

// 卸载插件
export async function uninstallPlugin(pluginId: string): Promise<void> {
  await pluginManager.unregister(pluginId);

  // 从用户插件列表移除
  const userPlugins = JSON.parse(localStorage.getItem('userPlugins') || '[]');
  const index = userPlugins.indexOf(pluginId);
  if (index > -1) {
    userPlugins.splice(index, 1);
    localStorage.setItem('userPlugins', JSON.stringify(userPlugins));
  }

  console.log(`[Plugin Setup] Plugin uninstalled: ${pluginId}`);
}

// 获取所有物料组件
export function getAllMaterials() {
  return pluginManager.getAllMaterials();
}

// 获取所有动作
export function getAllActions() {
  return pluginManager.getAllActions();
}

// 获取所有数据源连接器
export function getAllDatasources() {
  return pluginManager.getAllDatasources();
}

// 声明全局配置类型
declare global {
  interface Window {
    __APP_CONFIG__?: {
      plugins?: Array<{
        source: string;
        enabled?: boolean;
        config?: Record<string, any>;
      }>;
    };
  }
}
