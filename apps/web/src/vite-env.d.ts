/// <reference types="vite/client" />

declare module 'monaco-themes/themes/*.json' {
  const value: import('monaco-editor').editor.IStandaloneThemeData;
  export default value;
}
