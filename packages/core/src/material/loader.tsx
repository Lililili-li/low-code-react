import { lazy, Suspense, ComponentType, memo } from 'react';
import { MaterialType } from './index';
import materialCmp from './index';

const componentCache = new Map<MaterialType, ComponentType<any>>();

const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * 获取组件 - 支持同步和异步两种模式
 * @param type 组件类型
 * @param enableLazy 是否启用懒加载（默认false，保持向后兼容）
 */
const getComponent = (type: MaterialType, enableLazy: boolean = false): ComponentType<any> => {
  // 如果不启用懒加载，直接返回同步组件
  if (!enableLazy) {
    const meta = materialCmp[type];
    if (!meta?.component) {
      console.warn(`Component type "${type}" not found in materialCmp`);
      return () => null;
    }
    return meta.component;
  }

  // 启用懒加载模式
  if (componentCache.has(type)) {
    return componentCache.get(type)!;
  }

  // 使用 lazy 包装组件
  const LazyComponent = lazy(async () => {
    const meta = materialCmp[type];
    if (!meta?.component) {
      throw new Error(`Component type "${type}" not found`);
    }
    return { default: meta.component };
  });

  componentCache.set(type, LazyComponent);
  return LazyComponent;
};

interface DynamicComponentLoaderProps {
  type: MaterialType;
  enableLazy?: boolean;
  [key: string]: any;
}

/**
 * 动态组件加载器
 * 支持同步和异步两种加载模式
 */
export const DynamicComponentLoader = function DynamicComponentLoader({
  type,
  enableLazy = false,
  ...props
}: DynamicComponentLoaderProps) {
  const Component = getComponent(type, enableLazy);

  if (!enableLazy) {
    return <Component {...props} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

DynamicComponentLoader.displayName = 'DynamicComponentLoader';

/**
 * 直接获取同步组件（向后兼容）
 */
export const getSyncComponent = (type: MaterialType): ComponentType<any> => {
  return getComponent(type, false);
};

/**
 * 获取懒加载组件
 */
export const getLazyComponent = (type: MaterialType): ComponentType<any> => {
  return getComponent(type, true);
};
