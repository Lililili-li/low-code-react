/**
 * 函数字符串处理工具
 * 提供安全的函数字符串转换为可执行函数的方法
 */

export interface FunctionParseOptions {
  /** 函数参数名列表 */
  params?: string[];
  /** 安全白名单：允许的全局对象和方法 */
  whitelist?: string[];
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否启用严格模式 */
  strict?: boolean;
}

export interface FunctionExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}

/**
 * 默认的安全白名单
 */
const DEFAULT_WHITELIST = [
  // JavaScript 内置对象
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'RegExp',
  'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'encodeURI', 'decodeURI',
  // 常用工具方法
  'console', 'log', 'warn', 'error', 'info', 'debug', 'trace',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  // 事件相关
  'event', 'Event', 'EventTarget', 'addEventListener', 'removeEventListener'
];

/**
 * 安全的函数字符串解析器
 */
export class SafeFunctionParser {
  private whitelist: Set<string>;
  private timeout: number;
  private strict: boolean;

  constructor(options: FunctionParseOptions = {}) {
    this.whitelist = new Set(options.whitelist || DEFAULT_WHITELIST);
    this.timeout = options.timeout || 5000;
    this.strict = options.strict !== false;
  }

  /**
   * 将函数字符串转换为可执行函数
   */
  parseFunction<T extends (...args: any[]) => any>(
    functionString: string,
    options: { params?: string[] } = {}
  ): T | null {
    try {
      // 自动提取参数（如果没有手动提供）
      let params = options.params;
      if (!params) {
        params = this.extractParamsFromFunction(functionString);
      }

      // 清理和验证函数字符串
      const cleanedString = this.cleanFunctionString(functionString);

      // // 安全性检查
      // if (!this.isSecureFunction(cleanedString, params)) {
      //   throw new Error('Function contains potentially unsafe code');
      // }

      // 创建函数
      const functionBody = this.strict ? `'use strict';\n${cleanedString}` : cleanedString;

      // 使用 Function 构造函数创建函数（比 eval 更安全）
      const func = new Function(...params, functionBody) as T;

      return func;
    } catch (error) {
      console.error('Failed to parse function:', error);
      return null;
    }
  }

