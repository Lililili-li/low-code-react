import * as Babel from '@babel/standalone';
import React from 'react';

export interface TransformOptions {
  scope?: Record<string, any>;
  imports?: Record<string, any>;
}

export function executeJSCode(
  code: string,
  options: TransformOptions = {}
): React.ComponentType<any> {
  const { scope = {}, imports = {} } = options;

  // 处理空代码
  if (!code || !code.trim()) {
    return () => null;
  }

  try {
    // 提取组件名：优先使用 export default 导出的组件
    let componentName: string | null = null;
    
    // 1. 优先匹配 export default 后面的组件名
    const exportDefaultMatch = code.match(/export\s+default\s+(\w+)/);
    if (exportDefaultMatch) {
      componentName = exportDefaultMatch[1];
    } else {
      // 2. 匹配 export default function/const 声明
      const exportDefaultFuncMatch = code.match(/export\s+default\s+function\s+(\w+)/);
      const exportDefaultConstMatch = code.match(/export\s+default\s+const\s+(\w+)/);
      if (exportDefaultFuncMatch) {
        componentName = exportDefaultFuncMatch[1];
      } else if (exportDefaultConstMatch) {
        componentName = exportDefaultConstMatch[1];
      } else {
        // 3. 如果没有 export default，使用最后一个声明的函数/const（通常是主组件）
        const allFunctionMatches = [...code.matchAll(/(?:const|function)\s+(\w+)\s*(?:=\s*\(|=\s*function|\()/g)];
        if (allFunctionMatches.length > 0) {
          componentName = allFunctionMatches[allFunctionMatches.length - 1][1];
        }
      }
    }

    // 如果没有找到任何组件声明，返回空组件
    if (!componentName) {
      return () => null;
    }

    // 检查代码是否包含完整的函数体（至少有配对的括号）
    const hasCompleteFunction = /(?:function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>)/.test(code);
    if (!hasCompleteFunction) {
      return () => null;
    }

    // 移除 import 和 export 语句，因为在 Function 构造器中无法使用
    let processedCode = code
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // 移除 import
      .replace(/export\s+(default\s+)?/g, ''); // 移除 export 和 export default
    
    const transformedCode = Babel.transform(processedCode, {
      presets: ['react', 'typescript'],
      filename: 'virtual.tsx',
    }).code;

    const allScope = {
      React,
      useState: React.useState,
      useEffect: React.useEffect,
      useMemo: React.useMemo,
      useCallback: React.useCallback,
      useRef: React.useRef,
      ...imports,
      ...scope,
    };

    const scopeKeys = Object.keys(allScope);
    const scopeValues = Object.values(allScope);

    const wrappedCode = `
      ${transformedCode}
      return ${componentName};
    `;

    const func = new Function(...scopeKeys, wrappedCode);
    const result = func(...scopeValues);
    
    if (typeof result === 'function') {
      return result;
    }

    throw new Error('代码未返回有效的函数组件');
  } catch (error) {
    console.error('JS Code Execution Error:', error);
    return () => React.createElement('div', { 
      style: { color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' } 
    }, `代码执行错误: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function createComponentFromJSX(
  jsxString: string,
  options: TransformOptions = {}
): React.ReactElement | null {
  try {
    const { scope = {}, imports = {} } = options;
    
    const code = Babel.transform(jsxString, {
      presets: ['react', 'typescript'],
      filename: 'virtual.tsx',
    }).code;

    const allScope = {
      React,
      ...imports,
      ...scope,
    };

    const scopeKeys = Object.keys(allScope);
    const scopeValues = Object.values(allScope);

    const func = new Function(...scopeKeys, `return (${code})`);
    return func(...scopeValues);
  } catch (error) {
    console.error('JSX Creation Error:', error);
    return React.createElement('div', { 
      style: { color: 'red', padding: '10px', border: '1px solid red' } 
    }, `JSX解析错误: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function createFunctionComponent(
  code: string,
  options: TransformOptions = {}
): React.ComponentType<any> {
  return executeJSCode(code, options);
}
