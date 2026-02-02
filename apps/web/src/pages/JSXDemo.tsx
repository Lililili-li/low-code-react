import React, { useState } from 'react';
import { executeJSCode, createFunctionComponent } from '@repo/shared/index';
import { IconSearch } from '@douyinfe/semi-icons';
import { Heart } from 'lucide-react';
import request from '@repo/shared/request';

const CustomCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    style={{
      padding: '15px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      marginBottom: '10px',
    }}
  >
    <h3 style={{ color: '#4CAF50', marginTop: 0 }}>{title}</h3>
    {children}
  </div>
);

const Demo = () => {
  const [state, setState] = useState({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com',
  });

  const jsCode1 = `
    function Counter() {
      const [count, setCount] = useState(0);
      
      return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>计数器组件 (完整JS代码)</h3>
          <p>当前计数: {count}</p>
          <button onClick={() => setCount(count + 1)}>增加</button>
          <button onClick={() => setCount(count - 1)} style={{ marginLeft: '10px' }}>减少</button>
        </div>
      );
    }
  `;

  const jsCode2 = `
    function TodoList() {
      const [todos, setTodos] = useState(['学习React', '使用Babel']);
      const [input, setInput] = useState('');
      
      const addTodo = () => {
        if (input.trim()) {
          setTodos([...todos, input]);
          setInput('');
        }
      };
      
      return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>待办事项 (带状态管理)</h3>
          <div>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入待办事项"
              style={{ padding: '5px', marginRight: '10px' }}
            />
            <button onClick={addTodo}>添加</button>
          </div>
          <ul>
            {todos.map((todo, index) => (
              <li key={index}>{todo}</li>
            ))}
          </ul>
        </div>
      );
    }
  `;

  const jsCodeWithImports = `
    function ComponentWithLibrary() {
      const [liked, setLiked] = useState(false);
      request.get('/data').then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
      return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>使用外部组件库</h3>
          <CustomCard title="自定义卡片组件">
            <p>这是传入的自定义组件</p>
          </CustomCard>
          
          <button 
            onClick={() => alert('搜索按钮被点击')}
            style={{ 
              padding: '8px 16px', 
              marginRight: '10px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <IconSearch style={{ width: '16px', height: '16px' }} />
            搜索
          </button>
          <div>{state.name}</div>
          <div>{state.age}</div>
          <div>{state.email}</div>
          
          <button 
            onClick={() => setLiked(!liked)}
            style={{ 
              padding: '8px 16px',
              background: liked ? '#ff4d4f' : '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Heart style={{ width: '16px', height: '16px', fill: liked ? 'white' : 'none' }} />
            {liked ? '已喜欢' : '喜欢'}
          </button>
        </div>
      );
    }
  `;

  const jsCodeWithScope = `
    function UserProfile() {
      return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>用户信息 (使用外部数据)</h3>
          <p><strong>姓名:</strong> {userName}</p>
          <p><strong>年龄:</strong> {userAge}</p>
          <p><strong>邮箱:</strong> {userEmail}</p>
          <button onClick={onSave}>保存信息</button>
        </div>
      );
    }
  `;

  const Component1 = executeJSCode(jsCode1);
  const Component2 = executeJSCode(jsCode2);
  const Component3 = executeJSCode(jsCodeWithImports, {
    imports: {
      IconSearch,
      Heart,
      CustomCard,
      state,
      request,
    },
  });
  const Component4 = createFunctionComponent(jsCodeWithScope, {
    scope: {
      userName: '张三',
      userAge: 25,
      userEmail: 'zhangsan@example.com',
      onSave: () => alert('保存成功！'),
    },
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>JSX/JS 代码动态执行示例</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        支持完整的JS代码、React Hooks、外部组件库和自定义数据注入
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <h2>示例1: 完整JS函数组件 (带useState)</h2>
          <Component1 />
        </div>

        <div>
          <h2>示例2: 复杂状态管理</h2>
          <Component2 />
        </div>

        <div>
          <h2>示例3: 使用外部组件和图标库</h2>
          <Component3 />
        </div>

        <div>
          <h2>示例4: 注入外部数据和函数</h2>
          <Component4 />
        </div>

        <div
          style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}
        >
          <h3>📖 使用文档</h3>
          <pre
            style={{
              background: '#333',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
            }}
          >
            {`// 1. 执行完整JS代码 (推荐用于函数组件)
import { executeJSCode } from '../utils/jsxTransform'

const code = \`
  function MyComponent() {
    const [count, setCount] = useState(0);
    return <div onClick={() => setCount(count + 1)}>{count}</div>;
  }
\`;

const Component = executeJSCode(code);
<Component />

// 2. 传入外部组件和库
import { Button } from '@repo/ui/components/button'
import { IconSearch } from '@douyinfe/semi-icons'
import { Heart } from 'lucide-react'
import dayjs from 'dayjs'

const Component = executeJSCode(code, {
  imports: {
    Button,           // UI组件
    IconSearch,       // Semi图标
    Heart,            // Lucide图标
    CustomCard,       // 自定义组件
    dayjs,            // 日期库
  }
});

// 3. 传入数据和函数
const Component = executeJSCode(code, {
  scope: {
    userName: 'John',
    onSave: () => console.log('saved'),
    apiUrl: 'https://api.example.com'
  }
});

// 4. 只渲染JSX表达式 (不是完整组件)
import { createComponentFromJSX } from '../utils/jsxTransform'

const jsx = '<div>{message}</div>';
const element = createComponentFromJSX(jsx, {
  scope: { message: 'Hello' }
});`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Demo;
