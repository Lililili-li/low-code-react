import { useRequest } from 'ahooks';
import componentApi from '@/api/component';
import { ChevronLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@repo/ui/components/button';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { cloneDeep } from 'lodash-es';
import { createFunctionComponent } from '@/utils/jsxTransform';
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

interface EditCmpDialogProps {
  id: string;
  onBack: () => void
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
        cover: data.cover
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

  return (
    <div className="flex flex-col h-full px-3 pt-2">
      <div className="header flex h-[40px] items-center justify-between text-sm relative">
        <div className="left flex h-full ">
          <div
            className="back flex items-center cursor-pointer"
            onClick={() => {
              navigate('/manage/resource/component');
              onBack()
            }}
          >
            <ChevronLeft className="size-5" />
            <span>返回</span>
          </div>
          <div className="tab-list flex items-center h-full gap-[4px] absolute bottom-0 left-[60px]">
            {tabs.map((item) => {
              return (
                <div
                  key={item.value}
                  className={`tab w-[75px] text-center relative rounded-tl-md rounded-tr-md justify-center h-full border flex items-center cursor-pointer ${item.value === activeTab ? 'dark:border-b-[#18181b] text-primary z-20 border-b-white' : 'border-b-transparent'}`}
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
          <div className="actions">
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
      <div className="content flex-1 flex gap-2 py-2">
        {activeTab === '1' ? (
          <>
            <div className="code-input flex-1 h-full">
              <MonacoEditor
                value={code || ''}
                language="typescriptreact"
                onChange={(value) => {
                  setCode(value);
                  setHasChange(true);
                }}
                onSave={handleSave}
                height={'100%'}
                className="h-full"
                readOnly={loading}
              />
            </div>
            <div className="preview h-full flex-1">
              <Component />
            </div>
          </>
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
                              if (value.length === 1 && !!value[0].url ) {
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
