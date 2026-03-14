import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@repo/ui/components/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@repo/ui/components/select';
import { Play, RefreshCw, Plus, Trash2, Copy } from 'lucide-react';
import { ReactReplProps, FileState, CompileError } from './types';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import './styles.css';

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info';
  args: string[];
  timestamp: number;
}

// 从代码中提取 export default 的组件名
function extractComponentName(code: string): string {
  const exportDefaultFuncMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  if (exportDefaultFuncMatch) return exportDefaultFuncMatch[1];

  const exportDefaultMatch = code.match(/export\s+default\s+(\w+)\s*;?/);
  if (exportDefaultMatch) return exportDefaultMatch[1];

  // 没有 export default，尝试找最后一个大写开头的函数/const
  const allMatches = [...code.matchAll(/(?:function|const)\s+([A-Z]\w*)/g)];
  if (allMatches.length > 0) return allMatches[allMatches.length - 1][1];

  return 'App';
}

// 预处理代码：移除 import/export，保留组件定义
function preprocessCode(code: string): string {
  return code
    // 移除多行 import（处理括号内换行）
    .replace(/import\s+(?:type\s+)?(?:[\w*{},\s\n]+from\s+)?['"][^'"]+['"]\s*;?\n?/gm, '')
    // export default function Foo → function Foo
    .replace(/export\s+default\s+function\s+/g, 'function ')
    // export default class Foo → class Foo
    .replace(/export\s+default\s+class\s+/g, 'class ')
    // 移除 export default Foo; （单独一行的）
    .replace(/^\s*export\s+default\s+\w+\s*;?\s*$/gm, '')
    // export const/let/var/function/class → const/let/var/function/class
    .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
    // 移除 export { ... } 和 export { ... } from '...'
    .replace(/export\s*\{[^}]*\}\s*(?:from\s*['"][^'"]+['"])?\s*;?\n?/gm, '')
    .trim();
}

// 生成 iframe 沙盒的 HTML
function generateSandboxHTML(files: FileState[], theme: 'light' | 'dark'): string {
  const mainFile = files.find(
    (f) =>
      f.name.endsWith('.jsx') ||
      f.name.endsWith('.tsx') ||
      f.name.endsWith('.js') ||
      f.name.endsWith('.ts')
  );

  if (!mainFile) {
    return `<!DOCTYPE html><html><body style="color:red;font-family:sans-serif;padding:16px">
      <strong>错误：</strong>未找到主文件 (.jsx/.tsx/.js/.ts)
    </body></html>`;
  }

  const styleFiles = files.filter(
    (f) => f.name.endsWith('.css') || f.name.endsWith('.scss')
  );
  const allStyles = styleFiles.map((f) => f.content).join('\n');

  const componentName = extractComponentName(mainFile.content);
  const processedCode = preprocessCode(mainFile.content);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const textColor = isDark ? '#e5e5e5' : '#111111';

  return `<!DOCTYPE html>
<html lang="zh-CN" class="${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // 拦截 console，通过 postMessage 将日志转发给父页面
    (function() {
      const methods = ['log', 'warn', 'error', 'info'];
      methods.forEach(function(method) {
        const original = console[method].bind(console);
        console[method] = function() {
          const args = Array.from(arguments).map(function(a) {
            try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
            catch(e) { return String(a); }
          });
          original.apply(console, arguments);
          try {
            window.parent.postMessage({ type: 'console', method: method, args: args }, '*');
          } catch(e) {}
        };
      });

      // 捕获运行时错误
      window.addEventListener('error', function(e) {
        try {
          window.parent.postMessage({
            type: 'runtime-error',
            message: e.message,
            lineno: e.lineno,
            colno: e.colno,
            filename: e.filename
          }, '*');
        } catch(err) {}
      });

      // 捕获 Promise rejection
      window.addEventListener('unhandledrejection', function(e) {
        try {
          window.parent.postMessage({
            type: 'runtime-error',
            message: 'Unhandled Promise rejection: ' + (e.reason?.message || String(e.reason))
          }, '*');
        } catch(err) {}
      });
    })();
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bgColor};
      color: ${textColor};
    }
    #root { padding: 16px; }
    ${allStyles}
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel" data-presets="react,typescript">
    const {
      useState, useEffect, useMemo, useCallback, useRef,
      createContext, useContext, useReducer, useId,
      forwardRef, memo, Fragment, Suspense, lazy,
      startTransition, useTransition, useDeferredValue
    } = React;

    ${processedCode}

    try {
      const __root = ReactDOM.createRoot(document.getElementById('root'));
      __root.render(React.createElement(${componentName}));
      window.parent.postMessage({ type: 'ready' }, '*');
    } catch (e) {
      window.parent.postMessage({ type: 'runtime-error', message: e.message || String(e) }, '*');
    }
  </script>
</body>
</html>`;
}

