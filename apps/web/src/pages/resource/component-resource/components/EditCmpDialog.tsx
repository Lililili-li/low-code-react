import { useRequest } from 'ahooks';
import componentApi from '@/api/component';
import { ChevronLeft, CircleHelp, Save } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@repo/ui/components/button';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { cloneDeep } from 'lodash-es';
import { useDesignStateStore } from '@/store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Textarea } from '@repo/ui/components/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@repo/ui/components/input';
import { Switch } from '@repo/ui/components/switch';
import Upload from '@/components/Upload';
import commonApi from '@/api/common';
import { createFunctionComponent } from '@repo/shared/index';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Checkbox } from '@repo/ui/components/checkbox';
import Assistant from '@repo/ui/components/assistant'

const dependencies = {
  react: '^19.1.1',
  axios: '^1.13.2',
  dayjs: '^1.11.19',
  ahooks: '^3.9.6',
  'react-router': '^7.10.0',
  'lodash-es': '^4.17.22',
  'lucide-react': '^0.555.0',
  state: '用于调用当前页面的变量，预览时不可见',
};

interface EditCmpDialogProps {
  id: string;
  onBack: () => void;
}

const tabs = [
  {
    label: '编辑代码',
    value: '1',
  },
  {
    label: '编辑信息',
    value: '2',
  },
];

