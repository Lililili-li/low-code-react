import { Button } from '@repo/ui/components/button';
import { HelpCircle, X } from 'lucide-react';
import { Ref, useImperativeHandle, useRef, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from '@/components/Select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import BindVariableDialog from '../../variable-panel/components/BindVariableDialog';
import { DatasourceSchema, DataType } from '@repo/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import ParamsTab from './ParamsTab';
import BodyParamsTab from './BodyParamsTab';
import HeaderParamsTab from './HeaderParamsTab';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { Switch } from '@repo/ui/components/switch';
import { testInterface } from '@repo/core/datasource';
import { useDesignStateStore } from '@/store';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Label } from '@repo/ui/components/label';
import Empty from '@/components/Empty';

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: '变量名称不能为空',
  }),
  method: z.string().min(1, {
    message: '请求方法不能为空',
  }),
  url: z.string().min(1, {
    message: '请求地址不能为空',
  }),
  description: z.string(),
  timeout: z.object({
    type: z.enum(['Normal', 'JsExpression']),
    value: z.string(),
  }),
  schedule: z.object({
    type: z.enum(['Normal', 'JsExpression']),
    value: z.string(),
  }),
  initRequest: z.boolean(),
  params: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      dataType: z.string(),
    }),
  ),
  bodyParams: z.object({
    type: z.string(),
    params: z.object({
      'form-data': z.array(
        z.object({
          key: z.string(),
          value: z.string(),
          dataType: z.string(),
        }),
      ),
      'x-www-form-urlencoded': z.array(
        z.object({
          key: z.string(),
          value: z.string(),
          dataType: z.string(),
        }),
      ),
      json: z.string(),
      none: z.string(),
    }),
  }),
  headerParams: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      dataType: z.string(),
    }),
  ),
  handleResult: z.string(),
  handleParams: z.string(),
  requestType: z.enum(['http', 'sql']),
  sqlParams: z.object({
    key: z.string(),
    value: z.string(),
  }),
});

type FormValues = z.infer<typeof FormSchema>;

const createDefaultValues = (): FormValues => ({
  id: Date.now().toString(),
  name: '',
  method: 'GET',
  url: '',
  description: '',
  timeout: {
    type: 'Normal',
    value: '5000',
  },
  schedule: {
    type: 'Normal',
    value: '0',
  },
  initRequest: false,
  params: [
    {
      key: '',
      value: '',
      dataType: DataType.Normal,
    },
  ],
  bodyParams: {
    type: 'none',
    params: {
      'form-data': [
        {
          key: '',
          value: '',
          dataType: DataType.Normal,
        },
      ],
      'x-www-form-urlencoded': [
        {
          key: '',
          value: '',
          dataType: DataType.Normal,
        },
      ],
      json: '',
      none: '',
    },
  },
  headerParams: [
    {
      key: '',
      value: '',
      dataType: DataType.Normal,
    },
  ],
  handleResult: `function handleSuccess(res, state) { 
 //如需查看结果，需将res返回 
  console.log('处理返回后的结果.....');
  return res;
}`,
  handleParams: `function handleParams(params, state) { 
 //params为请求参数，state为变量
  console.log('处理返回后的结果.....',params);
  return params;
}`,
  requestType: 'http',
  sqlParams: {
    key: 'sql',
    value: 'select * from table',
  },
});

export interface SaveDatasourceRef {
  openDialog: (type: string, detail?: DatasourceSchema) => void;
  closeDialog: () => void;
}