const ReactRepl: React.FC<ReactReplProps> = ({
  initialFiles,
  theme: initialTheme = 'dark',
  height = '100vh',
  onCodeChange,
  showHeader = true,
  showFileTabs = true,
  readOnly = false
}) => {
  const [files, setFiles] = useState<FileState[]>(
    initialFiles || [
      {
        id: '1',
        name: 'App.tsx',
        language: 'typescriptreact',
        content: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#6366f1,#a855f7)] flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-white/30 text-white text-center">
        <h2 className="text-3xl font-light mb-2">React REPL</h2>
        <p className="text-white/80 mb-8">支持 Tailwind CSS 的沙盒环境</p>
        <div className="bg-white/20 rounded-xl px-10 py-6 mb-8 border border-white/30">
          <span className="text-6xl font-bold block">{count}</span>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setCount(c => c - 1)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            −
          </button>
          <button
            onClick={() => setCount(0)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Reset
          </button>
          <button
            onClick={() => setCount(c => c + 1)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            ＋
          </button>
        </div>
      </div>
    </div>
  );
}

export default Counter;`
      }
    ]
  );

  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [iframeContent, setIframeContent] = useState<string>('');
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [outputMode, setOutputMode] = useState<'preview' | 'compiled' | 'console'>('preview');
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [isCompiling, setIsCompiling] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 监听来自 iframe 的 postMessage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      switch (e.data.type) {
        case 'console':
          setConsoleMessages((prev) => [
            ...prev,
            {
              type: e.data.method as ConsoleMessage['type'],
              args: e.data.args,
              timestamp: Date.now()
            }
          ]);
          break;

        case 'runtime-error':
          setErrors((prev) => [
            ...prev,
            {
              message: e.data.message,
              line: e.data.lineno,
              column: e.data.colno,
              severity: 'error'
            }
          ]);
          setConsoleMessages((prev) => [
            ...prev,
            {
              type: 'error',
              args: [e.data.message],
              timestamp: Date.now()
            }
          ]);
          break;

        case 'ready':
          setPreviewReady(true);
          setIsCompiling(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const compileCode = (currentFiles = files, currentTheme = theme) => {
    setErrors([]);
    setConsoleMessages([]);
    setPreviewReady(false);
    setIsCompiling(true);

    const mainFile = currentFiles.find(
      (f) =>
        f.name.endsWith('.jsx') ||
        f.name.endsWith('.tsx') ||
        f.name.endsWith('.js') ||
        f.name.endsWith('.ts')
    );

    if (!mainFile) {
      setErrors([{ message: '未找到主文件 (.jsx/.tsx/.js/.ts)', severity: 'error' }]);
      setIsCompiling(false);
      return;
    }

    const html = generateSandboxHTML(currentFiles, currentTheme);
    setIframeContent(html);
    // ready 信号会通过 postMessage 回调，此处设置超时兜底
    setTimeout(() => setIsCompiling(false), 5000);
  };

  // Ctrl+S / Cmd+S 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        compileCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, theme]);

  // 初始编译
  useEffect(() => {
    compileCode();
  }, []);

  // 主题切换时重新编译
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    compileCode(files, newTheme);
  };

  const updateFile = (fileId: string, content: string) => {
    setFiles((prev) => {
      const newFiles = prev.map((f) => (f.id === fileId ? { ...f, content } : f));
      onCodeChange?.(newFiles);
      return newFiles;
    });
  };

  const addFile = () => {
    if (readOnly) return;
    const newFile: FileState = {
      id: Date.now().toString(),
      name: `Component${files.length + 1}.tsx`,
      language: 'typescriptreact',
      content: `function NewComponent() {\n  return (\n    <div className="p-4">\n      <h2 className="text-xl font-bold">新组件</h2>\n    </div>\n  );\n}\n\nexport default NewComponent;`
    };
    const newFiles = [...files, newFile];
    setFiles(newFiles);
    setActiveFileId(newFile.id);
    onCodeChange?.(newFiles);
  };

  const deleteFile = (fileId: string) => {
    if (readOnly || files.length <= 1) {
      setErrors([{ message: '至少需要保留一个文件', severity: 'warning' }]);
      return;
    }
    const newFiles = files.filter((f) => f.id !== fileId);
    setFiles(newFiles);
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0]?.id || '');
    }
    onCodeChange?.(newFiles);
  };

  const duplicateFile = (fileId: string) => {
    if (readOnly) return;
    const file = files.find((f) => f.id === fileId);
    if (file) {
      const newFile: FileState = {
        ...file,
        id: Date.now().toString(),
        name: `copy_${file.name}`
      };
      const newFiles = [...files, newFile];
      setFiles(newFiles);
      setActiveFileId(newFile.id);
      onCodeChange?.(newFiles);
    }
  };

  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height
  };

  const consoleIconMap: Record<ConsoleMessage['type'], string> = {
    log: '▶',
    info: 'ℹ',
    warn: '⚠',
    error: '✕'
  };

  return (
    <div className={`react-repl ${theme}`} style={containerStyle}>
      {showHeader && (
        <div className="repl-header">
          <div className="repl-title">
            <h2>React REPL</h2>
            <span className="repl-subtitle">沙盒环境 · 支持 Tailwind CSS</span>
          </div>
          <div className="repl-controls">
            <div className="flex items-center gap-2">
              <Select
                value={theme}
                onValueChange={(value: 'light' | 'dark') => handleThemeChange(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => compileCode()} variant="default" size="sm">
                <RefreshCw className="w-4 h-4" />
                重新编译
              </Button>
              <Button onClick={() => compileCode()} variant="outline" size="sm">
                <Play className="w-4 h-4" />
                运行
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="repl-content">
        {/* 编辑器区域 */}
        <div className="editor-pane">
          {showFileTabs && (
            <div className="file-tabs">
              <div className="tabs-list">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`file-tab ${activeFileId === file.id ? 'active' : ''}`}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <span>{file.name}</span>
                    {!readOnly && (
                      <div className="tab-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateFile(file.id);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {files.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFile(file.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!readOnly && (
                <Button size="sm" variant="ghost" onClick={addFile}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          <div className="editor-container">
            {activeFile && (
              <div className="code-editor">
                <div className="editor-header">
                  <span className="file-name">{activeFile.name}</span>
                  <span className="language-badge">{activeFile.language}</span>
                </div>
                <MonacoEditor
                  value={activeFile.content}
                  onChange={(value) => !readOnly && updateFile(activeFile.id, value)}
                  language={activeFile.language as any}
                  height="100%"
                  readOnly={readOnly}
                  minimap={false}
                  wordWrap="on"
                  className="editor-monaco flex-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* 预览区域 */}
        <div className="preview-pane">
          <div className="output-tabs">
            <Tabs
              value={outputMode}
              onValueChange={(value: string) =>
                setOutputMode(value as 'preview' | 'compiled' | 'console')
              }
            >
              <TabsList>
                <TabsTrigger value="preview">预览</TabsTrigger>
                <TabsTrigger value="compiled">源码</TabsTrigger>
                <TabsTrigger value="console">
                  控制台
                  {consoleMessages.length > 0 && (
                    <span className="console-badge">{consoleMessages.length}</span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" />
              <TabsContent value="compiled" />
              <TabsContent value="console" />
            </Tabs>
          </div>

          <div className="output-content">
            {/* 预览 Tab */}
            {outputMode === 'preview' && (
              <div className="preview-container">
                {errors.length > 0 && (
                  <div className="error-overlay">
                    <div className="error-header">
                      <span className="error-icon">✕</span>
                      <h3>运行时错误</h3>
                    </div>
                    {errors.map((error, index) => (
                      <div key={index} className="error-item">
                        <pre className="error-message">{error.message}</pre>
                      </div>
                    ))}
                    <div className="error-hint">
                      修复后按 <kbd>Ctrl+S</kbd>{' '}
                      {navigator.platform.includes('Mac') ? '/ <kbd>Cmd+S</kbd>' : ''} 重新运行
                    </div>
                  </div>
                )}

                {isCompiling && !iframeContent && (
                  <div className="loading-preview">
                    <div className="loading-spinner">⚡</div>
                    <p>正在编译...</p>
                  </div>
                )}

                {!iframeContent && !isCompiling && (
                  <div className="loading-preview">
                    <div className="loading-spinner">⌨️</div>
                    <p>
                      按 <kbd>Ctrl+S</kbd> 编译并运行
                    </p>
                  </div>
                )}

                {iframeContent && (
                  <iframe
                    ref={iframeRef}
                    srcDoc={iframeContent}
                    sandbox="allow-scripts"
                    title="React REPL Preview"
                    className="sandbox-iframe"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                  />
                )}
              </div>
            )}

            {/* 源码 Tab */}
            {outputMode === 'compiled' && (
              <div className="compiled-output">
                <pre className="code-output">
                  {activeFile?.content || '请选择文件查看源码'}
                </pre>
              </div>
            )}

            {/* 控制台 Tab */}
            {outputMode === 'console' && (
              <div className="console-output">
                {consoleMessages.length === 0 ? (
                  <div className="console-empty">
                    <span>📝</span>
                    <p>控制台输出将显示在这里</p>
                  </div>
                ) : (
                  <div className="console-messages">
                    {consoleMessages.map((msg, index) => (
                      <div key={index} className={`console-item ${msg.type}`}>
                        <span className="console-icon">{consoleIconMap[msg.type]}</span>
                        <span className="console-message">{msg.args.join(' ')}</span>
                        <span className="console-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {consoleMessages.length > 0 && (
                  <button
                    className="console-clear"
                    onClick={() => setConsoleMessages([])}
                  >
                    清空
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactRepl;
