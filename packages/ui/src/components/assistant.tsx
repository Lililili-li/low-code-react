import { useState } from 'react';
import { ScrollArea } from './scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Textarea } from './textarea';
import { cn } from '@repo/ui/lib/utils';
import { Bot, Send, User, Copy, Check, RotateCcw } from 'lucide-react';
import Welcome from './welcome';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么可以帮助你的吗？',
    timestamp: new Date('2024-01-15 10:00:00'),
  },
  {
    id: '2',
    role: 'user',
    content: '请帮我解释一下什么是 React Hooks？',
    timestamp: new Date('2024-01-15 10:01:00'),
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'React Hooks 是 React 16.8 引入的新特性，它允许你在函数组件中使用 state 和其他 React 特性。\n\n主要的 Hooks 包括：\n\n1. **useState** - 用于在函数组件中添加状态\n2. **useEffect** - 用于处理副作用，如数据获取、订阅等\n3. **useContext** - 用于访问 React Context\n4. **useRef** - 用于创建可变的引用\n5. **useMemo / useCallback** - 用于性能优化',
    timestamp: new Date('2024-01-15 10:01:30'),
  },
  {
    id: '4',
    role: 'user',
    content: '谢谢！那 useEffect 的依赖数组是什么作用？',
    timestamp: new Date('2024-01-15 10:02:00'),
  },
  {
    id: '5',
    role: 'assistant',
    content:
      'useEffect 的依赖数组用于控制 effect 何时执行：\n\n- **空数组 `[]`**：effect 只在组件挂载时执行一次\n- **有依赖 `[dep1, dep2]`**：当依赖项变化时重新执行\n- **无依赖数组**：每次渲染后都执行\n\n```javascript\nuseEffect(() => {\n  // 这里的代码会在 count 变化时执行\n  console.log("Count changed:", count);\n}, [count]);\n```',
    timestamp: new Date('2024-01-15 10:02:30'),
  },
];

const MessageBubble = ({ message }: { message: Message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group flex gap-3 px-4 py-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="size-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="size-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-linear-to-br from-violet-500 to-purple-600 text-white">
              <Bot className="size-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted dark:bg-muted/50 rounded-bl-md',
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <span className="text-xs text-muted-foreground px-1">
            {message.timestamp.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && (
            <>
              <Button variant="ghost" size="icon" className="size-6" onClick={handleCopy}>
                {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="size-6">
                <RotateCcw className="size-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Assistant = () => {
  const [messages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="dark:bg-[#23262e] h-full rounded-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
        <Avatar className="size-9">
          <AvatarFallback className="bg-linear-to-br from-violet-500 to-purple-600 text-white">
            <Bot className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">AI 助手</span>
          <span className="text-xs text-muted-foreground">在线</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="size-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {
          messages.length === 0 && <Welcome />
        }
      </div>

      {/* Input Area */}
      <div className="shrink-0 flex flex-col gap-2 border-border/50 h-[20%]">
        <div className='border-t border-b p-4 mb-2'>
          <div className="text-sm text-muted-foreground">快捷提示:</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
              用Shadcn Ui写一个按钮
            </span>
          </div>
        </div>
        <div className="relative px-4">
          <Textarea
            placeholder="请输入对vue组件功能的描述"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="min-h-[80px] pr-20 resize-none rounded-lg bg-muted/30 dark:bg-[#36373b] border-muted"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground"
            disabled={!inputValue.trim()}
          >
            <Send className="size-4 mr-1" />
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
