# @repo/react-repl

一个独立的React REPL组件，支持实时代码编辑和预览。

## 特性

- 🚀 实时代码编译和预览
- 📝 支持多文件编辑
- 🎨 支持JavaScript、TypeScript、CSS、SCSS、JSX、TSX
- 🌙 支持浅色/深色主题
- 📱 响应式设计
- ⚡ 基于Babel的实时编译
- 🎯 可配置的组件属性
- 🔧 只读模式支持

## 安装

```bash
npm install @repo/react-repl
# 或
yarn add @repo/react-repl
# 或
pnpm add @repo/react-repl
```

## 使用

### 基本用法

```jsx
import React from 'react';
import { ReactRepl } from '@repo/react-repl';
import '@repo/react-repl/styles.css';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <ReactRepl />
    </div>
  );
}
```

### 自定义配置

```jsx
import React from 'react';
import { ReactRepl } from '@repo/react-repl';
import '@repo/react-repl/styles.css';

function App() {
  const initialFiles = [
    {
      id: '1',
      name: 'CustomComponent.jsx',
      language: 'jsx',
      content: `
function CustomComponent() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>自定义组件</h1>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

export default CustomComponent;
      `
    }
  ];

  return (
    <ReactRepl
      initialFiles={initialFiles}
      theme="light"
      height="600px"
      showHeader={true}
      showFileTabs={true}
      readOnly={false}
      onCodeChange={(files) => {
        console.log('代码已更新:', files);
      }}
    />
  );
}
```

## API

### ReactRepl Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `initialFiles` | `FileState[]` | 默认示例文件 | 初始文件列表 |
| `theme` | `'light' \| 'dark'` | `'dark'` | 主题模式 |
| `height` | `string \| number` | `'100vh'` | 组件高度 |
| `onCodeChange` | `(files: FileState[]) => void` | - | 代码变更回调 |
| `showHeader` | `boolean` | `true` | 是否显示头部 |
| `showFileTabs` | `boolean` | `true` | 是否显示文件标签 |
| `readOnly` | `boolean` | `false` | 是否为只读模式 |

### FileState

```typescript
interface FileState {
  id: string;
  name: string;
  content: string;
  language: 'javascript' | 'typescript' | 'css' | 'scss' | 'jsx' | 'tsx';
  hidden?: boolean;
}
```

### CompileError

```typescript
interface CompileError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}
```

## 样式

组件需要导入CSS文件：

```jsx
import '@repo/react-repl/styles.css';
```

或者你可以在你的CSS中导入：

```css
@import '@repo/react-repl/styles.css';
```

## 自定义样式

你可以通过CSS变量来自定义主题：

```css
.react-repl.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --accent-color: #1890ff;
  /* 更多变量... */
}

.react-repl.dark {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --text-primary: #cccccc;
  --accent-color: #1890ff;
  /* 更多变量... */
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 许可证

MIT
