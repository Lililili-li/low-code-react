import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { Button } from '@repo/ui/components/button';
import { Copy, Edit, PlusCircle, Trash2 } from 'lucide-react';

import { Search } from 'lucide-react';
import SaveVariable, { SaveVariableRef } from './components/SaveVariable';
import { useMemo, useRef, useState } from 'react';
import { useDesignStore } from '@/store/modules/design';
import Empty from '@/components/Empty';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash-es';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { BracesVariable20Filled } from '@ricons/fluent';
import { toast } from 'sonner';

const VariablePanel = () => {
  const saveVariableRef = useRef<SaveVariableRef>(null);
  const state = useDesignStore((state) => state.pageSchema.state);
  const updatePageState = useDesignStore((state) => state.updatePageState);

  const [tab, setTab] = useState('page');
  const [keywords, setKeywords] = useState('');

  // 将obj转为array 用于展示已存储的变量
  const stateObj2Array = (state: Record<string, any>) => {
    const result = [] as { key: string; defaultValue: string; type: string }[];
    Object.keys(state).forEach((key) => {
      const type = isString(state[key])
        ? 'string'
        : isNumber(state[key])
          ? 'number'
          : isBoolean(state[key])
            ? 'boolean'
            : isObject(state[key]) && !isArray(state[key])
              ? 'object'
              : isArray(state[key])
                ? 'array'
                : 'unknown';
      result.push({ key, defaultValue: state[key], type });
    });
    return result;
  };

  const filteredVariables = useMemo(() => {
    const result = stateObj2Array(state);
    return result.filter((item) => item.key.includes(keywords));
  }, [state, keywords]);

  const [activeVariable, setActiveVariable] = useState<{
    key: string;
    defaultValue: string;
    type: string;
  } | null>(null);

  const onSave = (
    variable: { key: string; defaultValue: string; type: string },
    tip = '变量保存成功',
  ) => {
    updatePageState(variable.key, variable.defaultValue);
    saveVariableRef.current?.closeDialog();
    toast.success(tip);
  };

  const onCopySave = (item: { key: string; defaultValue: string; type: string }) => {
    const newKey = item.key + '_copy';
    updatePageState(newKey, item.defaultValue);
    saveVariableRef?.current?.openDialog({
      name: newKey,
      defaultValue: item.defaultValue,
      type: item.type,
    });
    setActiveVariable({
      key: newKey,
      defaultValue: item.defaultValue,
      type: item.type,
    });
    toast.success('复制成功');
  };

  return (
    <div className="variable-panel py-2 relative h-full flex flex-col">
      <div className="filter-wrap px-2 flex flex-col gap-3">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setActiveVariable(null);
            saveVariableRef?.current?.closeDialog();
          }}
        >
          <TabsList className="h-[36px] w-full justify-center">
            <TabsTrigger value="page">页面变量</TabsTrigger>
            <TabsTrigger value="global" disabled>
              全局变量
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <InputGroup>
          <InputGroupInput
            placeholder="请输入变量名称"
            defaultValue={keywords}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                setKeywords((e.target as HTMLInputElement).value);
              }
            }}
          />
          <InputGroupAddon>
            <InputGroupButton onClick={() => {}} size="icon-xs" className="rounded-[50%]">
              <Search />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => saveVariableRef?.current?.openDialog()}
        >
          <PlusCircle className="size-4" />
          <span>添加{tab === 'global' ? '全局' : '页面'}变量</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="variable-list border-t py-3 mt-3 gap-2">
          {filteredVariables.length > 0 ? (
            <div className='flex flex-col gap-1'>
              {filteredVariables.map((item) => (
                <div
                  key={item.key}
                  className={`flex group justify-between text-sm font-medium px-2 py-1.5 cursor-pointer hover:bg-[#f5f5f5] hover:dark:bg-[#3b3b3c] transition-all ${activeVariable?.key === item.key ? 'bg-[#f5f5f5] dark:bg-[#3b3b3c]' : ''}`}
                >
                  <div className="name flex items-center gap-1 flex-1">
                    <BracesVariable20Filled className="size-4.5" />
                    <span
                      style={{ lineHeight: 1 }}
                      className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                    >
                      state. {item.key}
                    </span>
                  </div>
                  <div className="btn-group flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="p-0 size-6 rounded-[50%]"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveVariableRef?.current?.openDialog({
                          name: item.key,
                          defaultValue: item.defaultValue,
                          type: item.type,
                        });
                        setActiveVariable(item);
                      }}
                    >
                      <Edit className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      className="p-0 size-6 rounded-[50%]"
                      onClick={() => onCopySave(item)}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-0 size-6 rounded-[50%]"
                      onClick={() => {
                        updatePageState(item.key, undefined, true);
                        toast.success('删除成功')
                        if (activeVariable?.key === item.key) {
                          setActiveVariable(null)
                          saveVariableRef?.current?.closeDialog()
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无数据" />
          )}
        </div>
      </ScrollArea>
      <SaveVariable
        ref={saveVariableRef}
        onClose={() => {
          setActiveVariable(null);
        }}
        onSave={onSave}
      />
    </div>
  );
};

export default VariablePanel;
