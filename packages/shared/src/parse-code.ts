import * as Babel from '@babel/standalone';
import React from 'react';

export interface TransformOptions {
  scope?: Record<string, any>;
  imports?: Record<string, any>;
}

// 提取代码中的任意值 Tailwind 类并动态注入样式
function injectArbitraryValueStyles(code: string) {
  // 匹配所有任意值类：bg-[xxx]、text-[xxx]、border-[xxx]、w-[xxx]、h-[xxx] 等
  const arbitraryValuePattern = /(?:bg|text|border|border-t|border-b|border-l|border-r|w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|rounded|top|bottom|left|right)-\[([^\]]+)\]/g;
  
  const matches = [...code.matchAll(arbitraryValuePattern)];
  
  if (matches.length === 0) return;
  
  // 检查是否已经注入过样式
  const styleId = 'dynamic-tailwind-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  const existingStyles = new Set(styleElement.textContent?.split('\n').filter(Boolean) || []);
  const newStyles: string[] = [];
  
  matches.forEach((match) => {
    const fullClass = match[0];
    const value = match[1];
    
    // 转义类名中的特殊字符用于 CSS 选择器
    const escapedClass = fullClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#');
    
    let cssRule = '';
    
    // 根据不同的类前缀生成对应的 CSS
    if (fullClass.startsWith('bg-[')) {
      cssRule = `.${escapedClass} { background-color: ${value} !important; }`;
    } else if (fullClass.startsWith('text-[')) {
      // text-[xxx] 可能是颜色或字体大小
      if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.match(/^[a-z]+$/i)) {
        // 颜色值：#xxx, rgb(), hsl(), red 等
        cssRule = `.${escapedClass} { color: ${value} !important; }`;
      } else if (value.match(/^\d+(?:px|rem|em|pt|%)?$/)) {
        // 字体大小：12px, 1.5rem, 16 等
        const fontSize = value.match(/\d+$/) ? `${value}px` : value;
        cssRule = `.${escapedClass} { font-size: ${fontSize} !important; }`;
      } else if (value === 'center' || value === 'left' || value === 'right' || value === 'justify') {
        // 文字对齐
        cssRule = `.${escapedClass} { text-align: ${value} !important; }`;
      } else {
        // 其他情况，尝试作为颜色处理
        cssRule = `.${escapedClass} { color: ${value} !important; }`;
      }
    } else if (fullClass.startsWith('border-[')) {
      cssRule = `.${escapedClass} { border-color: ${value} !important; }`;
    } else if (fullClass.startsWith('border-t-[')) {
      cssRule = `.${escapedClass} { border-top-color: ${value} !important; }`;
    } else if (fullClass.startsWith('border-b-[')) {
      cssRule = `.${escapedClass} { border-bottom-color: ${value} !important; }`;
    } else if (fullClass.startsWith('border-l-[')) {
      cssRule = `.${escapedClass} { border-left-color: ${value} !important; }`;
    } else if (fullClass.startsWith('border-r-[')) {
      cssRule = `.${escapedClass} { border-right-color: ${value} !important; }`;
    } else if (fullClass.startsWith('w-[')) {
      cssRule = `.${escapedClass} { width: ${value} !important; }`;
    } else if (fullClass.startsWith('h-[')) {
      cssRule = `.${escapedClass} { height: ${value} !important; }`;
    } else if (fullClass.startsWith('min-w-[')) {
      cssRule = `.${escapedClass} { min-width: ${value} !important; }`;
    } else if (fullClass.startsWith('min-h-[')) {
      cssRule = `.${escapedClass} { min-height: ${value} !important; }`;
    } else if (fullClass.startsWith('max-w-[')) {
      cssRule = `.${escapedClass} { max-width: ${value} !important; }`;
    } else if (fullClass.startsWith('max-h-[')) {
      cssRule = `.${escapedClass} { max-height: ${value} !important; }`;
    } else if (fullClass.startsWith('rounded-[')) {
      cssRule = `.${escapedClass} { border-radius: ${value} !important; }`;
    }
    
    if (cssRule && !existingStyles.has(cssRule)) {
      newStyles.push(cssRule);
    }
  });
  
  if (newStyles.length > 0) {
    styleElement.textContent += '\n' + newStyles.join('\n');
  }
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

  // 动态注入任意值 Tailwind 类的样式
  injectArbitraryValueStyles(code);

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

    // 移除 import 和 export 语句
    let processedCode = code
      // 移除所有 import 语句
      .replace(/\bimport\s+(?:(?:\w+|\{[^}]*\})\s+from\s+)?(?:['"][^'"]+['"]|[^;\n]+)[;\n]?/g, '')
      // 移除 export 语句
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(?:const|let|var|function|class)\s+/g, '')
      .replace(/export\s*\{[^}]*\}[\s;]*/g, '')
      .replace(/\bexport\b/g, '')
      // 清理多余的空行和空格
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/;[\s]*;/g, ';')
      .trim();
    
    // 使用 Babel 转换 JSX
    let transformedCode;
    try {
      transformedCode = Babel.transform(processedCode, {
        presets: [['react', { runtime: 'classic' }]], // 使用 classic runtime 避免自动 import
        filename: 'virtual.jsx',
        plugins: [],
        babelrc: false,
        configFile: false
      }).code;
    } catch (babelError) {
      transformedCode = processedCode;
    }
    
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
    
    // 检查代码中是否还有 import 语句
    if (wrappedCode.includes('import')) {
      console.error('ERROR: Code still contains import statements!');
      console.error('Problematic code:', wrappedCode);
      return () => React.createElement('div', { 
        style: { color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' } 
      }, '代码中仍包含 import 语句，无法执行');
    }
    
    try {
      const func = new Function(...scopeKeys, wrappedCode);
      const result = func(...scopeValues);
      
      if (typeof result === 'function') {
        return result;
      }

      throw new Error('代码未返回有效的函数组件');
    } catch (functionError) {
      console.error('Function execution error:', functionError);
      console.error('Scope keys:', scopeKeys);
      console.error('Transformed code that caused error:', transformedCode);
      throw functionError;
    }
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
      presets: [['react', { runtime: 'automatic' }]],
      filename: 'virtual.jsx',
      plugins: [],
      babelrc: false,
      configFile: false
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
