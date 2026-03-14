import React from 'react';
import ReactRepl from './src/ReactRepl';
import '@repo/react-repl/styles.css';

// 基本使用示例
export const BasicExample = () => {
  return <ReactRepl />;
};

// 自定义配置示例
export const CustomExample = () => {
  const customFiles = [
    {
      id: '1',
      name: 'HelloWorld.jsx',
      language: 'jsx' as const,
      content: `
function HelloWorld() {
  const [message, setMessage] = React.useState('Hello, World!');
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>{message}</h1>
      <button 
        onClick={() => setMessage('Hello, React REPL!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        更改消息
      </button>
    </div>
  );
}

export default HelloWorld;
      `
    }
  ];

  return (
    <div style={{ height: '600px' }}>
      <ReactRepl
        initialFiles={customFiles}
        theme="light"
        showHeader={true}
        showFileTabs={true}
        onCodeChange={(files) => {
          console.log('代码已更新:', files);
        }}
      />
    </div>
  );
};

// 只读模式示例
export const ReadOnlyExample = () => {
  return (
    <ReactRepl
      theme="dark"
      height="400px"
      readOnly={true}
      showFileTabs={false}
    />
  );
};
