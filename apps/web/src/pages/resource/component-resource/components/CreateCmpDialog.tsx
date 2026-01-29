import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { useEffect, useImperativeHandle, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import Select from '@/components/Select';
import { Textarea } from '@repo/ui/components/textarea';
import ReactIcon from './ReactIcon';
import { useRequest } from 'ahooks';
import componentApi from '@/api/component';
import { toast } from 'sonner';
import { Switch } from '@repo/ui/components/switch';

export interface CreateCmpDialogRefProps {
  onOpenDialog: () => void;
  onCloseDialog: () => void;
}

const templates = [
  {
    id: '1',
    name: '基础模板',
    category_id: 'react',
    code: `const Demo = () => { 
      return (
        <div>demo</div>
      )
    }`,
    description: '内置React代码，结构简单',
  },
  {
    id: '2',
    name: 'ECharts组件',
    category_id: 'echarts',
    code: ``,
    description: '基于ECharts，结构简单',
  },
];

const CreateCmpDialog = ({
  ref,
  categories,
}: {
  ref?: React.Ref<CreateCmpDialogRefProps>;
  categories?: { label: string; value: string }[];
}) => {
  const [visible, setVisible] = useState(false);

  const onOpenDialog = () => {
    setVisible(true);
  };

  const onCloseDialog = () => {
    form.reset();
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    onOpenDialog,
    onCloseDialog,
  }));

  const [templateType, setTemplateType] = useState<'react' | 'echarts'>('react');
  const formSchema = z.object({
    name: z.string().min(1, {
      message: '组件名称不能为空',
    }),
    category_id: z.string().min(1, {
      message: '组件类型不能为空',
    }),
    description: z.string().optional(),
    code: z.string().min(1, {
      message: '组件代码不能为空',
    }),
    is_active: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      code: templates[0].code,
      is_active: true,
    },
  });

  const { runAsync: createComponent, loading } = useRequest(
    () => componentApi.createComponent({ id: Date.now().toString(), ...form.getValues() }),
    {
      manual: true,
      onSuccess: () => {
        toast.success('添加组件成功');
        onCloseDialog();
      },
    },
  );

  useEffect(() => {
    form.setValue('category_id', templateType);
  }, [templateType]);

  useEffect(() => {
    form.setValue('category_id', categories?.[0]?.value || '');
  }, [categories]);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-[600px] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createComponent)}>
            <DialogHeader>
              <DialogTitle>添加组件</DialogTitle>
              <DialogDescription>填写组件信息，填写完成后点击确定添加</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <FormItem>
                  <FormLabel>初始化模板</FormLabel>
                  <div className="template-list grid grid-cols-2 gap-4">
                    {templates.map((item) => {
                      return (
                        <div
                          className={`template-item border rounded-md cursor-pointer py-4 flex justify-center flex-col items-center ${templateType === item.category_id ? 'border-primary' : ''}`}
                          onClick={() => setTemplateType(item.category_id as 'react' | 'echarts')}
                          key={item.id}
                        >
                          <div
                            className={`name flex flex-col gap-2 items-center ${templateType === item.category_id ? 'text-primary' : ''} `}
                          >
                            <ReactIcon className="size-8" />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="description text-sm mt-2">{item.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </FormItem>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">*</span>组件名称
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="组件名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">*</span>组件类型
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          options={categories || []}
                          placeholder="请选择组件类型"
                          className="w-full"
                          disabled
                        />
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
                  <FormItem className='flex flex-row'>
                    <FormLabel>
                      <span className="text-red-500">*</span>是否启用
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>功能描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="功能描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? '保存中...' : '确定'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCmpDialog;
