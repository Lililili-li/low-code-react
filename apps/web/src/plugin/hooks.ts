import { useEffect, useState, useCallback } from 'react';
import {
  Plugin,
  MaterialDefinition,
  ActionDefinition,
  DatasourceConnector,
  MaterialCategory,
} from '@repo/core/plugin';
import { pluginManager } from './setup';

// ==================== 插件管理 Hooks ====================

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    setPlugins(pluginManager.getAllPlugins());

    // 监听插件变化
    const handlePluginChange = () => {
      setPlugins(pluginManager.getAllPlugins());
    };

    // 实际应该通过 eventBus 监听
    // pluginManager.getRegistry().eventBus.on('plugin:changed', handlePluginChange);

    return () => {
      // pluginManager.getRegistry().eventBus.off('plugin:changed', handlePluginChange);
    };
  }, []);

  return plugins;
}

export function usePlugin(pluginId: string) {
  const [plugin, setPlugin] = useState<Plugin | undefined>();

  useEffect(() => {
    setPlugin(pluginManager.getPlugin(pluginId));
  }, [pluginId]);

  return plugin;
}

// ==================== 物料组件 Hooks ====================

export function useMaterials() {
  const [materials, setMaterials] = useState<MaterialDefinition[]>([]);

  useEffect(() => {
    setMaterials(pluginManager.getAllMaterials());
  }, []);

  return materials;
}

export function useMaterialsByCategory(categoryId: string) {
  const [materials, setMaterials] = useState<MaterialDefinition[]>([]);

  useEffect(() => {
    setMaterials(pluginManager.getMaterialsByCategory(categoryId));
  }, [categoryId]);

  return materials;
}

export function useMaterial(materialId: string) {
  const [material, setMaterial] = useState<MaterialDefinition | undefined>();

  useEffect(() => {
    setMaterial(pluginManager.getMaterial(materialId));
  }, [materialId]);

  return material;
}

export function useMaterialCategories() {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);

  useEffect(() => {
    setCategories(pluginManager.getAllCategories());
  }, []);

  return categories;
}

// ==================== 动作 Hooks ====================

export function useActions() {
  const [actions, setActions] = useState<ActionDefinition[]>([]);

  useEffect(() => {
    setActions(pluginManager.getAllActions());
  }, []);

  return actions;
}

export function useAction(actionId: string) {
  const [action, setAction] = useState<ActionDefinition | undefined>();

  useEffect(() => {
    setAction(pluginManager.getAction(actionId));
  }, [actionId]);

  return action;
}

// ==================== 数据源 Hooks ====================

export function useDatasources() {
  const [datasources, setDatasources] = useState<DatasourceConnector[]>([]);

  useEffect(() => {
    setDatasources(pluginManager.getAllDatasources());
  }, []);

  return datasources;
}

export function useDatasource(datasourceId: string) {
  const [datasource, setDatasource] = useState<DatasourceConnector | undefined>();

  useEffect(() => {
    setDatasource(pluginManager.getDatasource(datasourceId));
  }, [datasourceId]);

  return datasource;
}

// ==================== 插件安装/卸载 Hooks ====================

export function usePluginInstaller() {
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const install = useCallback(async (source: string) => {
    setInstalling(true);
    setError(null);

    try {
      const { installPlugin } = await import('./setup');
      await installPlugin(source);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setInstalling(false);
    }
  }, []);

  return { install, installing, error };
}

export function usePluginUninstaller() {
  const [uninstalling, setUninstalling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uninstall = useCallback(async (pluginId: string) => {
    setUninstalling(true);
    setError(null);

    try {
      const { uninstallPlugin } = await import('./setup');
      await uninstallPlugin(pluginId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setUninstalling(false);
    }
  }, []);

  return { uninstall, uninstalling, error };
}