const EditCmpDialog = ({ id, onBack }: EditCmpDialogProps) => {
  const navigate = useNavigate();

  const { data: component } = useRequest(() => componentApi.getComponentById(id), {
    onSuccess: (data) => {
      setCode(cloneDeep(data.code));
      setRenderCode(cloneDeep(data.code));
      form.reset({
        code: data.code,
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        cover: data.cover,
      });
    },
  });

  const [hasChange, setHasChange] = useState(false);

  const [code, setCode] = useState('');

  const [renderCode, setRenderCode] = useState('');

  const [activeTab, setActiveTab] = useState('1');

  const state = useDesignStateStore((state) => state.state);

  const Component = createFunctionComponent(renderCode, {
    imports: {
      state,
    },
  });

  const handleSave = (value: string) => {
    setRenderCode(value);
    setHasChange(false);
    form.setValue('code', value);
  };

  const { run: updateComponent, loading } = useRequest(
    (id, params) => componentApi.updateComponent(id, params),
    {
      manual: true,
      onSuccess: () => {
        toast.success('保存成功');
      },
    },
  );
  const formSchema = z.object({
    name: z.string().min(1, {
      message: '组件名称不能为空',
    }),
    description: z.string().optional(),
    code: z.string().min(1, {
      message: '组件代码不能为空',
    }),
    is_active: z.boolean(),
    cover: z.string(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
      is_active: true,
      cover: '',
    },
  });

  const [codeVisibleType, setCodeVisibleType] = useState<'code' | 'dependencies'>('code');
  const codeVisibleTypeRef = useRef(codeVisibleType); // 用于更新显示的code值

  const updateCodeVisibleType = (type: 'code' | 'dependencies') => {
    codeVisibleTypeRef.current = type;
    setCodeVisibleType(type);
  };

  const codeVisible =
    codeVisibleType === 'code' ? code || '' : JSON.stringify(dependencies, null, 2);

  const handleCodeChange = (value: string) => {
    if (codeVisibleTypeRef.current === 'code') {
      setCode(value);
      setHasChange(true);
    }
  };

  const [toggleAi, setToggleAi] = useState(false);

  return (
    <div className="flex flex-col h-full px-3">
      <div className="header flex h-[50px] items-center justify-between text-sm relative">
        <div className="left flex h-full ">
          <div
            className="back flex items-center cursor-pointer"
            onClick={() => {
              navigate('/manage/resource/component');
              onBack();
            }}
          >
            <ChevronLeft className="size-5" />
            <span>返回</span>
          </div>
          <div className="tab-list flex items-center h-[42px] gap-[4px] absolute bottom-0 left-[60px]">
            {tabs.map((item) => {
              return (
                <div
                  key={item.value}
                  className={`tab w-[75px] h-full relative rounded-tl-md rounded-tr-md justify-center border flex pt-2 cursor-pointer ${item.value === activeTab ? 'dark:border-b-[#18181b] text-primary z-20 border-b-white' : 'border-b-transparent'}`}
                  onClick={() => setActiveTab(item.value)}
                >
                  {hasChange && item.value === '1' && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="line absolute bottom-0 left-0 right-0 h-px dark:bg-[#232323] bg-[#e5e7eb]"></div>
        <div className="right">
          <div className="actions flex items-center gap-2">
            <div className="flex items-center gap-2 border h-8 px-2 rounded-md cursor-pointer" onClick={() => setToggleAi((prev) => !prev)}>
              <Checkbox
                id="terms-checkbox-2"
                name="terms-checkbox-2"
                checked={toggleAi}
                onCheckedChange={(checked) => console.log(checked)}
              />
              AI助手
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                if (hasChange) {
                  toast.warning('请先保存代码');
                  return;
                }
                updateComponent(component?.id, { ...form.getValues(), code: renderCode });
              }}
              disabled={loading}
            >
              <Save />
              <span>{loading ? '保存中...' : '保存'}</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="content flex-1 pb-2">
        {activeTab === '1' ? (
          <div className={`grid grid-cols-${toggleAi?'3': '2'} gap-2 h-full`}>
            <div className="code-input flex-1 h-full flex flex-col gap-2">
              <div className="tabs flex justify-between items-center border-b h-[40px]">
                <div
                  className={`tab cursor-pointer h-full flex items-center px-2 border-b-2 ${codeVisibleType === 'code' ? 'border-b-primary border-b-2' : 'border-b-transparent'}`}
                  onClick={() => updateCodeVisibleType('code')}
                >
                  index.tsx
                </div>
                <div
                  className={`tab cursor-pointer h-full flex gap-1 items-center px-2 border-b-2 ${codeVisibleType === 'dependencies' ? 'border-b-primary border-b-2' : 'border-b-transparent'}`}
                  onClick={() => updateCodeVisibleType('dependencies')}
                >
                  <span>Dependencies</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="size-4 text-orange-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>相关依赖可以直接使用无需引入</p>
                      <p>例如：useState、ahooks、axios等</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="edit-container flex-1">
                <MonacoEditor
                  value={codeVisible}
                  language={codeVisibleType === 'code' ? 'typescriptreact' : 'json'}
                  onChange={handleCodeChange}
                  onSave={handleSave}
                  height={'100%'}
                  className="h-full w-full"
                  readOnly={loading || codeVisibleType === 'dependencies'}
                />
              </div>
            </div>
            <div className="preview h-full flex-1 flex flex-col gap-2">
              <div className="title border-b h-[40px] flex items-center shrink-0">组件预览</div>
              <div className="preview-cmp flex-1">
                <Component />
              </div>
            </div>
            {
              toggleAi && (
                <div className="ai-assistant flex-1 flex flex-col gap-2 h-full">
                  <div className="title border-b h-[40px] flex items-center shrink-0">Ai助手</div>
                  <Assistant />
                </div>
              )
            }
          </div>
        ) : (
          <div className="form-container w-[50%]">
            <Form {...form}>
              <form>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="grid">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <FormLabel className="w-[100px] shrink-0">
                            <span className="text-red-500">*</span>组件名称
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="组件名称" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row h-[32px] items-center">
                        <FormLabel className="w-[100px] shrink-0">
                          <span className="text-red-500">*</span>是否启用
                        </FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start">
                        <FormLabel className="w-[100px] shrink-0">功能描述</FormLabel>
                        <FormControl>
                          <Textarea placeholder="功能描述" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cover"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start">
                        <FormLabel className="w-[100px] shrink-0">封面图</FormLabel>
                        <FormControl>
                          <Upload
                            value={[{ url: field.value || '', uid: Date.now().toString() }]}
                            onChange={(value) => {
                              if (value.length === 1 && !!value[0].url) {
                                console.log(value);
                                field.onChange(value[0].url);
                              }
                            }}
                            maxCount={1}
                            onUpload={async (file) => {
                              const formData = new FormData();
                              formData.append('file', file);
                              const response = await commonApi.uploadFile(formData);
                              return response?.path as string;
                            }}
                            description={
                              <div className="text-xs text-muted-foreground mt-1">
                                支持png / jpg / jpeg / gif 等类型图片
                              </div>
                            }
                            className="w-full h-[300px]"
                            height={300}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCmpDialog;