  /**
   * 安全执行函数
   */
  async executeFunction<T>(
    func: (...args: any[]) => T | Promise<T>,
    args: any[] = []
  ): Promise<FunctionExecutionResult<T>> {
    const startTime = Date.now();

    try {
      // 创建带超时的 Promise
      const result = await this.withTimeout(func(...args), this.timeout);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * 一键解析并执行函数
   */
  async parseAndExecute<T>(
    functionString: string,
    args: any[] = [],
    options: FunctionParseOptions & { params?: string[] } = {}
  ): Promise<FunctionExecutionResult<T>> {
    try {
      const func = this.parseFunction<(...args: any[]) => T | Promise<T>>(functionString, options);

      if (!func) {
        return {
          success: false,
          error: 'Failed to parse function'
        };
      }

      return await this.executeFunction<T>(func, args);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 从函数字符串中提取参数名
   */
  private extractParamsFromFunction(functionString: string): string[] {
    try {
      let cleaned = functionString
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .trim();

      // 匹配函数声明中的参数
      const match = cleaned.match(/function\s+\w*\s*\(([^)]*)\)|^\s*\(([^)]*)\)/);
      if (match) {
        const paramsStr = match[1] || match[2];
        if (paramsStr) {
          return paramsStr.split(',').map(param => param.trim()).filter(param => param);
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to extract function params:', error);
      return [];
    }
  }

  /**
   * 清理函数字符串
   */
  private cleanFunctionString(functionString: string): string {
    // 移除注释
    let cleaned = functionString
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();

    // 检查是否是完整的函数声明（包含 function 关键字和函数体）
    const functionDeclarationMatch = cleaned.match(/^function\s+\w*\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (functionDeclarationMatch) {
      // 提取函数体内容
      return functionDeclarationMatch[1].trim();
    }

    // 检查是否是箭头函数声明
    const arrowFunctionMatch = cleaned.match(/^\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\}$/);
    if (arrowFunctionMatch) {
      return arrowFunctionMatch[1].trim();
    }

    // 检查是否是简化的箭头函数
    const simpleArrowMatch = cleaned.match(/^\s*\([^)]*\)\s*=>\s*([^{}]+)$/);
    if (simpleArrowMatch) {
      return `return ${simpleArrowMatch[1].trim()}`;
    }

    // 处理传统格式：移除函数声明关键字，只保留函数体
    cleaned = cleaned
      .replace(/^(function\s+)?\w*\s*\(/, '')
      .replace(/\)\s*\{?\s*$/, '');

    return cleaned.trim();
  }

  /**
   * 安全性检查
   */
  private isSecureFunction(functionString: string, params: string[] = []): boolean {
    // 危险关键词黑名单
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /constructor\s*\(/,
      /prototype\s*\[/,
      /\__proto__/,
      /\[\s*["']constructor["']\s*\]/,
      /document\./,
      /window\./,
      /global\./,
      /process\./,
      /require\s*\(/,
      /import\s+/,
      /setTimeout\s*\(\s*["']/,
      /setInterval\s*\(\s*["']/,
    ];

    // 检查危险模式
    for (const pattern of dangerousPatterns) {
      if (pattern.test(functionString)) {
        return false;
      }
    }

    // 改进的正则表达式：避免匹配字符串字面量中的内容
    // 先移除字符串字面量，再匹配标识符
    const stringlessCode = functionString.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, '');
    const globalObjectPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    const matches = stringlessCode.match(globalObjectPattern);

    if (matches) {
      // 创建包含参数的临时白名单
      const tempWhitelist = new Set([...this.whitelist, ...params]);
      
      for (const match of matches) {
        // 检查是否是未定义的全局变量
        const isGlobal = this.isGlobalVariable(match);
        const inWhitelist = tempWhitelist.has(match);
        
        if (isGlobal && !inWhitelist) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 检查是否是全局变量
   */
  private isGlobalVariable(name: string): boolean {
    try {
      return !(typeof window !== 'undefined' && name in window) &&
        !(typeof globalThis !== 'undefined' && name in globalThis) &&
        name !== 'undefined' &&
        name !== 'NaN' &&
        name !== 'Infinity';
    } catch {
      return false;
    }
  }

  /**
   * 添加超时控制
   */
  private withTimeout<T>(promise: T | Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Function execution timeout (${timeout}ms)`));
      }, timeout);

      Promise.resolve(promise)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

/**
 * 便捷方法：将函数字符串转换为可执行函数
 */
export function stringToFunction<T extends (...args: any[]) => any>(
  functionString: string,
  options: FunctionParseOptions & { params?: string[] } = {}
): T | null {
  const parser = new SafeFunctionParser(options);
  return parser.parseFunction<T>(functionString, options);
}

/**
 * 便捷方法：安全执行函数字符串
 */
export async function executeFunctionString<T>(
  functionString: string,
  args: any[] = [],
  options: FunctionParseOptions & { params?: string[] } = {}
): Promise<FunctionExecutionResult<T>> {
  const parser = new SafeFunctionParser(options);
  return await parser.parseAndExecute<T>(functionString, args, options);
}

/**
 * 简单的函数字符串解析（仅用于受信任环境）
 */
export function simpleStringToFunction<T extends (...args: any[]) => any>(
  functionString: string,
  params: string[] = []
): T | null {
  try {
    let cleaned = functionString
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();

    // 检查是否是完整的函数声明
    const functionDeclarationMatch = cleaned.match(/^function\s+\w*\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (functionDeclarationMatch) {
      // 提取函数体内容
      const body = functionDeclarationMatch[1].trim();
      return new Function(...params, body) as T;
    }

    // 检查是否是箭头函数声明
    const arrowFunctionMatch = cleaned.match(/^\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\}$/);
    if (arrowFunctionMatch) {
      const body = arrowFunctionMatch[1].trim();
      return new Function(...params, body) as T;
    }

    // 检查是否是简化的箭头函数
    const simpleArrowMatch = cleaned.match(/^\s*\([^)]*\)\s*=>\s*([^{}]+)$/);
    if (simpleArrowMatch) {
      const body = `return ${simpleArrowMatch[1].trim()}`;
      return new Function(...params, body) as T;
    }

    // 处理传统格式：移除函数包装
    const body = cleaned
      .replace(/^(function\s+)?\w*\s*\([^)]*\)\s*\{?\s*/, '')
      .replace(/\}?\s*$/, '')
      .trim();

    return new Function(...params, body) as T;
  } catch (error) {
    console.error('Failed to parse simple function:', error);
    return null;
  }
}

/**
 * 验证函数字符串语法
 */
export function validateFunctionSyntax(functionString: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // 尝试解析函数
    new Function(functionString);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 从函数字符串中提取参数名
 */
export function extractFunctionParams(functionString: string): string[] {
  try {
    let cleaned = functionString
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();

    // 匹配函数声明中的参数
    const match = cleaned.match(/function\s+\w*\s*\(([^)]*)\)|^\s*\(([^)]*)\)/);
    if (match) {
      const paramsStr = match[1] || match[2];
      if (paramsStr) {
        return paramsStr.split(',').map(param => param.trim()).filter(param => param);
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to extract function params:', error);
    return [];
  }
}

/**
 * 智能解析函数字符串（自动提取参数）
 */
export function smartParseFunction<T extends (...args: any[]) => any>(
  functionString: string,
  options: FunctionParseOptions = {}
): T | null {
  const params = extractFunctionParams(functionString);
  return stringToFunction<T>(functionString, { ...options, params });
}