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

      // 添加 React 类型定义
      const addReactTypes = async () => {
        try {
          const reactTypesUrl = 'https://unpkg.com/@types/react@18/index.d.ts';
          const reactDomTypesUrl = 'https://unpkg.com/@types/react-dom@18/index.d.ts';
          
          const [reactTypes, reactDomTypes] = await Promise.all([
            fetch(reactTypesUrl).then((res) => res.text()),
            fetch(reactDomTypesUrl).then((res) => res.text()),
          ]);

          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            reactTypes,
            'file:///node_modules/@types/react/index.d.ts'
          );
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            reactTypes,
            'file:///node_modules/@types/react/index.d.ts'
          );
          
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            reactDomTypes,
            'file:///node_modules/@types/react-dom/index.d.ts'
          );
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            reactDomTypes,
            'file:///node_modules/@types/react-dom/index.d.ts'
          );
        } catch (error) {
          console.warn('Failed to load React types:', error);
        }
      };

      // 配置 TypeScript 语言服务选项
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        jsxImportSource: 'react',
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        isolatedModules: true,
        strictNullChecks: false,
      });

      // 配置 JavaScript 语言服务选项
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        jsxImportSource: 'react',
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        allowJs: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        checkJs: false,
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

      // 加载 React 类型定义
      await addReactTypes();

      // 添加 React 代码片段
      const createReactSnippets = (model: editor.ITextModel, position: monaco.Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'useState',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useState(${1:initialValue})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useState hook',
            detail: 'useState(initialValue)',
            range,
          },
          {
            label: 'useEffect',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useEffect(() => {\n\t${1}\n}, [${2}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useEffect hook',
            detail: 'useEffect(effect, deps)',
            range,
          },
          {
            label: 'useCallback',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useCallback(() => {\n\t${1}\n}, [${2}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useCallback hook',
            detail: 'useCallback(callback, deps)',
            range,
          },
          {
            label: 'useMemo',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useMemo(() => ${1:value}, [${2}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useMemo hook',
            detail: 'useMemo(factory, deps)',
            range,
          },
          {
            label: 'useRef',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useRef(${1:null})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useRef hook',
            detail: 'useRef(initialValue)',
            range,
          },
          {
            label: 'useContext',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useContext(${1:Context})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useContext hook',
            detail: 'useContext(Context)',
            range,
          },
          {
            label: 'useReducer',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useReducer(${1:reducer}, ${2:initialState})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useReducer hook',
            detail: 'useReducer(reducer, initialState)',
            range,
          },
          {
            label: 'useLayoutEffect',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useLayoutEffect(() => {\n\t${1}\n}, [${2}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useLayoutEffect hook',
            detail: 'useLayoutEffect(effect, deps)',
            range,
          },
          {
            label: 'useImperativeHandle',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useImperativeHandle(${1:ref}, () => ({\n\t${2}\n}), [${3}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useImperativeHandle hook',
            detail: 'useImperativeHandle(ref, createHandle, deps)',
            range,
          },
        ];

        // 根据输入的文本过滤建议
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        if (textUntilPosition) {
          const filtered = suggestions.filter((s) => {
            const label = typeof s.label === 'string' ? s.label : s.label.label;
            return label.toLowerCase().startsWith(textUntilPosition.toLowerCase());
          });
          return filtered.length > 0 ? filtered : suggestions;
        }

        return suggestions;
      };

      monaco.languages.registerCompletionItemProvider('typescriptreact', {
        triggerCharacters: ['u', 's', 'e'],
        provideCompletionItems: (model, position) => ({
          suggestions: createReactSnippets(model, position),
        }),
      });

      monaco.languages.registerCompletionItemProvider('javascriptreact', {
        triggerCharacters: ['u', 's', 'e'],
        provideCompletionItems: (model, position) => ({
          suggestions: createReactSnippets(model, position),
        }),
      });

      monaco.languages.registerCompletionItemProvider('typescript', {
        triggerCharacters: ['u', 's', 'e'],
        provideCompletionItems: (model, position) => ({
          suggestions: createReactSnippets(model, position),
        }),
      });

      monaco.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['u', 's', 'e'],
        provideCompletionItems: (model, position) => ({
          suggestions: createReactSnippets(model, position),
        }),
      });

      // JSX/HTML 标签属性补全
      const commonJsxAttributes: Array<{ name: string; detail: string; insertText: string }> = [
        { name: 'className', detail: 'CSS 类名', insertText: 'className="${1}"' },
        { name: 'id', detail: '元素 ID', insertText: 'id="${1}"' },
        { name: 'style', detail: '内联样式', insertText: 'style={{ ${1} }}' },
        { name: 'key', detail: 'React key', insertText: 'key={${1}}' },
        { name: 'ref', detail: 'React ref', insertText: 'ref={${1}}' },
        { name: 'onClick', detail: '点击事件', insertText: 'onClick={${1:handler}}' },
        { name: 'onDoubleClick', detail: '双击事件', insertText: 'onDoubleClick={${1:handler}}' },
        { name: 'onMouseEnter', detail: '鼠标进入', insertText: 'onMouseEnter={${1:handler}}' },
        { name: 'onMouseLeave', detail: '鼠标离开', insertText: 'onMouseLeave={${1:handler}}' },
        { name: 'onMouseDown', detail: '鼠标按下', insertText: 'onMouseDown={${1:handler}}' },
        { name: 'onMouseUp', detail: '鼠标抬起', insertText: 'onMouseUp={${1:handler}}' },
        { name: 'onKeyDown', detail: '键盘按下', insertText: 'onKeyDown={${1:handler}}' },
        { name: 'onKeyUp', detail: '键盘抬起', insertText: 'onKeyUp={${1:handler}}' },
        { name: 'onKeyPress', detail: '键盘按压', insertText: 'onKeyPress={${1:handler}}' },
        { name: 'tabIndex', detail: 'Tab 顺序', insertText: 'tabIndex={${1:0}}' },
        { name: 'role', detail: 'ARIA 角色', insertText: 'role="${1}"' },
        { name: 'aria-label', detail: 'ARIA 标签', insertText: 'aria-label="${1}"' },
        { name: 'aria-hidden', detail: 'ARIA 隐藏', insertText: 'aria-hidden={${1:true}}' },
        { name: 'aria-disabled', detail: 'ARIA 禁用', insertText: 'aria-disabled={${1:true}}' },
        { name: 'aria-expanded', detail: 'ARIA 展开', insertText: 'aria-expanded={${1:false}}' },
        { name: 'aria-selected', detail: 'ARIA 选中', insertText: 'aria-selected={${1:false}}' },
        { name: 'data-testid', detail: '测试 ID', insertText: 'data-testid="${1}"' },
        { name: 'title', detail: '提示标题', insertText: 'title="${1}"' },
        { name: 'hidden', detail: '隐藏元素', insertText: 'hidden' },
      ];

      const tagAttributeMap: Record<
        string,
        Array<{ name: string; detail: string; insertText: string }>
      > = {
        img: [
          { name: 'src', detail: '图像 URL', insertText: 'src="${1}"' },
          { name: 'alt', detail: '替代文本', insertText: 'alt="${1}"' },
          { name: 'width', detail: '宽度', insertText: 'width={${1:100}}' },
          { name: 'height', detail: '高度', insertText: 'height={${1:100}}' },
          { name: 'loading', detail: '加载策略', insertText: 'loading="${1|lazy,eager,auto|}"' },
          { name: 'decoding', detail: '解码方式', insertText: 'decoding="${1|async,sync,auto|}"' },
          { name: 'onError', detail: '加载失败', insertText: 'onError={${1:handler}}' },
          { name: 'onLoad', detail: '加载完成', insertText: 'onLoad={${1:handler}}' },
          { name: 'srcSet', detail: '响应式图像集', insertText: 'srcSet="${1}"' },
          { name: 'sizes', detail: '响应式尺寸', insertText: 'sizes="${1}"' },
          { name: 'crossOrigin', detail: '跨域策略', insertText: 'crossOrigin="${1|anonymous,use-credentials|}"' },
        ],
        a: [
          { name: 'href', detail: '链接 URL', insertText: 'href="${1}"' },
          { name: 'target', detail: '打开方式', insertText: 'target="${1|_blank,_self,_parent,_top|}"' },
          { name: 'rel', detail: '链接关系', insertText: 'rel="${1|noopener noreferrer,nofollow,noreferrer|}"' },
          { name: 'download', detail: '下载文件名', insertText: 'download="${1}"' },
          { name: 'onClick', detail: '点击事件', insertText: 'onClick={${1:handler}}' },
          { name: 'hrefLang', detail: '链接语言', insertText: 'hrefLang="${1}"' },
        ],
        input: [
          {
            name: 'type',
            detail: '输入类型',
            insertText:
              'type="${1|text,password,email,number,tel,url,search,checkbox,radio,file,date,time,datetime-local,month,week,color,range,hidden,submit,reset,button|}"',
          },
          { name: 'value', detail: '受控值', insertText: 'value={${1}}' },
          { name: 'defaultValue', detail: '非受控默认值', insertText: 'defaultValue="${1}"' },
          { name: 'placeholder', detail: '占位文本', insertText: 'placeholder="${1}"' },
          { name: 'name', detail: '字段名', insertText: 'name="${1}"' },
          { name: 'disabled', detail: '禁用', insertText: 'disabled' },
          { name: 'readOnly', detail: '只读', insertText: 'readOnly' },
          { name: 'required', detail: '必填', insertText: 'required' },
          { name: 'min', detail: '最小值', insertText: 'min={${1:0}}' },
          { name: 'max', detail: '最大值', insertText: 'max={${1:100}}' },
          { name: 'step', detail: '步长', insertText: 'step={${1:1}}' },
          { name: 'checked', detail: '选中状态（受控）', insertText: 'checked={${1}}' },
          { name: 'defaultChecked', detail: '默认选中（非受控）', insertText: 'defaultChecked' },
          { name: 'autoFocus', detail: '自动聚焦', insertText: 'autoFocus' },
          {
            name: 'autoComplete',
            detail: '自动补全',
            insertText: 'autoComplete="${1|on,off,name,email,username,new-password,current-password|}"',
          },
          { name: 'maxLength', detail: '最大字符数', insertText: 'maxLength={${1:100}}' },
          { name: 'minLength', detail: '最小字符数', insertText: 'minLength={${1:0}}' },
          { name: 'pattern', detail: '验证正则', insertText: 'pattern="${1}"' },
          { name: 'multiple', detail: '多选（file/email）', insertText: 'multiple' },
          { name: 'accept', detail: '接受文件类型', insertText: 'accept="${1|image/*,video/*,audio/*,.pdf|}"' },
          { name: 'onChange', detail: '值变化事件', insertText: 'onChange={${1:handler}}' },
          { name: 'onFocus', detail: '获焦事件', insertText: 'onFocus={${1:handler}}' },
          { name: 'onBlur', detail: '失焦事件', insertText: 'onBlur={${1:handler}}' },
          { name: 'size', detail: '显示宽度（字符数）', insertText: 'size={${1:20}}' },
        ],
        button: [
          { name: 'type', detail: '按钮类型', insertText: 'type="${1|button,submit,reset|}"' },
          { name: 'disabled', detail: '禁用', insertText: 'disabled' },
          { name: 'onClick', detail: '点击事件', insertText: 'onClick={${1:handler}}' },
          { name: 'form', detail: '关联表单 ID', insertText: 'form="${1}"' },
          { name: 'name', detail: '字段名', insertText: 'name="${1}"' },
          { name: 'value', detail: '提交值', insertText: 'value="${1}"' },
          { name: 'autoFocus', detail: '自动聚焦', insertText: 'autoFocus' },
        ],
        form: [
          { name: 'action', detail: '提交 URL', insertText: 'action="${1}"' },
          { name: 'method', detail: '提交方法', insertText: 'method="${1|get,post|}"' },
          { name: 'onSubmit', detail: '提交事件', insertText: 'onSubmit={${1:handler}}' },
          { name: 'onReset', detail: '重置事件', insertText: 'onReset={${1:handler}}' },
          {
            name: 'encType',
            detail: '编码类型',
            insertText:
              'encType="${1|application/x-www-form-urlencoded,multipart/form-data,text/plain|}"',
          },
          { name: 'noValidate', detail: '禁用原生校验', insertText: 'noValidate' },
          { name: 'autoComplete', detail: '自动补全', insertText: 'autoComplete="${1|on,off|}"' },
        ],
        select: [
          { name: 'value', detail: '受控值', insertText: 'value={${1}}' },
          { name: 'defaultValue', detail: '非受控默认值', insertText: 'defaultValue="${1}"' },
          { name: 'multiple', detail: '多选', insertText: 'multiple' },
          { name: 'disabled', detail: '禁用', insertText: 'disabled' },
          { name: 'required', detail: '必填', insertText: 'required' },
          { name: 'size', detail: '显示行数', insertText: 'size={${1:4}}' },
          { name: 'name', detail: '字段名', insertText: 'name="${1}"' },
          { name: 'onChange', detail: '值变化事件', insertText: 'onChange={${1:handler}}' },
          { name: 'onFocus', detail: '获焦事件', insertText: 'onFocus={${1:handler}}' },
          { name: 'onBlur', detail: '失焦事件', insertText: 'onBlur={${1:handler}}' },
        ],
        option: [
          { name: 'value', detail: '选项值', insertText: 'value="${1}"' },
          { name: 'disabled', detail: '禁用', insertText: 'disabled' },
          { name: 'selected', detail: '选中', insertText: 'selected' },
          { name: 'label', detail: '标签文本', insertText: 'label="${1}"' },
        ],
        textarea: [
          { name: 'value', detail: '受控值', insertText: 'value={${1}}' },
          { name: 'defaultValue', detail: '非受控默认值', insertText: 'defaultValue="${1}"' },
          { name: 'placeholder', detail: '占位文本', insertText: 'placeholder="${1}"' },
          { name: 'rows', detail: '行数', insertText: 'rows={${1:4}}' },
          { name: 'cols', detail: '列数', insertText: 'cols={${1:50}}' },
          { name: 'disabled', detail: '禁用', insertText: 'disabled' },
          { name: 'readOnly', detail: '只读', insertText: 'readOnly' },
          { name: 'required', detail: '必填', insertText: 'required' },
          { name: 'maxLength', detail: '最大字符数', insertText: 'maxLength={${1:500}}' },
          { name: 'name', detail: '字段名', insertText: 'name="${1}"' },
          { name: 'autoFocus', detail: '自动聚焦', insertText: 'autoFocus' },
          { name: 'onChange', detail: '值变化事件', insertText: 'onChange={${1:handler}}' },
          { name: 'onFocus', detail: '获焦事件', insertText: 'onFocus={${1:handler}}' },
          { name: 'onBlur', detail: '失焦事件', insertText: 'onBlur={${1:handler}}' },
        ],
        label: [
          { name: 'htmlFor', detail: '关联元素 ID', insertText: 'htmlFor="${1}"' },
          { name: 'form', detail: '关联表单 ID', insertText: 'form="${1}"' },
        ],
        video: [
          { name: 'src', detail: '视频 URL', insertText: 'src="${1}"' },
          { name: 'controls', detail: '显示控件', insertText: 'controls' },
          { name: 'autoPlay', detail: '自动播放', insertText: 'autoPlay' },
          { name: 'muted', detail: '静音', insertText: 'muted' },
          { name: 'loop', detail: '循环播放', insertText: 'loop' },
          { name: 'width', detail: '宽度', insertText: 'width={${1:640}}' },
          { name: 'height', detail: '高度', insertText: 'height={${1:360}}' },
          { name: 'poster', detail: '封面图', insertText: 'poster="${1}"' },
          { name: 'preload', detail: '预加载策略', insertText: 'preload="${1|auto,metadata,none|}"' },
          { name: 'playsInline', detail: '内联播放（移动端）', insertText: 'playsInline' },
          { name: 'crossOrigin', detail: '跨域策略', insertText: 'crossOrigin="${1|anonymous,use-credentials|}"' },
          { name: 'onPlay', detail: '播放事件', insertText: 'onPlay={${1:handler}}' },
          { name: 'onPause', detail: '暂停事件', insertText: 'onPause={${1:handler}}' },
          { name: 'onEnded', detail: '播放结束', insertText: 'onEnded={${1:handler}}' },
          { name: 'onError', detail: '加载失败', insertText: 'onError={${1:handler}}' },
        ],
        audio: [
          { name: 'src', detail: '音频 URL', insertText: 'src="${1}"' },
          { name: 'controls', detail: '显示控件', insertText: 'controls' },
          { name: 'autoPlay', detail: '自动播放', insertText: 'autoPlay' },
          { name: 'muted', detail: '静音', insertText: 'muted' },
          { name: 'loop', detail: '循环播放', insertText: 'loop' },
          { name: 'preload', detail: '预加载策略', insertText: 'preload="${1|auto,metadata,none|}"' },
          { name: 'crossOrigin', detail: '跨域策略', insertText: 'crossOrigin="${1|anonymous,use-credentials|}"' },
          { name: 'onPlay', detail: '播放事件', insertText: 'onPlay={${1:handler}}' },
          { name: 'onPause', detail: '暂停事件', insertText: 'onPause={${1:handler}}' },
          { name: 'onEnded', detail: '播放结束', insertText: 'onEnded={${1:handler}}' },
          { name: 'onError', detail: '加载失败', insertText: 'onError={${1:handler}}' },
        ],
        source: [
          { name: 'src', detail: '资源 URL', insertText: 'src="${1}"' },
          { name: 'type', detail: 'MIME 类型', insertText: 'type="${1|video/mp4,video/webm,audio/mpeg,audio/ogg,image/webp,image/avif|}"' },
          { name: 'media', detail: '媒体查询', insertText: 'media="${1}"' },
          { name: 'srcSet', detail: '响应式图像集', insertText: 'srcSet="${1}"' },
          { name: 'sizes', detail: '响应式尺寸', insertText: 'sizes="${1}"' },
        ],
        iframe: [
          { name: 'src', detail: '页面 URL', insertText: 'src="${1}"' },
          { name: 'width', detail: '宽度', insertText: 'width="${1:100%}"' },
          { name: 'height', detail: '高度', insertText: 'height="${1:400}"' },
          { name: 'title', detail: '标题（无障碍）', insertText: 'title="${1}"' },
          { name: 'allowFullScreen', detail: '允许全屏', insertText: 'allowFullScreen' },
          { name: 'sandbox', detail: '沙箱策略', insertText: 'sandbox="${1|allow-scripts allow-same-origin|}"' },
          { name: 'loading', detail: '加载策略', insertText: 'loading="${1|lazy,eager|}"' },
          { name: 'referrerPolicy', detail: '引用策略', insertText: 'referrerPolicy="${1|no-referrer,origin,strict-origin-when-cross-origin|}"' },
        ],
        table: [
          { name: 'border', detail: '边框', insertText: 'border={${1:1}}' },
          { name: 'cellPadding', detail: '单元格内边距', insertText: 'cellPadding={${1:5}}' },
          { name: 'cellSpacing', detail: '单元格间距', insertText: 'cellSpacing={${1:0}}' },
          { name: 'summary', detail: '表格摘要', insertText: 'summary="${1}"' },
        ],
        td: [
          { name: 'colSpan', detail: '横跨列数', insertText: 'colSpan={${1:2}}' },
          { name: 'rowSpan', detail: '横跨行数', insertText: 'rowSpan={${1:2}}' },
          { name: 'align', detail: '水平对齐', insertText: 'align="${1|left,center,right|}"' },
          { name: 'valign', detail: '垂直对齐', insertText: 'valign="${1|top,middle,bottom|}"' },
        ],
        th: [
          { name: 'colSpan', detail: '横跨列数', insertText: 'colSpan={${1:2}}' },
          { name: 'rowSpan', detail: '横跨行数', insertText: 'rowSpan={${1:2}}' },
          { name: 'scope', detail: '表头范围', insertText: 'scope="${1|col,row,colgroup,rowgroup|}"' },
          { name: 'align', detail: '水平对齐', insertText: 'align="${1|left,center,right|}"' },
        ],
        link: [
          { name: 'href', detail: '资源 URL', insertText: 'href="${1}"' },
          { name: 'rel', detail: '关系类型', insertText: 'rel="${1|stylesheet,icon,preload,prefetch,canonical|}"' },
          { name: 'type', detail: 'MIME 类型', insertText: 'type="${1|text/css,image/x-icon|}"' },
          { name: 'media', detail: '媒体查询', insertText: 'media="${1}"' },
          { name: 'as', detail: '预加载资源类型', insertText: 'as="${1|script,style,image,font,fetch|}"' },
          { name: 'crossOrigin', detail: '跨域策略', insertText: 'crossOrigin="${1|anonymous,use-credentials|}"' },
        ],
        script: [
          { name: 'src', detail: '脚本 URL', insertText: 'src="${1}"' },
          { name: 'type', detail: '类型', insertText: 'type="${1|text/javascript,module|}"' },
          { name: 'async', detail: '异步加载', insertText: 'async' },
          { name: 'defer', detail: '延迟执行', insertText: 'defer' },
          { name: 'crossOrigin', detail: '跨域策略', insertText: 'crossOrigin="${1|anonymous,use-credentials|}"' },
          { name: 'noModule', detail: '不支持模块时回退', insertText: 'noModule' },
        ],
        meta: [
          { name: 'name', detail: '元数据名', insertText: 'name="${1|viewport,description,keywords,author,robots|}"' },
          { name: 'content', detail: '元数据内容', insertText: 'content="${1}"' },
          { name: 'charSet', detail: '字符集', insertText: 'charSet="UTF-8"' },
          { name: 'httpEquiv', detail: 'HTTP 等效头', insertText: 'httpEquiv="${1|refresh,content-type,X-UA-Compatible|}"' },
          { name: 'property', detail: 'Open Graph 属性', insertText: 'property="${1|og:title,og:description,og:image|}"' },
        ],
        ol: [
          { name: 'type', detail: '列表类型', insertText: 'type="${1|1,A,a,I,i|}"' },
          { name: 'start', detail: '起始编号', insertText: 'start={${1:1}}' },
          { name: 'reversed', detail: '倒序', insertText: 'reversed' },
        ],
        li: [
          { name: 'value', detail: '列表项编号', insertText: 'value={${1}}' },
        ],
        details: [
          { name: 'open', detail: '默认展开', insertText: 'open' },
          { name: 'onToggle', detail: '折叠切换事件', insertText: 'onToggle={${1:handler}}' },
        ],
        dialog: [
          { name: 'open', detail: '显示对话框', insertText: 'open' },
          { name: 'onClose', detail: '关闭事件', insertText: 'onClose={${1:handler}}' },
        ],
        progress: [
          { name: 'value', detail: '当前值', insertText: 'value={${1:50}}' },
          { name: 'max', detail: '最大值', insertText: 'max={${1:100}}' },
        ],
        meter: [
          { name: 'value', detail: '当前值', insertText: 'value={${1:50}}' },
          { name: 'min', detail: '最小值', insertText: 'min={${1:0}}' },
          { name: 'max', detail: '最大值', insertText: 'max={${1:100}}' },
          { name: 'low', detail: '低阈值', insertText: 'low={${1:25}}' },
          { name: 'high', detail: '高阈值', insertText: 'high={${1:75}}' },
          { name: 'optimum', detail: '最优值', insertText: 'optimum={${1:50}}' },
        ],
        canvas: [
          { name: 'width', detail: '宽度（像素）', insertText: 'width={${1:300}}' },
          { name: 'height', detail: '高度（像素）', insertText: 'height={${1:150}}' },
        ],
        col: [
          { name: 'span', detail: '横跨列数', insertText: 'span={${1:1}}' },
        ],
        colgroup: [
          { name: 'span', detail: '横跨列数', insertText: 'span={${1:1}}' },
        ],
      };

      const createTagAttrProvider = (languageId: string) => ({
        triggerCharacters: [' ', '\n', '\t'],
        provideCompletionItems: (model: editor.ITextModel, position: monaco.Position) => {
          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(0, position.column - 1);

          // 逆向扫描找到最近未闭合的 <
          let lastOpenBracket = -1;
          let depth = 0;
          for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
            if (textBeforeCursor[i] === '>') {
              depth++;
            } else if (textBeforeCursor[i] === '<') {
              if (depth === 0) {
                lastOpenBracket = i;
                break;
              }
              depth--;
            }
          }

          if (lastOpenBracket === -1) return { suggestions: [] };

          const tagContent = textBeforeCursor.substring(lastOpenBracket);

          // 排除闭合标签 </xxx 和空的 <
          if (tagContent.startsWith('</') || tagContent === '<') return { suggestions: [] };

          const tagNameMatch = tagContent.match(/^<(\w[\w.-]*)/);
          if (!tagNameMatch) return { suggestions: [] };

          const tagName = tagNameMatch[1].toLowerCase();

          // 收集已有属性，避免重复提示
          const existingAttrs = new Set<string>();
          const existingAttrPattern = /([\w-]+)(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?/g;
          const afterTagName = tagContent.replace(/^<\w[\w.-]*/, '');
          let m: RegExpExecArray | null;
          while ((m = existingAttrPattern.exec(afterTagName)) !== null) {
            existingAttrs.add(m[1]);
          }

          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const specificAttrs = tagAttributeMap[tagName] ?? [];
          const seen = new Set<string>();
          const allAttrs = [...specificAttrs, ...commonJsxAttributes].filter((attr) => {
            if (seen.has(attr.name) || existingAttrs.has(attr.name)) return false;
            seen.add(attr.name);
            return true;
          });

          const suggestions: monaco.languages.CompletionItem[] = allAttrs.map((attr) => ({
            label: attr.name,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: attr.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: { value: `**${attr.name}**\n\n${attr.detail}` },
            detail: `<${tagName}> ${attr.detail}`,
            sortText: specificAttrs.some((s) => s.name === attr.name) ? `0_${attr.name}` : `1_${attr.name}`,
            range,
          }));

          return { suggestions };
        },
      });

      const jsxLanguages = [
        'typescript',
        'typescriptreact',
        'javascript',
        'javascriptreact',
        'tsx',
        'jsx',
      ];
      jsxLanguages.forEach((lang) => {
        monaco.languages.registerCompletionItemProvider(lang, createTagAttrProvider(lang));
      });

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
      monaco.languages.registerDocumentFormattingEditProvider(
        'typescriptreact',
        createFormatProvider('typescript'),
      );
      monaco.languages.registerDocumentFormattingEditProvider(
        'javascriptreact',
        createFormatProvider('babel'),
      );

      shikiToMonaco(highlighter, monaco);

      // shikiToMonaco 会覆盖语言 tokenizer，导致 autoClosingPairs 丢失，需要在此之后重新设置
      const bracketConfig: monaco.languages.LanguageConfiguration = {
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] },
          { open: '`', close: '`', notIn: ['string'] },
          { open: '<', close: '>', notIn: ['string', 'comment'] },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' },
          { open: '<', close: '>' },
        ],
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
      };

      const languageIds = [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'javascriptreact',
        'typescriptreact',
        'json',
        'css',
        'html',
      ];
      languageIds.forEach((id) => {
        monaco.languages.setLanguageConfiguration(id, bracketConfig);
      });
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
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoClosingOvertype: 'always',
          autoSurround: 'languageDefined',
        }}
      />
    </div>
  );
};

export default MonacoEditor;
