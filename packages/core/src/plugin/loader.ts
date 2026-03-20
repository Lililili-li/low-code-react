import { Plugin, PluginLoader } from './types';

// ==================== 本地插件加载器 ====================

export class LocalPluginLoader implements PluginLoader {
  canLoad(source: string): boolean {
    return source.startsWith('./') || source.startsWith('../') || source.startsWith('/');
  }

  async load(source: string): Promise<Plugin> {
    try {
      const module = await import(/* @vite-ignore */ source);
      const plugin = module.default || module;
      
      if (!this.isValidPlugin(plugin)) {
        throw new Error(`Invalid plugin exported from ${source}`);
      }
      
      return plugin;
    } catch (error) {
      console.error(`[LocalPluginLoader] Failed to load plugin from ${source}:`, error);
      throw error;
    }
  }

  private isValidPlugin(plugin: any): plugin is Plugin {
    return (
      plugin &&
      typeof plugin === 'object' &&
      plugin.meta &&
      typeof plugin.meta.id === 'string' &&
      typeof plugin.meta.name === 'string' &&
      typeof plugin.meta.version === 'string' &&
      typeof plugin.type === 'string' &&
      typeof plugin.activate === 'function'
    );
  }
}

// ==================== URL 插件加载器 ====================

export class URLPluginLoader implements PluginLoader {
  canLoad(source: string): boolean {
    return source.startsWith('http://') || source.startsWith('https://');
  }

  async load(source: string): Promise<Plugin> {
    try {
      // 获取插件代码
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.statusText}`);
      }

      const code = await response.text();
      
      // 在沙箱中执行代码
      const plugin = this.executeInSandbox(code, source);
      
      if (!this.isValidPlugin(plugin)) {
        throw new Error(`Invalid plugin loaded from ${source}`);
      }
      
      return plugin;
    } catch (error) {
      console.error(`[URLPluginLoader] Failed to load plugin from ${source}:`, error);
      throw error;
    }
  }

  private executeInSandbox(code: string, source: string): any {
    // 创建一个安全的沙箱环境
    const sandbox = {
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Date,
      Math,
      JSON,
      RegExp,
      Error,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Symbol,
      Proxy,
      Reflect,
    };

    // 构建函数
    const fn = new Function(
      'sandbox',
      `
        with (sandbox) {
          ${code}
          return typeof exports !== 'undefined' ? exports.default || exports : 
                 typeof module !== 'undefined' ? module.exports : 
                 typeof plugin !== 'undefined' ? plugin : null;
        }
      `
    );

    return fn(sandbox);
  }

  private isValidPlugin(plugin: any): plugin is Plugin {
    return (
      plugin &&
      typeof plugin === 'object' &&
      plugin.meta &&
      typeof plugin.meta.id === 'string' &&
      typeof plugin.meta.name === 'string' &&
      typeof plugin.meta.version === 'string' &&
      typeof plugin.type === 'string' &&
      typeof plugin.activate === 'function'
    );
  }
}

// ==================== NPM 插件加载器 ====================

export class NPMPluginLoader implements PluginLoader {
  private registry: string;

  constructor(registry: string = 'https://registry.npmjs.org') {
    this.registry = registry;
  }

  canLoad(source: string): boolean {
    // 支持 npm:package-name 或纯包名格式
    return !source.includes('/') || source.startsWith('npm:');
  }

  async load(source: string): Promise<Plugin> {
    const packageName = source.startsWith('npm:') ? source.slice(4) : source;
    
    try {
      // 从 unpkg 或 jsdelivr 加载
      const cdnUrls = [
        `https://unpkg.com/${packageName}`,
        `https://cdn.jsdelivr.net/npm/${packageName}`,
      ];

      for (const url of cdnUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const code = await response.text();
            const plugin = this.executeInSandbox(code, url);
            
            if (this.isValidPlugin(plugin)) {
              return plugin;
            }
          }
        } catch (e) {
          console.warn(`Failed to load from ${url}, trying next...`);
        }
      }

      throw new Error(`Failed to load plugin ${packageName} from any CDN`);
    } catch (error) {
      console.error(`[NPMPluginLoader] Failed to load plugin ${packageName}:`, error);
      throw error;
    }
  }

  private executeInSandbox(code: string, source: string): any {
    const sandbox = {
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Date,
      Math,
      JSON,
      RegExp,
      Error,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Symbol,
    };

    const fn = new Function(
      'sandbox',
      `
        with (sandbox) {
          ${code}
          return typeof exports !== 'undefined' ? exports.default || exports : 
                 typeof module !== 'undefined' ? module.exports : null;
        }
      `
    );

    return fn(sandbox);
  }

  private isValidPlugin(plugin: any): plugin is Plugin {
    return (
      plugin &&
      typeof plugin === 'object' &&
      plugin.meta &&
      typeof plugin.meta.id === 'string' &&
      typeof plugin.meta.name === 'string' &&
      typeof plugin.meta.version === 'string' &&
      typeof plugin.type === 'string' &&
      typeof plugin.activate === 'function'
    );
  }
}

// ==================== 插件加载器管理器 ====================

export class PluginLoaderManager {
  private loaders: PluginLoader[] = [];

  constructor() {
    // 注册默认加载器
    this.register(new LocalPluginLoader());
    this.register(new URLPluginLoader());
    this.register(new NPMPluginLoader());
  }

  register(loader: PluginLoader): void {
    this.loaders.push(loader);
  }

  async load(source: string): Promise<Plugin> {
    const loader = this.loaders.find((l) => l.canLoad(source));
    
    if (!loader) {
      throw new Error(`No loader available for source: ${source}`);
    }

    return loader.load(source);
  }

  canLoad(source: string): boolean {
    return this.loaders.some((l) => l.canLoad(source));
  }
}

// 单例实例
let globalLoaderManager: PluginLoaderManager | null = null;

export function getPluginLoaderManager(): PluginLoaderManager {
  if (!globalLoaderManager) {
    globalLoaderManager = new PluginLoaderManager();
  }
  return globalLoaderManager;
}
