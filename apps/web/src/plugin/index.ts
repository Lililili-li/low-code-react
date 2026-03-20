// ==================== 插件系统初始化 ====================
export {
  pluginManager,
  initPlugins,
  installPlugin,
  uninstallPlugin,
  getAllMaterials,
  getAllActions,
  getAllDatasources,
} from './setup';

// ==================== Hooks ====================
export {
  usePlugins,
  usePlugin,
  useMaterials,
  useMaterialsByCategory,
  useMaterial,
  useMaterialCategories,
  useActions,
  useAction,
  useDatasources,
  useDatasource,
  usePluginInstaller,
  usePluginUninstaller,
} from './hooks';
