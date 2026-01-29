import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import type { editor } from 'monaco-editor';
import { shikiToMonaco } from '@shikijs/monaco';
import { createHighlighter, type Highlighter } from 'shiki';
import * as prettier from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypescript from 'prettier/plugins/typescript';

// 配置 loader 使用本地安装的 monaco-editor，而不是 CDN
loader.config({ monaco });

export type MonacoLanguage =
  | 'javascript'
  | 'typescript'
  | 'typescriptreact'
  | 'javascriptreact'
  | 'json'
  | 'css'
  | 'html'
  | 'sql';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  language?: MonacoLanguage;
  height?: string | number;
  readOnly?: boolean;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative';
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  className?: string;
}

let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['andromeeda', 'github-light'],
      langs: ['javascript', 'typescript', 'tsx', 'jsx', 'json', 'css', 'html', 'sql'],
    });
  }
  return highlighterPromise;
};

const MonacoEditor = ({
  value,
  onChange,
  onSave,
  language = 'javascript',
  height = '300px',
  readOnly = false,
  minimap = false,
  lineNumbers = 'on',
  wordWrap = 'on',
  className,
}: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const init = async () => {
      const [highlighter, monaco] = await Promise.all([getHighlighter(), loader.init()]);

      // 配置 TypeScript 语言服务选项
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      });

      // 配置 JavaScript 语言服务选项
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        allowJs: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
      });

      monaco.languages.register({ id: 'javascript' });
      monaco.languages.register({ id: 'typescript' });
      monaco.languages.register({ id: 'tsx' });
      monaco.languages.register({ id: 'jsx' });
      monaco.languages.register({ id: 'typescriptreact' });
      monaco.languages.register({ id: 'javascriptreact' });
      monaco.languages.register({ id: 'json' });
      monaco.languages.register({ id: 'css' });
      monaco.languages.register({ id: 'html' });
      monaco.languages.register({ id: 'sql' });

      // 为 tsx/jsx 注册 Prettier 格式化提供者
      const createFormatProvider = (parser: string) => ({
        provideDocumentFormattingEdits: async (model: editor.ITextModel) => {
          try {
            const text = model.getValue();
            const formatted = await prettier.format(text, {
              parser,
              plugins: [prettierPluginBabel, prettierPluginEstree, prettierPluginTypescript],
              semi: true,
              singleQuote: true,
              tabWidth: 2,
              trailingComma: 'es5',
              printWidth: 100,
              jsxSingleQuote: false,
              bracketSameLine: true,
            });
            return [
              {
                range: model.getFullModelRange(),
                text: formatted,
              },
            ];
          } catch {
            return [];
          }
        },
      });

      monaco.languages.registerDocumentFormattingEditProvider(
        'tsx',
        createFormatProvider('typescript'),
      );
      monaco.languages.registerDocumentFormattingEditProvider('jsx', createFormatProvider('babel'));
      monaco.languages.registerDocumentFormattingEditProvider(
        'typescript',
        createFormatProvider('typescript'),
      );
      monaco.languages.registerDocumentFormattingEditProvider(
        'javascript',
        createFormatProvider('babel'),
      );

      shikiToMonaco(highlighter, monaco);
    };

    init();
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 注册 Ctrl+S / Cmd+S 快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const currentValue = editor.getValue();
      onSave?.(currentValue);
    });

    // JSX/TSX 自动闭合标签
    editor.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      if (!model) return;

      const changes = e.changes;
      for (const change of changes) {
        // 检测输入 ">"
        if (change.text === '>') {
          const position = editor.getPosition();
          if (!position) continue;

          const lineContent = model.getLineContent(position.lineNumber);
          // position.column 是光标当前位置（在 > 之后），所以 beforeCursor 需要排除 >
          const beforeCursor = lineContent.substring(0, position.column - 2);

          // 匹配开始标签 <TagName 或 <TagName attr="value"
          const tagMatch = beforeCursor.match(/<(\w+)(?:\s+[^>]*)?$/);
          if (tagMatch) {
            const tagName = tagMatch[1];
            // 排除自闭合标签
            const selfClosingTags = [
              'img',
              'br',
              'hr',
              'input',
              'meta',
              'link',
              'area',
              'base',
              'col',
              'embed',
              'param',
              'source',
              'track',
              'wbr',
            ];
            if (!selfClosingTags.includes(tagName.toLowerCase()) && !beforeCursor.endsWith('/')) {
              // 检查是否已经有闭合标签（position.column - 1 是 > 的位置，所以从 position.column 开始）
              const afterCursor = lineContent.substring(position.column - 1);
              if (!afterCursor.startsWith(`</${tagName}>`)) {
                // 插入闭合标签
                editor.executeEdits('auto-close-tag', [
                  {
                    range: new monaco.Range(
                      position.lineNumber,
                      position.column,
                      position.lineNumber,
                      position.column,
                    ),
                    text: `</${tagName}>`,
                  },
                ]);
                // 将光标移回到 > 后面
                editor.setPosition(position);
              }
            }
          }
        }
      }
    });
  };

  const handleChange: OnChange = (value) => {
    onChange?.(value || '');
  };

  // 将 Monaco 的语言 ID 映射到 Shiki 支持的语言 ID
  const getEditorLanguage = (lang: MonacoLanguage): string => {
    const languageMap: Record<string, string> = {
      typescriptreact: 'tsx',
      javascriptreact: 'jsx',
    };
    return languageMap[lang] || lang;
  };

  return (
    <div
      className={className}
      style={{ borderRadius: '6px', overflow: 'hidden', background: '#24262e' }}
    >
      <Editor
        height={height}
        language={getEditorLanguage(language)}
        value={value}
        theme="andromeeda"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          lineNumbers,
          wordWrap,
          fontSize: 14,
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          folding: true,
          renderLineHighlight: 'line',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          formatOnPaste: true,
          formatOnType: false,
          contextmenu: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
