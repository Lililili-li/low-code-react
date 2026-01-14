import MonacoEditor from '@repo/ui/components/monaco-editor';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@repo/ui/components/input-group';
import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { Tree } from '@repo/ui/components/tree';
import { Save, Search, Settings, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isObject } from '@repo/shared/index';
import { useDesignStateStore } from '@/store';
import { getVariableKey, searchVariable } from '@repo/core/variable';
import { cloneDeep } from 'lodash-es';

const handleStateData = (state: Record<string, any>, parentKey: string) => {
  const result = [] as { id: string; label: string; children?: any[]; parentKey: string }[];
  Object.keys(state).forEach((key) => {
    if (isObject(state[key])) {
      result?.push({ id: key, label: key, children: handleStateData(state[key], key), parentKey });
    } else {
      result.push({ id: key, label: key, parentKey });
    }
  });
  return result;
};

const BindVariableDialog = ({
  id,
  onChange,
  onClear,
}: {
  id: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) => {
  const state = useDesignStateStore((state) => state.state);

  const stateTreeData = useMemo(() => {
    return handleStateData(cloneDeep(state), '');
  }, [state]);

  const [bindVariable, setBindVariable] = useState<string>(id);

  const [selectedVariable, setSelectedVariable] = useState<string>(getVariableKey(id));

  // 1.回显变量，将传入的变量key高亮
  // 2.点击变量，右侧显示变量
  // 3.点击保存

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" className="shrink-0">
              <Settings />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>
          <p>变量绑定</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="p-4 sm:max-w-[60%] dark:bg-[#18181b]">
        <DialogHeader>
          <DialogTitle>变量绑定</DialogTitle>
        </DialogHeader>
        <div className="bind-variable-wrap flex gap-2 h-130">
          <div className="w-[40%] flex flex-col gap-2 wrap-left">
            <div className="title text-sm">变量列表</div>
            <div className="list flex border rounded-[4px] w-full flex-1 min-h-0">
              <div className="category w-[30%]">
                <div className="border-r h-full p-4">
                  <RadioGroup>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="1" id="2" />
                      <Label htmlFor="2">Global</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="2" id="1" />
                      <Label htmlFor="1">State</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex-1"></div>
              </div>
              <div className="variable h-full flex-1">
                <ScrollArea className="h-full overflow-auto p-4 py-2">
                  <InputGroup className="h-[32px]">
                    <InputGroupInput placeholder="请输入变量名称搜索" />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                  </InputGroup>
                  <Tree
                    className="mt-2"
                    data={stateTreeData}
                    selectedId={selectedVariable}
                    onSelect={(value) => {
                      const variable = searchVariable(state, value);
                      setBindVariable(variable);
                      setSelectedVariable(value);
                    }}
                    defaultExpandedIds={['state']}
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
          <div className="wrap-right flex-1 flex flex-col gap-2">
            <div className="title text-sm">表达式</div>
            <div className="list flex flex-col">
              <div className="list-top border rounded-[4px]">
                <MonacoEditor
                  height="280px"
                  value={bindVariable}
                  language="javascript"
                  onChange={setBindVariable}
                />
              </div>
            </div>
            <div className="title text-sm">用法</div>
            <div className="usage flex-1 border rounded-[4px] min-h-0">
              <ScrollArea className="h-full overflow-auto p-2 text-sm">
                <div className="flex-col flex gap-1.5">
                  <p>
                    你可以通过点击左侧区域绑定变量或处理函数，或者点击右边的铅笔按钮切换到输入模式，输入复杂的表达式。
                  </p>
                  <p>Global为全局变量,State为页面变量</p>
                  <p>输入框内默认支持变量，写法和 JS 写法完全一致。</p>
                  <div>页面状态: this.state.xxx</div>
                  <div>字符串: "string"</div>
                  <div>数字: 123</div>
                  <div>布尔值: true / false</div>
                  <div>{`对象: { name: "张三" }`}</div>
                  <div>数组: ["1", "2"]</div>
                  <div>空值: null</div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <DialogFooter style={{ justifyContent: 'space-between' }}>
          {id && (
            <DialogClose asChild>
              <Button variant="destructive" size="sm" onClick={() => {
                onClear()
                setBindVariable('')
                setSelectedVariable('')
              }}>
                <Trash2 />
                <span>移除变量</span>
              </Button>
            </DialogClose>
          )}
          <div className="flex gap-2 justify-end flex-1">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                取消
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button size="sm" onClick={() => onChange(bindVariable)}>
                <Save />
                <span>保存</span>
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BindVariableDialog;
