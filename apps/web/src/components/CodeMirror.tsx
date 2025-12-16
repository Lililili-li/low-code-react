import { useAppStore } from '@/store/modules/app';
import OriginalCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac';
import { andromeda } from '@uiw/codemirror-theme-andromeda';

interface CodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'javascript' | 'json' | 'css';
}

const languageExtensions = {
  javascript: javascript({ jsx: true }),
  json: json(),
  css: css(),
};

const CodeMirror = ({ value, onChange, language = 'javascript' }: CodeMirrorProps) => {
  const config = useAppStore((state) => state.config);

  return (
    // <div className="code-mirror"></div>
    <OriginalCodeMirror
      value={value}
      onChange={onChange}
      theme={config.theme === 'light' ? noctisLilac : andromeda}
      extensions={[languageExtensions[language], EditorView.lineWrapping]}
      minHeight="200px"
      className="rounded-xs"
      maxWidth="100%"
    />
  );
};

export default CodeMirror;