const SaveDatasource = ({ ref, onClose }: { ref: Ref<SaveDatasourceRef>; onClose: () => void }) => {
  const addDatasource = useDesignDatasourceStore((state) => state.addDatasource);
  const updateDatasource = useDesignDatasourceStore((state) => state.updateDatasource);
  const state = useDesignStateStore((state) => state.state);

  const [visible, setVisible] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  };

  const closeDialog = () => {
    setVisible(false);
    onClose();
    clearResetTimer();
    resetTimer.current = setTimeout(() => {
      form.reset(createDefaultValues());
      resetTimer.current = null;
    }, 500);
    setParamsTab('params');
    setResponse('')
  };
  const [openType, setOpenType] = useState<string>('');
  const openDialog = (type: string, detail?: DatasourceSchema) => {
    clearResetTimer();
    setVisible(true);
    setOpenType(type);
    
    // Convert DatasourceSchema to match form schema expectations
    const resetData = detail ? {
      ...detail,
      timeout: {
        type: detail.timeout.type as 'Normal' | 'JsExpression',
        value: detail.timeout.value,
      },
      schedule: {
        type: detail.schedule.type as 'Normal' | 'JsExpression',
        value: detail.schedule.value,
      },
      params: detail.params || [],
      headerParams: detail.headerParams || [],
      bodyParams: detail.bodyParams || {
        type: 'none',
        params: {
          'form-data': [],
          'x-www-form-urlencoded': [],
          json: '',
          none: '',
        },
      },
      handleResult: detail.handleResult || '',
      initRequest: detail.initRequest || false,
      sqlParams: detail.sqlParams || {
        key: '',
        value: '',
      },
    } : createDefaultValues();
    
    form.reset(resetData);
  };
  useImperativeHandle(ref, () => ({
    openDialog,
    closeDialog,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: createDefaultValues(),
  });

  const onSubmit = () => {
    form.handleSubmit((data) => {
      if (openType === 'copy' || openType === 'create') {
        addDatasource({ ...data, id: Date.now().toString() });
      } else {
        updateDatasource(data.id, data);
      }
      closeDialog();
    })();
  };

  const [response, setResponse] = useState('');
  const scrollAreaRef = useRef<HTMLElement | null>(null);

  const testConnection = () => {
    form.handleSubmit((data) => {
      testInterface(data, state)
        .then((res) => {
          setResponse(JSON.stringify(res, null, 2));
        })
        .catch((err) => {
          setResponse(JSON.stringify(err, null, 2));
        })
        .finally(() => {
          scrollAreaRef.current?.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
          });
        });
    })();
  };

  const [paramsTab, setParamsTab] = useState('params');

  return (
    <div
      className={`save-variable-container flex flex-col h-full overflow-hidden ${visible ? 'w-[700px]' : 'w-0 border-0'} duration-500 transition-[width] absolute right-0 top-0 translate-x-full border dark:bg-[#18181b] bg-white border-t-0 border-b-0`}
      style={{ zIndex: 10 }}
    >
      <div className="save-variable-header min-w-[400px] flex items-center justify-between border-b p-2 px-3">
        <div className="title text-[16px]">
          {openType === 'create'
            ? '添加'
            : openType === 'check'
              ? '查看'
              : openType === 'copy'
                ? '复制'
                : '编辑'}
          数据源
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={testConnection} className="h-[28px]">
            <span>测试连接</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>只能查看接口返回，不可以修改变量</p>
              </TooltipContent>
            </Tooltip>
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            className="h-[28px] w-[60px]"
            disabled={openType === 'check'}
          >
            保存
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="size-6 rounded-[50%] p-0"
            onClick={closeDialog}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <ScrollArea
        className="flex-1 min-h-0 px-3 w-full"
        ref={scrollAreaRef as Ref<HTMLDivElement> | undefined}
      >
        <div className="save-variable-content min-w-[350px]">
          <Form {...form}>
            <form autoComplete="off">
              <div className="flex flex-col gap-5 py-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>
                        <span className="text-red-500">*</span>
                        接口名称
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="请输入接口名称" {...field} disabled={openType === 'check'}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 w-[200px]">
                        <FormLabel className="h-4">
                          <span className="text-red-500">*</span>
                          请求方式
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={[
                              {
                                label: 'GET',
                                value: 'GET',
                              },
                              {
                                label: 'POST',
                                value: 'POST',
                              },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="请选择请求方式"
                            className="w-full"
                            disabled={openType === 'check'}
                          ></Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 flex-1">
                        <FormLabel>
                          <span className="text-red-500">*</span>
                          <span>请求地址</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>自动拼接全局配置的BaseURL</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请求地址(自动拼接全局配置的BaseURL)" disabled={openType === 'check'}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>接口描述</FormLabel>
                      <FormControl>
                        <Input placeholder="接口描述（可选）" {...field} disabled={openType === 'check'}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 flex-1">
                        <FormLabel className="h-4">超时时长(ms)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="超时时长（可选）"
                              value={field.value.value}
                              onChange={(e) =>
                                field.onChange({ ...field.value, value: e.target.value })
                              }
                              type='text'
                            />
                            <BindVariableDialog
                              id={
                                field.value.type === DataType.JsExpression
                                  ? field.value.value.toString()
                                  : ''
                              }
                              onChange={(value) =>
                                field.onChange({
                                  ...field.value,
                                  value,
                                  type: DataType.JsExpression,
                                })
                              }
                              onClear={() =>
                                field.onChange({
                                  ...field.value,
                                  value: '5000',
                                  type: DataType.Normal,
                                })
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 flex-1">
                        <FormLabel>
                          <span>定时调用(ms)</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>定时调用接口时间，单位为毫秒，0为仅调用一次</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="定时调用(ms)"
                              value={field.value.value}
                              onChange={(e) =>
                                field.onChange({ ...field.value, value: e.target.value })
                              }
                              type='text'
                            />
                            <BindVariableDialog
                              id={
                                field.value.type === DataType.JsExpression
                                  ? field.value.value.toString()
                                  : ''
                              }
                              onChange={(value) =>
                                field.onChange({
                                  ...field.value,
                                  value,
                                  type: DataType.JsExpression,
                                })
                              }
                              onClear={() =>
                                field.onChange({
                                  ...field.value,
                                  value: '0',
                                  type: DataType.Normal,
                                })
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initRequest"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 flex-1">
                        <FormLabel>
                          <span>是否初始请求</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>定时调用接口时间，单位为毫秒，0为仅调用一次</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <div className="h-8 flex items-center">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 flex-1">
                      <FormLabel>
                        <span>请求类型</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="size-4 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>sql请求需要后台单独出接口，并防止sql注入风险</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <div className="h-8 flex items-center">
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            orientation="horizontal"
                            className="flex items-center gap-3"
                          >
                            <div className="flex items-center gap-2 cursor-pointer">
                              <RadioGroupItem value="http" id="r1" />
                              <Label htmlFor="r1" className="cursor-pointer">
                                普通请求
                              </Label>
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer">
                              <RadioGroupItem value="sql" id="r2" />
                              <Label htmlFor="r2" className="cursor-pointer">
                                SQL请求
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="flex flex-col gap-2 flex-1">
                  <FormLabel>
                    <span>{form.watch('requestType') === 'http'? '请求参数': 'SQL查询'}</span>
                  </FormLabel>
                  <FormControl>
                    {form.watch('requestType') === 'http' ? (
                      <Tabs value={paramsTab} onValueChange={setParamsTab}>
                        <TabsList>
                          <TabsTrigger value="params">Params</TabsTrigger>
                          {form.watch('method') === 'POST' && (
                            <TabsTrigger value="body">
                              <span>Body</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle />
                                </TooltipTrigger>
                                <TooltipContent>请求头会替换为选中的格式</TooltipContent>
                              </Tooltip>
                            </TabsTrigger>
                          )}
                          <TabsTrigger value="header">Header</TabsTrigger>
                        </TabsList>
                        <TabsContent value="params">
                          <ParamsTab form={form} />
                        </TabsContent>
                        <TabsContent value="body">
                          {form.watch('method') === 'POST' && <BodyParamsTab form={form} />}
                        </TabsContent>
                        <TabsContent value="header">
                          <HeaderParamsTab form={form} />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="flex flex-col">
                        {form.watch('method') === 'POST' ? (
                          <div className="flex flex-col gap-2">
                            <FormField
                              control={form.control}
                              name="sqlParams"
                              render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                  <FormLabel>
                                    <div className="flex items-center gap-2">
                                      <span>key</span>
                                    </div>
                                  </FormLabel>
                                  <FormControl>
                                    <Input value={field.value.key} onChange={(e) => field.onChange({ ...field.value, key: e.target.value })} placeholder='请输入key值'/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="sqlParams"
                              render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                  <FormLabel>
                                    <div className="flex items-center gap-2">
                                      <span>value</span>
                                    </div>
                                  </FormLabel>
                                  <FormControl>
                                    <MonacoEditor
                                      value={field.value.value}
                                      onChange={(value) =>
                                        field.onChange({ ...field.value, value })
                                      }
                                      language="sql"
                                      height={100}
                                      lineNumbers='off'
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ) : (
                          <Empty description="SQL请求只能是post请求" />
                        )}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="handleParams"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <span>请求参数处理函数</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>参数解释：params为请求参数,state为变量</p>
                              <p>返回值解释：返回值为处理后的请求参数</p>
                              <p>GET请求时params会自动转换为url参数</p>
                              <p>POST请求时params会自动转换为body参数</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <MonacoEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          language="javascript"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="handleResult"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <span>结果处理函数</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="size-4 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>res参数为接口返回结果,state参数为变量</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <MonacoEditor
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          language="javascript"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {response && (
                  <FormItem className="flex flex-col gap-2 flex-1">
                    <FormLabel>
                      <span>返回结果</span>
                    </FormLabel>
                    <FormControl>
                      <MonacoEditor
                        value={response}
                        onChange={(value) => setResponse(value)}
                        language="json"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SaveDatasource;
