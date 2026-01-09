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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@repo/ui/components/input';
import Select from '@/components/Select';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { useRequest } from 'ahooks';
import resourceApi, { MapResourceParams } from '@/api/resource';
import { ChevronDown } from 'lucide-react';
import { Spinner } from '@repo/ui/components/spinner';

export interface SaveMapSourceRef {
  openDialog: (type: 'create' | 'edit', data?: any) => void;
  closeDialog: () => void;
}

const SaveMapSource = ({ ref }: { ref: React.RefObject<SaveMapSourceRef | null> }) => {
  const [openType, setOpenType] = useState<'create' | 'edit'>('create');
  const [open, setOpen] = useState(false);

  const openDialog = (type: 'create' | 'edit', data?: any) => {
    setOpenType(type);
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    openDialog,
    closeDialog,
  }));

  const FormSchema = z.object({
    map_name: z.string().min(1, { message: '地图名称不能为空' }),
    map_level: z.string().min(1, { message: '地图级别不能为空' }),
    map_code: z.string().min(1, { message: '地图编码不能为空' }),
    parent_id: z.string(),
    parent_code: z.number(),
    map_resource: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      map_name: '',
      map_level: '1',
      map_code: '',
      map_resource: '',
      parent_id: '0',
      parent_code: 0,
    },
  });

  const { runAsync: onSubmit, loading: createLoading } = useRequest(
    (params: MapResourceParams) => resourceApi.createMapResource(params),
    {
      manual: true,
    },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{openType === 'create' ? '添加' : '编辑'}地图资源</DialogTitle>
          <DialogDescription>在这里填写地图资源,编辑完成后点击保存退出。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit({
                ...data,
                map_level: Number(data.map_level),
                map_code: Number(data.map_code),
                parent_id: Number(data.parent_id),
              });
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      <span>父级菜单</span>
                    </FormLabel>
                    <FormControl>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex justify-between items-center w-full"
                        disabled
                      >
                        <span>{field.value}</span>
                        <ChevronDown />
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="map_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">*</span>
                        <span>地图名称</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="请输入地图名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="map_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">*</span>
                        <span>地图编号</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="请输入地图编号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="map_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      <span>地图级别</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      options={[
                        {
                          label: '国家',
                          value: '1',
                        },
                        {
                          label: '省份',
                          value: '2',
                        },
                        {
                          label: '城市',
                          value: '3',
                        },
                        {
                          label: '区域',
                          value: '4',
                        },
                      ]}
                      placeholder="请选择地图级别"
                      className="w-full"
                      onChange={(value) => field.onChange(value)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="map_resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span>地图JSON数据</span>
                    </FormLabel>
                    <FormControl>
                      <MonacoEditor
                        value={field.value}
                        lineNumbers="off"
                        language="json"
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm" variant="outline">
                  取消
                </Button>
              </DialogClose>
              <Button size="sm" type="submit">
                {createLoading && <Spinner />}
                确定
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMapSource;
