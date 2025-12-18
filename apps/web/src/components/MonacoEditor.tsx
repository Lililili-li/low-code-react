import { useAppStore } from '@/store/modules/app';
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import { useRef, useEffect, useState } from 'react';
import type { editor } from 'monaco-editor';
import { shikiToMonaco } from '@shikijs/monaco';
import { createHighlighter, type Highlighter } from 'shiki';

export type MonacoLanguage = 'javascript' | 'typescript' | 'json' | 'css' | 'html';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
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
      langs: ['javascript', 'typescript', 'json', 'css', 'html'],
    });
  }
  return highlighterPromise;
};

const MonacoEditor = ({
  value,
  onChange,
  language = 'javascript',
  height = '300px',
  readOnly = false,
  minimap = false,
  lineNumbers = 'on',
  wordWrap = 'on',
  className,
}: MonacoEditorProps) => {
  const config = useAppStore((state) => state.config);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [highlighter, monaco] = await Promise.all([
        getHighlighter(),
        loader.init(),
      ]);

      monaco.languages.register({ id: 'javascript' });
      monaco.languages.register({ id: 'typescript' });
      monaco.languages.register({ id: 'json' });
      monaco.languages.register({ id: 'css' });
      monaco.languages.register({ id: 'html' });

      shikiToMonaco(highlighter, monaco);
      setIsReady(true);
    };

    init();
  }, []);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange: OnChange = (value) => {
    onChange?.(value || '');
  };

  if (!isReady) {
    return (
      <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className={className} style={{borderRadius: '6px', overflow: 'hidden'}}>
      <Editor
        height={height}
        language={language}
        value={value}
        theme='andromeeda'
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
        }}
      />
    </div>
  );
};

export default MonacoEditor;

