export interface FileState {
  id: string;
  name: string;
  content: string;
  language: 'javascript' | 'typescript' | 'css' | 'scss'  | 'typescriptreact' | 'javascriptreact';
  hidden?: boolean;
}

export interface CompileError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ReactReplProps {
  initialFiles?: FileState[];
  theme?: 'light' | 'dark';
  height?: string | number;
  onCodeChange?: (files: FileState[]) => void;
  showHeader?: boolean;
  showFileTabs?: boolean;
  readOnly?: boolean;
}
