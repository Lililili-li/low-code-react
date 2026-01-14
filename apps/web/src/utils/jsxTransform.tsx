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

  try {
    const transformedCode = Babel.transform(code, {
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

    // 提取函数名
    const functionMatch = code.match(/function\s+(\w+)/);
    const constMatch = code.match(/const\s+(\w+)\s*=/);
    const componentName = functionMatch?.[1] || constMatch?.[1] || 'Component';

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
